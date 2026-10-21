import {
  BlogPost,
  ContentCollection,
  ContentSnapshot,
  ContentStatus,
  CustomerItem,
  FAQItem,
  LegalPage,
  LegalPageSlug,
  MetricItem,
  PromoItem,
  ServiceItem,
  SiteNarrative,
  TagItem,
} from "@/lib/types/cms";
import { clampString, safeHref, safeImageSrc, toStringArray } from "@/lib/utils/sanitize";
import { slugify } from "@/lib/utils/slugify";

/**
 * Server-side normalizers for CMS payloads sent by the admin panel.
 * They never trust the client: unknown fields are dropped, strings are length-capped
 * and every URL is passed through the safe-URL helpers.
 */

const SHORT = 200;
const MEDIUM = 1000;
const LONG = 50_000;
const IMAGE = 3_000_000; // legacy base64 images; new uploads use /api/uploads
const MAX_ITEMS = 500;

type Raw = Record<string, unknown>;

export class ContentValidationError extends Error {}

function asRecord(value: unknown): Raw {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ContentValidationError("Geçersiz içerik kaydı");
  }
  return value as Raw;
}

function status(value: unknown): ContentStatus {
  return value === "draft" ? "draft" : "published";
}

function id(value: unknown, prefix: string): string {
  const raw = clampString(value, 80).replace(/[^a-zA-Z0-9_-]/g, "");
  return raw || `${prefix}-${Date.now()}`;
}

function slug(value: unknown, fallbackSource: unknown): string {
  const result = slugify(clampString(value, SHORT) || clampString(fallbackSource, SHORT));
  if (!result) throw new ContentValidationError("Slug üretilemedi; başlık zorunludur");
  return result;
}

function num(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isoDate(value: unknown): string {
  const raw = clampString(value, 40);
  return raw && !Number.isNaN(Date.parse(raw)) ? raw : new Date().toISOString();
}

function image(value: unknown, fallback: string): string {
  return safeImageSrc(clampString(value, IMAGE), fallback);
}

function link(value: unknown): string | undefined {
  const raw = clampString(value, MEDIUM);
  if (!raw) return undefined;
  const safe = safeHref(raw, "");
  return safe || undefined;
}

function requiredText(value: unknown, max: number, field: string): string {
  const text = clampString(value, max).trim();
  if (!text) throw new ContentValidationError(`${field} alanı zorunludur`);
  return text;
}

function normalizeService(input: unknown, index: number): ServiceItem {
  const raw = asRecord(input);
  const title = requiredText(raw.title, SHORT, "Hizmet başlığı");
  return {
    id: id(raw.id, "srv"),
    title,
    slug: slug(raw.slug, title),
    category: clampString(raw.category, SHORT),
    iconName: clampString(raw.iconName, 40) || "Sparkles",
    shortDesc: clampString(raw.shortDesc, MEDIUM),
    fullContent: clampString(raw.fullContent, LONG),
    features: toStringArray(raw.features, 50, SHORT),
    deliverables: toStringArray(raw.deliverables, 50, SHORT),
    heroImage: image(raw.heroImage, "/assets/services/service-performans.webp"),
    videoUrl: link(raw.videoUrl),
    tags: toStringArray(raw.tags, 30, 60),
    metaTitle: clampString(raw.metaTitle, SHORT) || undefined,
    metaDescription: clampString(raw.metaDescription, 400) || undefined,
    status: status(raw.status),
    order: num(raw.order, index + 1),
    updatedAt: isoDate(raw.updatedAt),
  };
}

function normalizeMetric(input: unknown): MetricItem | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Raw;
  const label = clampString(raw.label, SHORT);
  if (!label) return null;
  return {
    label,
    value: clampString(raw.value, SHORT),
    growth: clampString(raw.growth, SHORT) || undefined,
  };
}

