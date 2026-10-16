import { BlogPost, ContactInquiry, CustomerItem, FAQItem, ServiceItem, SiteNarrative, TagItem } from "@/lib/types/cms";

/**
 * The first version of the admin panel saved every edit only in the editing browser's
 * localStorage. These helpers find that data so it can be moved to the server without
 * losing anything. The browser data itself is never modified or deleted.
 */

export const LEGACY_KEYS = {
  services: "digivideas_services_v1",
  customers: "digivideas_customers_v1",
  blogPosts: "digivideas_blog_v1",
  tags: "digivideas_tags_v1",
  faqs: "digivideas_faqs_v1",
  narrative: "digivideas_narrative_v1",
  inquiries: "digivideas_inquiries_v1",
} as const;

export const LEGACY_IMPORTED_FLAG = "digivideas_legacy_imported_at";

export interface LegacyData {
  services?: ServiceItem[];
  customers?: CustomerItem[];
  blogPosts?: BlogPost[];
  tags?: TagItem[];
  faqs?: FAQItem[];
  narrative?: SiteNarrative;
  inquiries?: ContactInquiry[];
}

export type LegacyCollection = "services" | "customers" | "blogPosts" | "tags" | "faqs";
export const LEGACY_COLLECTIONS: LegacyCollection[] = ["services", "customers", "blogPosts", "tags", "faqs"];

export const LEGACY_LABELS: Record<keyof LegacyData, string> = {
  services: "Hizmet",
  customers: "Müşteri vakası",
  blogPosts: "Blog makalesi",
  tags: "Etiket",
  faqs: "SSS",
  narrative: "Site ayarları",
  inquiries: "Gelen talep",
};

type StorageLike = Pick<Storage, "getItem">;

function parse<T>(raw: string | null, isValid: (value: unknown) => boolean): T | undefined {
  if (!raw) return undefined;
  try {
    const value = JSON.parse(raw) as unknown;
    return isValid(value) ? (value as T) : undefined;
  } catch {
    return undefined;
  }
}

/** Reads every legacy key that exists; keys that were never written stay undefined. */
export function readLegacyData(storage: StorageLike): LegacyData | null {
  const data: LegacyData = {};
  for (const key of LEGACY_COLLECTIONS) {
    const value = parse<unknown[]>(storage.getItem(LEGACY_KEYS[key]), Array.isArray);
    if (value) (data as Record<string, unknown>)[key] = value;
  }
  const narrative = parse<SiteNarrative>(
    storage.getItem(LEGACY_KEYS.narrative),
    (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value)
  );
  if (narrative) data.narrative = narrative;
  const inquiries = parse<ContactInquiry[]>(storage.getItem(LEGACY_KEYS.inquiries), Array.isArray);
  if (inquiries && inquiries.length > 0) data.inquiries = inquiries;
  return Object.keys(data).length > 0 ? data : null;
}

export function legacySummary(data: LegacyData): string[] {
  return (Object.keys(LEGACY_LABELS) as (keyof LegacyData)[])
    .filter((key) => data[key] !== undefined)
    .map((key) => {
      const value = data[key];
      return Array.isArray(value) ? `${value.length} ${LEGACY_LABELS[key]}` : LEGACY_LABELS[key];
    });
}

/** Every distinct base64 image embedded in the legacy data (old uploads were stored inline). */
export function collectDataUrls(value: unknown, found = new Set<string>()): Set<string> {
  if (typeof value === "string") {
    if (value.startsWith("data:image/")) found.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectDataUrls(item, found));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectDataUrls(item, found));
  }
  return found;
}

/** Deep copy with inline images swapped for their uploaded URLs. */
export function replaceDataUrls<T>(value: T, replacements: Map<string, string>): T {
  if (typeof value === "string") return (replacements.get(value) ?? value) as T;
  if (Array.isArray(value)) return value.map((item) => replaceDataUrls(item, replacements)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceDataUrls(item, replacements)])) as T;
  }
  return value;
}

/**
 * Merge that never changes what is already on the server: legacy records are only added
 * when their id is unknown; a clashing slug gets a "-2" style suffix instead of overwriting.
 */
export function mergeById<T extends { id: string; slug?: string }>(server: T[], legacy: T[]): { items: T[]; added: number } {
  const ids = new Set(server.map((item) => item.id));
  const slugs = new Set(server.map((item) => item.slug).filter(Boolean) as string[]);
  const items = [...server];
  let added = 0;
  for (const item of legacy) {
    if (!item || typeof item.id !== "string" || ids.has(item.id)) continue;
    let next = item;
    if (item.slug && slugs.has(item.slug)) {
      let n = 2;
      while (slugs.has(`${item.slug}-${n}`)) n += 1;
      next = { ...item, slug: `${item.slug}-${n}` };
    }
    if (next.slug) slugs.add(next.slug);
    ids.add(next.id);
    items.push(next);
    added += 1;
  }
  return { items, added };
}

/** Decodes a base64 data URL without fetch() (the site CSP blocks fetching data: URLs). */
export function dataUrlToFile(dataUrl: string, index: number): File {
  const match = dataUrl.match(/^data:(image\/[a-z+.-]+);base64,([\s\S]*)$/i);
  if (!match) throw new Error("Eski görsel okunamadı");
  const [, type, base64] = match;
  const binary = atob(base64.replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const extension = (type.split("/")[1] || "png").replace("jpeg", "jpg");
  return new File([bytes], `eski-gorsel-${index + 1}.${extension}`, { type });
}
