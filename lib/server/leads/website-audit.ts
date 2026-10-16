import http from "node:http";
import https from "node:https";
import dns from "node:dns";
import net, { type LookupFunction } from "node:net";
import { SocialLinks, WebsiteAudit } from "@/lib/leads/types";
import { isPrivateAddress } from "@/lib/server/security/ip";

/**
 * Fetches a prospect's homepage and detects their marketing stack.
 *
 * SSRF hardening: only http(s) on ports 80/443; every DNS answer is checked
 * inside the socket's `lookup` hook (so the checked IP is the one connected to —
 * no DNS-rebinding gap); redirects are followed manually (max 3) and re-checked;
 * the body is capped and the request times out.
 */

const MAX_BYTES = 1_500_000;
const TIMEOUT_MS = 8_000;
const MAX_REDIRECTS = 3;
const USER_AGENT = "Mozilla/5.0 (compatible; DigivideasSiteAudit/1.0; +https://digivideas.com)";

export class AuditBlockedError extends Error {}

const safeLookup: LookupFunction = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) return callback(error, "", 0);
    const list = addresses as dns.LookupAddress[];
    const blocked = list.find((entry) => isPrivateAddress(entry.address));
    if (blocked || list.length === 0) {
      return callback(new AuditBlockedError("Bu adres güvenlik nedeniyle denetlenemez"), "", 0);
    }
    if ((options as dns.LookupOptions).all) {
      return (callback as unknown as (err: null, addresses: dns.LookupAddress[]) => void)(null, list);
    }
    callback(null, list[0].address, list[0].family);
  });
};

export function validateAuditUrl(raw: string): URL {
  let url: URL;
  const trimmed = raw.trim();
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    throw new AuditBlockedError("Sadece http/https desteklenir");
  }
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    throw new AuditBlockedError("Geçersiz web sitesi adresi");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new AuditBlockedError("Sadece http/https desteklenir");
  if (url.port && url.port !== "80" && url.port !== "443") throw new AuditBlockedError("Standart dışı port engellendi");
  if (url.username || url.password) throw new AuditBlockedError("Kimlik bilgisi içeren adresler engellendi");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new AuditBlockedError("Yerel adresler denetlenemez");
  }
  // Node skips the DNS lookup hook for IP literals, so they are checked here.
  if (net.isIP(host) && isPrivateAddress(host)) {
    throw new AuditBlockedError("Bu adres güvenlik nedeniyle denetlenemez");
  }
  return url;
}

interface FetchResult {
  status: number;
  location?: string;
  body: string;
}

function requestOnce(url: URL): Promise<FetchResult> {
  const client = url.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.request(
      url,
      {
        method: "GET",
        lookup: safeLookup,
        timeout: TIMEOUT_MS,
        headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml", "Accept-Language": "tr,en;q=0.8" },
      },
      (res) => {
        const status = res.statusCode ?? 0;
        if (status >= 300 && status < 400 && res.headers.location) {
          res.resume();
          return resolve({ status, location: res.headers.location, body: "" });
        }
        let size = 0;
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_BYTES) {
            res.destroy();
            return;
          }
          chunks.push(chunk);
        });
        res.on("close", () => resolve({ status, body: Buffer.concat(chunks).toString("utf8") }));
        res.on("error", reject);
      }
    );
    req.on("timeout", () => req.destroy(new Error("Zaman aşımı")));
    req.on("error", reject);
    req.end();
  });
}

const SOCIAL_PATTERNS: Record<keyof SocialLinks, RegExp> = {
  instagram: /https?:\/\/(?:www\.)?instagram\.com\/(?!p\/|reel\/|explore\/|accounts\/)([a-z0-9_.]{2,30})/i,
  facebook: /https?:\/\/(?:www\.|m\.|tr-tr\.)?facebook\.com\/(?!sharer|share|plugins|tr\/|dialog)([a-z0-9.\-]{3,80})/i,
  tiktok: /https?:\/\/(?:www\.)?tiktok\.com\/@([a-z0-9_.]{2,30})/i,
  youtube: /https?:\/\/(?:www\.)?youtube\.com\/(?:@|channel\/|c\/|user\/)([a-z0-9_.\-]{2,60})/i,
  linkedin: /https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/(?:company|in)\/([a-z0-9_\-%]{2,80})/i,
  x: /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/(?!intent|share|home)([a-z0-9_]{2,15})/i,
};

const EMAIL_PATTERN = /[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,24}/g;
const EMAIL_EXACT = /^[a-z0-9._%+-]{1,64}@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,24}$/;
const BAD_EMAIL_PARTS = [
  "sentry", "wixpress", "example.", "domain.com", "email.com", "yourdomain", "sizinsiteniz", "@2x", "@3x",
  "godaddy", "schema.org", "w3.org", "jquery", "bootstrap", "localhost", "u00", "ornek.com",
];
const BAD_EMAIL_EXT = /\.(png|jpe?g|gif|webp|svg|css|js|ico|woff2?)$/;

