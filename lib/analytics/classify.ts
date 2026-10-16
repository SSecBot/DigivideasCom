import { DeviceType, TrafficChannel } from "@/lib/analytics/types";

/** Lightweight user-agent and traffic-source classification (no third-party deps). */

const BOT_PATTERN =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|discord|curl|wget|python|axios|node-fetch|go-http|java\/|httpclient|monitor|uptime/i;

export function isBot(userAgent: string): boolean {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

export function parseDevice(userAgent: string): DeviceType {
  if (/ipad|tablet|(android(?!.*mobile))|kindle|silk/i.test(userAgent)) return "Tablet";
  if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(userAgent)) return "Mobil";
  return "Masaüstü";
}

export function parseBrowser(userAgent: string): string {
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/opr\/|opera/i.test(userAgent)) return "Opera";
  if (/samsungbrowser/i.test(userAgent)) return "Samsung Internet";
  if (/yabrowser/i.test(userAgent)) return "Yandex";
  if (/instagram/i.test(userAgent)) return "Instagram (uygulama içi)";
  if (/fban|fbav/i.test(userAgent)) return "Facebook (uygulama içi)";
  if (/firefox|fxios/i.test(userAgent)) return "Firefox";
  if (/chrome|crios/i.test(userAgent)) return "Chrome";
  if (/safari/i.test(userAgent)) return "Safari";
  return "Diğer";
}

export function parseOs(userAgent: string): string {
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
  if (/android/i.test(userAgent)) return "Android";
  if (/windows/i.test(userAgent)) return "Windows";
  if (/mac os x|macintosh/i.test(userAgent)) return "macOS";
  if (/cros/i.test(userAgent)) return "ChromeOS";
  if (/linux/i.test(userAgent)) return "Linux";
  return "Diğer";
}

const SEARCH_ENGINES = /(^|\.)(google|bing|yandex|duckduckgo|yahoo|ecosia|baidu|qwant|brave)\./i;
const SOCIAL_NETWORKS =
  /(^|\.)(facebook|fb|instagram|l\.instagram|t\.co|twitter|x|linkedin|lnkd|tiktok|youtube|pinterest|reddit|threads|whatsapp|telegram)\./i;
const EMAIL_HOSTS = /(^|\.)(mail\.google|outlook\.live|mail\.yahoo|mail\.yandex)\./i;
const PAID_MEDIUMS = /^(cpc|ppc|paid|paidsocial|paid_social|paid-social|display|cpm|ads?)$/i;

export interface ChannelInput {
  referrerHost?: string;
  siteHost?: string;
  utmSource?: string;
  utmMedium?: string;
  hasClickId?: boolean;
}

/** Maps a hit to a GA-like default channel group. */
export function classifyChannel(input: ChannelInput): TrafficChannel {
  const medium = (input.utmMedium || "").toLowerCase();
  const source = (input.utmSource || "").toLowerCase();

  if (input.hasClickId || PAID_MEDIUMS.test(medium)) return "Ücretli Reklam";
  if (medium === "email" || medium === "e-posta" || source === "newsletter") return "E-posta";
  if (medium === "social" || medium === "sosyal" || SOCIAL_NETWORKS.test(`${source}.`)) return "Sosyal Medya";
  if (medium === "organic") return "Organik Arama";

  const host = (input.referrerHost || "").toLowerCase();
  if (!host || (input.siteHost && host === input.siteHost.toLowerCase())) return "Doğrudan";
  if (EMAIL_HOSTS.test(host)) return "E-posta";
  if (SEARCH_ENGINES.test(host)) return "Organik Arama";
  if (SOCIAL_NETWORKS.test(`${host}.`)) return "Sosyal Medya";
  return "Yönlendirme";
}

export function referrerHostOf(referrer: string | undefined): string | undefined {
  if (!referrer) return undefined;
  try {
    const url = new URL(referrer);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return undefined;
  }
}

/** Reads a 2-letter country code set by a CDN / reverse proxy, if any. */
export function countryFromHeaders(headers: Headers): string | undefined {
  const value =
    headers.get("cf-ipcountry") ||
    headers.get("x-vercel-ip-country") ||
    headers.get("x-country-code") ||
    headers.get("cloudfront-viewer-country");
  return value && /^[A-Z]{2}$/i.test(value) && value.toUpperCase() !== "XX" ? value.toUpperCase() : undefined;
}
