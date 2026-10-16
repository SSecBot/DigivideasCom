import type { Browser, Page } from "playwright-core";
import { PlaceLead } from "@/lib/leads/types";

/**
 * Free alternative to the Places API: drives a headless browser through
 * google.com/maps (same approach as the LrWebs Analiz desktop app).
 * Needs a Chromium-based browser on the server: run `pnpm exec playwright-core install chromium`,
 * or set PLAYWRIGHT_CHROMIUM_PATH, or have Chrome / Edge installed.
 * Google may rate-limit or show a CAPTCHA; the scrape then stops with an error (CAPTCHAs are never bypassed).
 */

export class ScraperUnavailableError extends Error {}
export class ScraperBlockedError extends Error {}
export class ScrapeCancelledError extends Error {}

export interface ScrapeHooks {
  onProgress: (percent: number, message: string) => void;
  onPlace: (place: PlaceLead) => void;
  isCancelled: () => boolean;
}

const DETAIL_JS = `() => {
  const q = s => document.querySelector(s);
  const txt = s => ((q(s) || {}).textContent || '').trim();
  const name = txt('h1.DUwDvf') || txt('div[role="main"] h1') || txt('h1');
  const category = txt('button.DkEaL') || txt('span.mgr77e button') || '';
  let rating = '', reviews = '';
  const box = q('div.F7nice');
  if (box) {
    const r = box.querySelector('span[aria-hidden="true"]');
    rating = r ? r.textContent.trim() : '';
    const rv = [...box.querySelectorAll('span[aria-label]')].find(s => /yorum|review|değerlendirme/i.test(s.getAttribute('aria-label')));
    reviews = rv ? rv.getAttribute('aria-label') : ((box.textContent.match(/\\(([\\d.,]+)\\)/) || [,''])[1]);
  }
  const addrBtn = q('button[data-item-id="address"]');
  const addr = addrBtn ? (addrBtn.getAttribute('aria-label') || addrBtn.textContent || '') : '';
  const webA = q('a[data-item-id="authority"]');
  const web = webA ? webA.href : '';
  const phoneBtn = q('button[data-item-id^="phone:tel:"]');
  const phone = phoneBtn ? phoneBtn.getAttribute('data-item-id').replace('phone:tel:', '') : '';
  const closed = /kalıcı olarak kapandı|permanently closed/i.test(document.body.innerText.slice(0, 4000));
  const temporarilyClosed = /geçici olarak kapalı|temporarily closed/i.test(document.body.innerText.slice(0, 4000));
  return { name, category, rating, reviews, addr, web, phone, closed, temporarilyClosed };
}`;

interface RawDetail {
  name: string;
  category: string;
  rating: string;
  reviews: string;
  addr: string;
  web: string;
  phone: string;
  closed: boolean;
  temporarilyClosed: boolean;
}

/** Google wraps outbound links as /url?q=...; unwrap them. */
export function cleanWebsite(href: string): string | undefined {
  if (!href) return undefined;
  try {
    const url = new URL(href);
    if (url.hostname.includes("google.") && url.pathname === "/url") {
      return url.searchParams.get("q") || url.searchParams.get("url") || undefined;
    }
    return url.protocol === "http:" || url.protocol === "https:" ? href : undefined;
  } catch {
    return undefined;
  }
}

/** Stable id from the Maps URL ("!1s0x...:0x..."), falling back to the URL path. */
export function placeKey(href: string): string {
  const match = href.match(/!1s(0x[0-9a-f]+:0x[0-9a-f]+)/i);
  return match ? `maps:${match[1]}` : `maps:${href.split("?")[0]}`;
}

export function coordinatesFromUrl(href: string): { lat?: number; lng?: number } {
  const match = href.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  return match ? { lat: Number(match[1]), lng: Number(match[2]) } : {};
}

export function parseRating(text: string): number | undefined {
  const match = (text || "").match(/\d+[.,]?\d*/);
  const value = match ? Number(match[0].replace(",", ".")) : NaN;
  return Number.isFinite(value) && value <= 5 ? value : undefined;
}

export function parseCount(text: string): number | undefined {
  const digits = (text || "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : undefined;
}

export function toPlaceLead(href: string, listName: string, detail: RawDetail): PlaceLead {
  const phone = detail.phone?.trim() || undefined;
  return {
    placeId: placeKey(href),
    name: detail.name || listName || "İsimsiz işletme",
    address: (detail.addr || "").replace(/^(Adres|Address)\s*:\s*/i, "").trim(),
    ...coordinatesFromUrl(href),
    rating: parseRating(detail.rating),
    ratingCount: parseCount(detail.reviews),
    website: cleanWebsite(detail.web),
    phone,
    internationalPhone: phone,
    mapsUrl: href,
    businessStatus: detail.closed ? "CLOSED_PERMANENTLY" : detail.temporarilyClosed ? "CLOSED_TEMPORARILY" : "OPERATIONAL",
    types: [],
    primaryTypeLabel: detail.category || undefined,
  };
}

async function launchBrowser(): Promise<Browser> {
  const { chromium } = await import("playwright-core");
  const attempts: Parameters<typeof chromium.launch>[0][] = [];
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) attempts.push({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH });
  attempts.push({}, { channel: "chrome" }, { channel: "msedge" });

  const errors: string[] = [];
  for (const options of attempts) {
    try {
      return await chromium.launch({ headless: true, ...options });
    } catch (error) {
      errors.push(String((error as Error).message || error).split("\n")[0]);
    }
  }
  throw new ScraperUnavailableError(
    "Sunucuda tarayıcı bulunamadı. Proje klasöründe `pnpm exec playwright-core install --with-deps chromium` " +
      "komutunu çalıştırın ya da PLAYWRIGHT_CHROMIUM_PATH ayarlayın. Ayrıntı: " +
      errors.slice(0, 2).join(" | ")
  );
}