function normalizeCustomer(input: unknown): CustomerItem {
  const raw = asRecord(input);
  const name = requiredText(raw.name, SHORT, "Müşteri adı");
  const testimonialRaw =
    raw.testimonial && typeof raw.testimonial === "object" ? (raw.testimonial as Raw) : null;
  return {
    id: id(raw.id, "cust"),
    name,
    slug: slug(raw.slug, name),
    sector: clampString(raw.sector, SHORT),
    logoText: clampString(raw.logoText, SHORT),
    heroImage: image(raw.heroImage, "/assets/customers/laoscafe-hero.webp"),
    videoUrl: link(raw.videoUrl),
    summary: clampString(raw.summary, MEDIUM * 3),
    story: clampString(raw.story, LONG) || undefined,
    challenge: clampString(raw.challenge, MEDIUM * 5),
    solution: clampString(raw.solution, MEDIUM * 5),
    results: Array.isArray(raw.results)
      ? raw.results.map(normalizeMetric).filter((m): m is MetricItem => m !== null).slice(0, 20)
      : undefined,
    testimonial:
      testimonialRaw && clampString(testimonialRaw.quote, MEDIUM * 2)
        ? {
            author: clampString(testimonialRaw.author, SHORT),
            role: clampString(testimonialRaw.role, SHORT),
            quote: clampString(testimonialRaw.quote, MEDIUM * 2),
            avatarUrl: image(testimonialRaw.avatarUrl, "") || undefined,
          }
        : undefined,
    galleryImages: Array.isArray(raw.galleryImages)
      ? raw.galleryImages
          .map((src) => image(src, ""))
          .filter(Boolean)
          .slice(0, 40)
      : [],
    liveUrl: link(raw.liveUrl),
    tags: toStringArray(raw.tags, 30, 60),
    metaTitle: clampString(raw.metaTitle, SHORT) || undefined,
    metaDescription: clampString(raw.metaDescription, 400) || undefined,
    status: status(raw.status),
    featured: raw.featured !== false,
    updatedAt: isoDate(raw.updatedAt),
  };
}

function normalizeBlogPost(input: unknown): BlogPost {
  const raw = asRecord(input);
  const title = requiredText(raw.title, SHORT, "Makale başlığı");
  const authorRaw = raw.author && typeof raw.author === "object" ? (raw.author as Raw) : {};
  return {
    id: id(raw.id, "blog"),
    title,
    slug: slug(raw.slug, title),
    excerpt: clampString(raw.excerpt, MEDIUM),
    content: clampString(raw.content, LONG * 4),
    coverImage: image(raw.coverImage, "/assets/blog/blog-ai-trends.webp"),
    videoUrl: link(raw.videoUrl),
    category: clampString(raw.category, SHORT),
    author: {
      name: clampString(authorRaw.name, SHORT) || "digivideas",
      role: clampString(authorRaw.role, SHORT),
      avatar: image(authorRaw.avatar, "/assets/team/muaz-avatar.webp"),
    },
    readTimeMinutes: Math.max(1, Math.min(120, num(raw.readTimeMinutes, 4))),
    tags: toStringArray(raw.tags, 30, 60),
    publishedAt: clampString(raw.publishedAt, 40) || new Date().toISOString().split("T")[0],
    metaTitle: clampString(raw.metaTitle, SHORT) || undefined,
    metaDescription: clampString(raw.metaDescription, 400) || undefined,
    status: status(raw.status),
    featured: raw.featured === true,
  };
}

function normalizeTag(input: unknown): TagItem {
  const raw = asRecord(input);
  const name = requiredText(raw.name, 60, "Etiket adı");
  const moduleType = ["all", "services", "customers", "blog"].includes(raw.moduleType as string)
    ? (raw.moduleType as TagItem["moduleType"])
    : "all";
  return {
    id: id(raw.id, "tag"),
    name,
    slug: slug(raw.slug, name),
    moduleType,
    color: clampString(raw.color, 30) || undefined,
    createdAt: isoDate(raw.createdAt),
  };
}

function normalizeFAQ(input: unknown, index: number): FAQItem {
  const raw = asRecord(input);
  return {
    id: id(raw.id, "faq"),
    question: requiredText(raw.question, MEDIUM, "Soru"),
    answer: requiredText(raw.answer, MEDIUM * 5, "Cevap"),
    category: clampString(raw.category, SHORT) || "Genel",
    order: num(raw.order, index + 1),
    status: status(raw.status),
    updatedAt: isoDate(raw.updatedAt),
  };
}

function normalizePromo(input: unknown, index: number): PromoItem {
  const raw = asRecord(input);
  const url = link(raw.url);
  if (!url || !/^https?:/i.test(url)) {
    throw new ContentValidationError("Reklam bağlantısı http(s) ile başlamalıdır");
  }
  return {
    id: id(raw.id, "promo"),
    brand: requiredText(raw.brand, SHORT, "Marka adı"),
    title: requiredText(raw.title, SHORT, "Reklam başlığı"),
    description: clampString(raw.description, MEDIUM * 2),
    url,
    ctaText: clampString(raw.ctaText, 80) || "Ziyaret Et",
    badge: clampString(raw.badge, 60) || undefined,
    imageUrl: image(raw.imageUrl, "") || undefined,
    highlights: toStringArray(raw.highlights, 8, SHORT),
    status: status(raw.status),
    order: num(raw.order, index + 1),
    updatedAt: isoDate(raw.updatedAt),
  };
}

