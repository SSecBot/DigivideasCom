import { ContentCollection, ContentSnapshot, SiteNarrative } from "@/lib/types/cms";
import { defaultContentSnapshot } from "@/lib/data/initial-data";
import { promises as fs } from "node:fs";
import { readJsonFile, resolveDataPath, withFileLock, writeJsonFile } from "@/lib/server/storage/json-store";

const CONTENT_FILE = () => resolveDataPath("content.json");

export const defaultContent: ContentSnapshot = defaultContentSnapshot;

let cache: ContentSnapshot | null = null;
let cacheMtimeMs = 0;

/** Returns the content file's mtime so a cache built by another process is never served stale. */
async function contentMtime(): Promise<number> {
  try {
    return (await fs.stat(CONTENT_FILE())).mtimeMs;
  } catch {
    return 0;
  }
}

/** Fills collections missing from older content files with their defaults. */
function withDefaults(stored: Partial<ContentSnapshot>): ContentSnapshot {
  return {
    services: stored.services ?? defaultContent.services,
    customers: stored.customers ?? defaultContent.customers,
    blogPosts: stored.blogPosts ?? defaultContent.blogPosts,
    tags: stored.tags ?? defaultContent.tags,
    faqs: stored.faqs ?? defaultContent.faqs,
    promos: stored.promos ?? defaultContent.promos,
    // Every legal page must exist; pages added in later versions get their default text
    legalPages: [
      ...(stored.legalPages ?? []),
      ...defaultContent.legalPages.filter((page) => !(stored.legalPages ?? []).some((saved) => saved.slug === page.slug)),
    ],
    narrative: { ...defaultContent.narrative, ...(stored.narrative ?? {}) },
  };
}

export const contentRepository = {
  async getAll(): Promise<ContentSnapshot> {
    const mtime = await contentMtime();
    if (cache && mtime === cacheMtimeMs) return cache;
    const stored = await readJsonFile<Partial<ContentSnapshot>>(CONTENT_FILE(), {});
    cache = withDefaults(stored);
    cacheMtimeMs = mtime;
    return cache;
  },

  /** Only what visitors may see: drafts are removed and lists are ordered. */
  async getPublished(): Promise<ContentSnapshot> {
    const all = await this.getAll();
    const published = <T extends { status: string }>(items: T[]) =>
      items.filter((item) => item.status !== "draft");
    const byOrder = <T extends { order: number }>(items: T[]) =>
      [...items].sort((a, b) => a.order - b.order);
    return {
      ...all,
      services: byOrder(published(all.services)),
      customers: published(all.customers),
      blogPosts: published(all.blogPosts).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
      faqs: byOrder(published(all.faqs)),
      promos: byOrder(published(all.promos)),
    };
  },

  async replaceCollection<K extends ContentCollection>(
    collection: K,
    items: ContentSnapshot[K]
  ): Promise<ContentSnapshot> {
    return withFileLock(CONTENT_FILE(), async () => {
      const current = await this.getAll();
      const next = { ...current, [collection]: items };
      await writeJsonFile(CONTENT_FILE(), next);
      cache = next;
      cacheMtimeMs = await contentMtime();
      return next;
    });
  },

  async saveNarrative(narrative: SiteNarrative): Promise<ContentSnapshot> {
    return withFileLock(CONTENT_FILE(), async () => {
      const current = await this.getAll();
      const next = { ...current, narrative };
      await writeJsonFile(CONTENT_FILE(), next);
      cache = next;
      cacheMtimeMs = await contentMtime();
      return next;
    });
  },

  async resetToDefaults(): Promise<ContentSnapshot> {
    return withFileLock(CONTENT_FILE(), async () => {
      await writeJsonFile(CONTENT_FILE(), defaultContent);
      cache = defaultContent;
      cacheMtimeMs = await contentMtime();
      return defaultContent;
    });
  },
};