/** Cloudflare "email protection" obfuscation: hex string XOR'ed with its first byte. */
function decodeCfEmail(hex: string): string {
  const key = parseInt(hex.slice(0, 2), 16);
  let out = "";
  for (let i = 2; i < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
  return out;
}

/** Contact e-mails found on a page (mailto links, plain text, Cloudflare-protected), max 5. */
export function extractEmails(html: string): string[] {
  if (!html) return [];
  const text = html.replace(/&#64;|&commat;|\[at\]|\(at\)/gi, "@");
  const found: string[] = [];
  for (const match of Array.from(text.matchAll(/mailto:([^"'?>\s]+)/gi))) {
    try {
      found.push(decodeURIComponent(match[1]));
    } catch {
      found.push(match[1]);
    }
  }
  for (const match of Array.from(html.matchAll(/data-cfemail="([0-9a-fA-F]+)"/g))) found.push(decodeCfEmail(match[1]));
  found.push(...(text.match(EMAIL_PATTERN) ?? []));

  const result: string[] = [];
  for (const raw of found) {
    const email = raw.trim().replace(/^[.,;:]+|[.,;:]+$/g, "").toLowerCase();
    if (!EMAIL_EXACT.test(email) || BAD_EMAIL_EXT.test(email)) continue;
    if (BAD_EMAIL_PARTS.some((part) => email.includes(part))) continue;
    if (!result.includes(email)) result.push(email);
  }
  return result.slice(0, 5);
}

/** Pure HTML analysis (unit-tested). */
export function analyzeHtml(html: string): Omit<WebsiteAudit, "url" | "finalUrl" | "reachable" | "status" | "https" | "loadMs" | "checkedAt" | "error"> {
  const socials: SocialLinks = {};
  (Object.keys(SOCIAL_PATTERNS) as (keyof SocialLinks)[]).forEach((key) => {
    const match = html.match(SOCIAL_PATTERNS[key]);
    if (match) socials[key] = match[0].replace(/["'<>\s].*$/, "");
  });
  const title = html.match(/<title[^>]*>([^<]{0,300})<\/title>/i)?.[1]?.trim();
  // The backreference keeps an apostrophe inside a double-quoted value (and vice versa).
  const metaDescription =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=(["'])([\s\S]{0,500}?)\1/i)?.[2] ||
    html.match(/<meta[^>]+content=(["'])([\s\S]{0,500}?)\1[^>]+name=["']description["']/i)?.[2];

  return {
    title,
    metaDescription,
    hasViewport: /<meta[^>]+name=["']viewport["']/i.test(html),
    socials,
    emails: extractEmails(html),
    hasMetaPixel: /connect\.facebook\.net\/[^"']*fbevents\.js|fbq\(\s*['"]init/i.test(html),
    hasGoogleAnalytics: /googletagmanager\.com\/gtag\/js\?id=G-|google-analytics\.com\/(analytics|ga)\.js|gtag\(\s*['"]config['"]\s*,\s*['"]G-/i.test(html),
    hasGoogleTagManager: /googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]{4,}/.test(html),
    hasGoogleAds: /gtag\(\s*['"]config['"]\s*,\s*['"]AW-|googleads\.g\.doubleclick\.net/i.test(html),
    hasWhatsAppLink: /wa\.me\/|api\.whatsapp\.com\/send/i.test(html),
  };
}

export async function auditWebsite(rawUrl: string): Promise<WebsiteAudit> {
  let url = validateAuditUrl(rawUrl);
  const startedAt = Date.now();
  const base: WebsiteAudit = {
    url: url.toString(),
    reachable: false,
    https: url.protocol === "https:",
    hasViewport: false,
    socials: {},
    emails: [],
    hasMetaPixel: false,
    hasGoogleAnalytics: false,
    hasGoogleTagManager: false,
    hasGoogleAds: false,
    hasWhatsAppLink: false,
    checkedAt: new Date().toISOString(),
  };

  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
      const result = await requestOnce(url);
      if (result.location) {
        url = validateAuditUrl(new URL(result.location, url).toString());
        continue;
      }
      return {
        ...base,
        ...analyzeHtml(result.body),
        finalUrl: url.toString(),
        https: url.protocol === "https:",
        reachable: result.status >= 200 && result.status < 400,
        status: result.status,
        loadMs: Date.now() - startedAt,
      };
    }
    return { ...base, error: "Çok fazla yönlendirme" };
  } catch (error) {
    if (error instanceof AuditBlockedError) throw error;
    return { ...base, error: (error as Error).message || "Siteye ulaşılamadı" };
  }
}
