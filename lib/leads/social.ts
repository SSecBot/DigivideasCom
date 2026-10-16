/**
 * Hosts that are not a business's own website. On Google Maps many small businesses
 * list their Instagram page or a marketplace store as "website".
 */
const NON_WEBSITE_HOSTS = [
  "facebook.com", "instagram.com", "linktr.ee", "wa.me", "whatsapp.com", "twitter.com", "x.com", "tiktok.com",
  "youtube.com", "linkedin.com", "business.site", "sites.google.com", "t.me", "sahibinden.com",
  "yemeksepeti.com", "trendyol.com", "hepsiburada.com", "getir.com",
];

export function hostOf(url: string | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export function isSocialUrl(url: string | undefined): boolean {
  const host = hostOf(url);
  return Boolean(host) && NON_WEBSITE_HOSTS.some((item) => host === item || host.endsWith(`.${item}`));
}

/** The business's own website, or undefined when it only has a social / marketplace link. */
export function ownWebsite(url: string | undefined): string | undefined {
  return url && !isSocialUrl(url) ? url : undefined;
}