async function handleConsent(page: Page) {
  if (!page.url().includes("consent.")) return;
  // Privacy-preserving choice first
  for (const name of ["Tümünü reddet", "Reject all"]) {
    const button = page.getByRole("button", { name });
    if (await button.count()) {
      await button.first().click();
      await page.waitForLoadState("domcontentloaded");
      return;
    }
  }
}

function assertNotBlocked(page: Page) {
  const url = page.url();
  if (url.includes("/sorry/") || url.includes("recaptcha")) {
    throw new ScraperBlockedError(
      "Google bu sunucudan gelen otomatik aramaları geçici olarak engelledi (CAPTCHA). Bir süre sonra tekrar deneyin " +
        "ya da GOOGLE_MAPS_API_KEY ile resmi API'yi kullanın."
    );
  }
}

export async function scrapeGoogleMaps(query: string, limit: number, hooks: ScrapeHooks): Promise<number> {
  const checkCancel = () => {
    if (hooks.isCancelled()) throw new ScrapeCancelledError("Tarama iptal edildi");
  };

  hooks.onProgress(2, "Tarayıcı başlatılıyor…");
  const browser = await launchBrowser();
  try {
    // Headless Chrome announces itself as "HeadlessChrome" and Google then serves a reduced page
    // without review counts; use the same browser's regular user agent instead.
    const probe = await browser.newPage();
    const userAgent = (await probe.evaluate(() => navigator.userAgent)).replace("HeadlessChrome", "Chrome");
    await probe.close();
    const context = await browser.newContext({ locale: "tr-TR", viewport: { width: 1366, height: 900 }, userAgent });
    await context.route("**/*", (route) =>
      ["image", "media", "font"].includes(route.request().resourceType()) ? route.abort() : route.continue()
    );
    const page = await context.newPage();

    await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(query)}?hl=tr`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await handleConsent(page);
    assertNotBlocked(page);
    try {
      await page.waitForSelector('div[role="feed"], h1.DUwDvf', { timeout: 25_000 });
    } catch {
      assertNotBlocked(page);
      throw new ScraperBlockedError("Google Haritalar sonuç listesi yüklenemedi (bağlantı veya engelleme sorunu).");
    }

    // 1) Collect candidate links by scrolling the result feed
    let links: [string, string][] = [];
    if (await page.$('div[role="feed"]')) {
      let stale = 0;
      let last = 0;
      for (;;) {
        checkCancel();
        const anchors = await page.$$eval('div[role="feed"] a.hfpxzc', (elements) =>
          elements.map((el) => [(el as HTMLAnchorElement).href, el.getAttribute("aria-label") || ""] as [string, string])
        );
        const seen = new Set<string>();
        links = anchors.filter(([href]) => {
          const key = placeKey(href);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        hooks.onProgress(Math.min(25, 3 + Math.round((22 * links.length) / limit)), `Liste taranıyor… ${links.length} işletme`);
        if (links.length >= limit) break;
        if (await page.locator("text=/Listenin sonuna|reached the end of the list/i").count()) break;
        stale = links.length === last ? stale + 1 : 0;
        if (stale >= 5) break;
        last = links.length;
        await page.evaluate(() => document.querySelector('div[role="feed"]')?.scrollBy(0, 4000));
        await page.waitForTimeout(1200);
      }
    } else {
      links = [[page.url(), ""]];
    }
    links = links.slice(0, limit);

    // 2) Open each place and read its details
    let found = 0;
    for (let i = 0; i < links.length; i += 1) {
      checkCancel();
      const [href, listName] = links[i];
      hooks.onProgress(25 + Math.round((70 * i) / links.length), `${i + 1}/${links.length} işletme inceleniyor: ${listName}`);
      try {
        if (page.url() !== href) await page.goto(href, { waitUntil: "domcontentloaded", timeout: 45_000 });
        assertNotBlocked(page);
        await page.waitForSelector("h1.DUwDvf, div[role='main'] h1", { timeout: 15_000 });
        // The rating/review box renders a moment after the title; places without reviews never get it.
        await page
          .waitForSelector('div.F7nice [aria-label*="yorum"], div.F7nice [aria-label*="review"]', { timeout: 3_000 })
          .catch(() => undefined);
        await page.waitForTimeout(400);
        const detail = (await page.evaluate(`(${DETAIL_JS})()`)) as RawDetail;
        hooks.onPlace(toPlaceLead(href, listName, detail));
        found += 1;
      } catch (error) {
        if (error instanceof ScraperBlockedError) throw error;
        // skip a single place that failed to load
      }
    }
    await context.close();
    return found;
  } finally {
    await browser.close();
  }
}