const LEGAL_SLUGS: LegalPageSlug[] = ["teslimat-ve-iade", "gizlilik-sozlesmesi", "mesafeli-satis-sozlesmesi"];

function normalizeLegalPage(input: unknown): LegalPage {
  const raw = asRecord(input);
  const slug = raw.slug as LegalPageSlug;
  if (!LEGAL_SLUGS.includes(slug)) throw new ContentValidationError("Bilinmeyen yasal sayfa");
  return {
    id: id(raw.id, "legal"),
    slug,
    title: requiredText(raw.title, SHORT, "Sayfa başlığı"),
    content: requiredText(raw.content, LONG * 2, "Sayfa içeriği"),
    updatedAt: isoDate(raw.updatedAt),
  };
}

export function normalizeNarrative(input: unknown): SiteNarrative {
  const raw = asRecord(input);
  return {
    brandName: clampString(raw.brandName, SHORT) || "digivideas",
    slogan: clampString(raw.slogan, MEDIUM),
    etymology: clampString(raw.etymology, MEDIUM),
    location: clampString(raw.location, SHORT),
    footerLocation: clampString(raw.footerLocation, SHORT),
    whatsappNumber: clampString(raw.whatsappNumber, 30).replace(/[^0-9+ ]/g, ""),
    facebookUrl: link(raw.facebookUrl),
    instagramUrl: link(raw.instagramUrl),
    linkedinUrl: link(raw.linkedinUrl),
    logoUrl: image(raw.logoUrl, "/assets/logo.png"),
    sidebarSmallLogoUrl: image(raw.sidebarSmallLogoUrl, "/assets/logo.png"),
    sidebarWideLogoUrl: image(raw.sidebarWideLogoUrl, "/assets/logo.png"),
    bizKimiz: clampString(raw.bizKimiz, MEDIUM * 5),
    nasilBasladi: clampString(raw.nasilBasladi, MEDIUM * 5),
    misyonumuz: clampString(raw.misyonumuz, MEDIUM * 5),
    vizyonumuz: clampString(raw.vizyonumuz, MEDIUM * 5),
    companyTitle: clampString(raw.companyTitle, SHORT).trim() || undefined,
    companyAddress: clampString(raw.companyAddress, 400).trim() || undefined,
    companyPhone: clampString(raw.companyPhone, 40).trim() || undefined,
    companyEmail: clampString(raw.companyEmail, 200).trim() || undefined,
    taxOffice: clampString(raw.taxOffice, 120).trim() || undefined,
    taxNumber: clampString(raw.taxNumber, 20).replace(/[^0-9]/g, "") || undefined,
    mersisNumber: clampString(raw.mersisNumber, 20).replace(/[^0-9]/g, "") || undefined,
    kepAddress: clampString(raw.kepAddress, 200).trim() || undefined,
  };
}

const collectionNormalizers: {
  [K in ContentCollection]: (input: unknown, index: number) => ContentSnapshot[K][number];
} = {
  services: normalizeService,
  customers: normalizeCustomer,
  blogPosts: normalizeBlogPost,
  tags: normalizeTag,
  faqs: normalizeFAQ,
  promos: normalizePromo,
  legalPages: normalizeLegalPage,
};

export function isContentCollection(value: string): value is ContentCollection {
  return Object.prototype.hasOwnProperty.call(collectionNormalizers, value);
}

export function normalizeCollection<K extends ContentCollection>(
  collection: K,
  items: unknown
): ContentSnapshot[K] {
  if (!Array.isArray(items)) throw new ContentValidationError("Liste bekleniyordu");
  if (items.length > MAX_ITEMS) throw new ContentValidationError("Çok fazla kayıt");
  const normalizer = collectionNormalizers[collection] as (input: unknown, index: number) => ContentSnapshot[K][number];
  const normalized = items.map((item, index) => normalizer(item, index));

  const seen = new Set<string>();
  for (const item of normalized) {
    const key = "slug" in item ? (item as { slug: string }).slug : item.id;
    if (seen.has(key)) throw new ContentValidationError(`Aynı adres (slug) birden fazla kayıtta kullanılıyor: ${key}`);
    seen.add(key);
  }
  return normalized as ContentSnapshot[K];
}
