import type { Metadata } from "next";

/** Central SEO configuration. The public URL comes from NEXT_PUBLIC_SITE_URL. */

export const SITE_NAME = "digivideas";
export const SITE_LOCALE = "tr_TR";
export const DEFAULT_TITLE = "digivideas | Dijital Reklam Ajansı – İzmir";
export const DEFAULT_DESCRIPTION =
  "İzmir merkezli dijital reklam ajansı digivideas; sosyal medya yönetimi, Meta & Google Ads performans pazarlaması, kreatif prodüksiyon, web tasarım ve SEO hizmetleriyle markanızı büyütür.";
export const DEFAULT_KEYWORDS = [
  "digivideas",
  "dijital reklam ajansı",
  "izmir dijital reklam ajansı",
  "izmir reklam ajansı",
  "torbalı reklam ajansı",
  "sosyal medya yönetimi izmir",
  "meta ads ajansı",
  "google ads ajansı",
  "performans pazarlaması",
  "kreatif prodüksiyon",
  "web tasarım izmir",
  "seo ajansı izmir",
];
export const CONTACT = {
  email: "info@digivideas.com",
  phone: "+905492115561",
  city: "Torbalı",
  region: "İzmir",
  country: "TR",
};

export const DEFAULT_OG_IMAGE = "/opengraph-image";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://digivideas.com";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Trims text to a meta-description friendly length on a word boundary. */
export function toMetaDescription(text: string | undefined, max = 160): string {
  const clean = (text || "").replace(/[#*`>_]/g, "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max * 0.6))}…`;
}

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
}

export function buildMetadata(input: PageMetaInput): Metadata {
  const description = toMetaDescription(input.description);
  const image = input.image && !input.image.startsWith("data:") ? input.image : DEFAULT_OG_IMAGE;
  const images = [{ url: absoluteUrl(image) }];
  return {
    title: input.title,
    description,
    keywords: input.keywords,
    alternates: { canonical: input.path },
    openGraph: {
      title: input.title,
      description,
      url: input.path,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type: input.type ?? "website",
      images,
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: images.map((item) => item.url),
    },
    ...(input.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
