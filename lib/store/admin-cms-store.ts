"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BlogPost,
  ContactInquiry,
  ContentCollection,
  ContentSnapshot,
  CustomerItem,
  FAQItem,
  PromoItem,
  ServiceItem,
  SiteNarrative,
  TagItem,
} from "@/lib/types/cms";
import { defaultContentSnapshot } from "@/lib/data/initial-data";
import { slugify } from "@/lib/utils/slugify";
import { describeUnsupported, optimizeImage } from "@/lib/admin/image-optimize";

/**
 * Admin-side CMS store. Edits are applied optimistically and then persisted
 * through the authenticated /api/admin endpoints. If the server rejects a write,
 * `syncError` is set and the server state is reloaded.
 */

async function adminFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(body.error || `İstek başarısız (${response.status})`);
  }
  return body;
}

export async function uploadImages(files: File[]): Promise<string[]> {
  for (const file of files) {
    const problem = describeUnsupported(file);
    if (problem) throw new Error(problem);
  }
  const prepared = await Promise.all(files.map(optimizeImage));
  const form = new FormData();
  prepared.forEach((file) => form.append("files", file));
  const response = await fetch("/api/admin/uploads", { method: "POST", body: form });
  const body = (await response.json().catch(() => ({}))) as { urls?: string[]; error?: string };
  if (!response.ok || !body.urls) throw new Error(body.error || "Görsel yüklenemedi");
  return body.urls;
}

function upsertBy<T extends { id: string; slug?: string }>(
  items: T[],
  match: (item: T) => boolean,
  build: (existing: T | undefined) => T,
  prepend = true
): T[] {
  const index = items.findIndex(match);
  if (index >= 0) {
    const updated = [...items];
    updated[index] = build(items[index]);
    return updated;
  }
  return prepend ? [build(undefined), ...items] : [...items, build(undefined)];
}

/**
 * Slug that no *other* record uses. Previously a new item whose slug matched an
 * existing one silently overwrote that item.
 */
export function uniqueSlug(base: string, items: { id: string; slug: string }[], selfId?: string): string {
  const taken = new Set(items.filter((item) => item.id !== selfId).map((item) => item.slug));
  const root = base || "icerik";
  if (!taken.has(root)) return root;
  let n = 2;
  while (taken.has(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
}

export function useAdminCMSStore() {
  const [content, setContent] = useState<ContentSnapshot>(defaultContentSnapshot);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncError, setSyncError] = useState("");
  const contentRef = useRef(content);
  contentRef.current = content;
  // Until the server copy is loaded, local state is only the bundled defaults:
  // saving then would overwrite the real content on the server.
  const loadedRef = useRef(false);
  loadedRef.current = isLoaded;

  const reload = useCallback(async () => {
    try {
      const [snapshot, inquiryList] = await Promise.all([
        adminFetch<ContentSnapshot>("/api/admin/content"),
        adminFetch<ContactInquiry[]>("/api/admin/inquiries"),
      ]);
      setContent(snapshot);
      setInquiries(inquiryList);
      setIsLoaded(true);
    } catch (error) {
      setSyncError((error as Error).message);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const persistCollection = useCallback(
    async <K extends ContentCollection>(collection: K, items: ContentSnapshot[K]): Promise<boolean> => {
      if (!loadedRef.current) {
        setSyncError("Veriler sunucudan henüz yüklenmedi; birkaç saniye sonra tekrar deneyin.");
        return false;
      }
      setContent((prev) => ({ ...prev, [collection]: items }));
      try {
        setContent(
          await adminFetch<ContentSnapshot>(`/api/admin/content/${collection}`, {
            method: "PUT",
            body: JSON.stringify({ items }),
          })
        );
        return true;
      } catch (error) {
        setSyncError((error as Error).message);
        reload();
        return false;
      }
    },
    [reload]
  );

  // --- SERVICES ---
  const saveService = async (service: Partial<ServiceItem> & { title: string }) => {
    const { services } = contentRef.current;
    const slug = uniqueSlug(slugify(service.slug || service.title), contentRef.current.services, service.id);
    const now = new Date().toISOString();
    const updated = upsertBy(
      services,
      (s) => Boolean(service.id) && s.id === service.id,
      (existing) =>
        existing
          ? ({ ...existing, ...service, slug, tags: service.tags || existing.tags || [], updatedAt: now } as ServiceItem)
          : {
              id: service.id || `srv-${Date.now()}`,
              title: service.title,
              slug,
              category: service.category || "Genel Hizmet",
              iconName: service.iconName || "Sparkles",
              shortDesc: service.shortDesc || "",
              fullContent: service.fullContent || "",
              features: service.features || [],
              deliverables: service.deliverables || [],
              heroImage: service.heroImage || "/assets/services/service-performans.webp",
              videoUrl: service.videoUrl || "",
              tags: service.tags || ["Dijital Reklam"],
              metaTitle: service.metaTitle || undefined,
              metaDescription: service.metaDescription || undefined,
              status: service.status || "published",
              order: service.order || services.length + 1,
              updatedAt: now,
            }
    );
    return (await persistCollection("services", updated)) ? slug : null;
  };

  const deleteService = (id: string) =>
    persistCollection("services", contentRef.current.services.filter((s) => s.id !== id));

  // --- CUSTOMERS ---
  const saveCustomer = async (customer: Partial<CustomerItem> & { name: string }) => {
    const { customers } = contentRef.current;
    const slug = uniqueSlug(slugify(customer.slug || customer.name), contentRef.current.customers, customer.id);
    const now = new Date().toISOString();
    const updated = upsertBy(
      customers,
      (c) => Boolean(customer.id) && c.id === customer.id,
      (existing) =>
        existing
          ? ({
              ...existing,
              ...customer,
              slug,
              story: customer.story !== undefined ? customer.story : existing.story,
              galleryImages: customer.galleryImages ?? existing.galleryImages ?? [],
              tags: customer.tags || existing.tags || [],
              updatedAt: now,
            } as CustomerItem)
          : {
              id: customer.id || `cust-${Date.now()}`,
              name: customer.name,
              slug,
              sector: customer.sector || "Genel Sektör",
              logoText: customer.logoText || customer.name.toUpperCase(),
              heroImage: customer.heroImage || "/assets/customers/laoscafe-hero.webp",
              videoUrl: customer.videoUrl || "",
              summary: customer.summary || "",
              story: customer.story || customer.summary || "",
              challenge: customer.challenge || "",
              solution: customer.solution || "",
              results: customer.results || [],
              testimonial: customer.testimonial,
              galleryImages: customer.galleryImages || [],
              liveUrl: customer.liveUrl,
              tags: customer.tags || ["Dijital Pazarlama"],
              metaTitle: customer.metaTitle || undefined,
              metaDescription: customer.metaDescription || undefined,
              status: customer.status || "published",
              featured: customer.featured ?? true,
              updatedAt: now,
            }
    );
    return (await persistCollection("customers", updated)) ? slug : null;
  };

  const deleteCustomer = (id: string) =>
    persistCollection("customers", contentRef.current.customers.filter((c) => c.id !== id));

  // --- BLOG ---
  const saveBlogPost = async (post: Partial<BlogPost> & { title: string }) => {
    const { blogPosts } = contentRef.current;
    const slug = uniqueSlug(slugify(post.slug || post.title), contentRef.current.blogPosts, post.id);
    const today = new Date().toISOString().split("T")[0];
    const updated = upsertBy(
      blogPosts,
      (b) => Boolean(post.id) && b.id === post.id,
      (existing) =>
        existing
          ? ({ ...existing, ...post, slug, tags: post.tags || existing.tags || [] } as BlogPost)
          : {
              id: post.id || `blog-${Date.now()}`,
              title: post.title,
              slug,
              excerpt: post.excerpt || "",
              content: post.content || "",
              coverImage: post.coverImage || "/assets/blog/blog-ai-trends.webp",
              videoUrl: post.videoUrl || "",
              category: post.category || "Pazarlama & Teknoloji",
              author: post.author || {
                name: "Muaz",
                role: "Kurucu & Baş Mühendis",
                avatar: "/assets/team/muaz-avatar.webp",
              },
              readTimeMinutes: post.readTimeMinutes || 4,
              tags: post.tags || ["Dijital Reklam", "Trendler"],
              publishedAt: post.publishedAt || today,
              metaTitle: post.metaTitle || undefined,
              metaDescription: post.metaDescription || undefined,
              status: post.status || "published",
              featured: post.featured ?? false,
            }
    );
    return (await persistCollection("blogPosts", updated)) ? slug : null;
  };

  const deleteBlogPost = (id: string) =>
    persistCollection("blogPosts", contentRef.current.blogPosts.filter((b) => b.id !== id));

  // --- TAGS ---
  const saveTag = async (tag: Partial<TagItem> & { name: string }) => {
    const slug = uniqueSlug(slugify(tag.slug || tag.name), contentRef.current.tags, tag.id);
    const updated = upsertBy(
      contentRef.current.tags,
      (t) => Boolean(tag.id) && t.id === tag.id,
      (existing) =>
        existing
          ? ({ ...existing, ...tag, slug } as TagItem)
          : {
              id: tag.id || `tag-${Date.now()}`,
              name: tag.name,
              slug,
              moduleType: tag.moduleType || "all",
              createdAt: new Date().toISOString(),
            },
      false
    );
    return (await persistCollection("tags", updated)) ? slug : null;
  };

  const deleteTag = (id: string) =>
    persistCollection("tags", contentRef.current.tags.filter((t) => t.id !== id));

  // --- FAQ ---
  const saveFAQ = async (faq: Partial<FAQItem> & { question: string; answer: string }) => {
    const { faqs } = contentRef.current;
    const now = new Date().toISOString();
    const updated = upsertBy(
      faqs,
      (f) => Boolean(faq.id) && f.id === faq.id,
      (existing) =>
        existing
          ? ({ ...existing, ...faq, updatedAt: now } as FAQItem)
          : {
              id: faq.id || `faq-${Date.now()}`,
              question: faq.question,
              answer: faq.answer,
              category: faq.category || "Genel",
              order: faq.order || faqs.length + 1,
              status: faq.status || "published",
              updatedAt: now,
            },
      false
    );
    return persistCollection("faqs", updated);
  };

  const deleteFAQ = (id: string) =>
    persistCollection("faqs", contentRef.current.faqs.filter((f) => f.id !== id));

  // --- PROMOS (Reklamlarımız) ---
  const savePromo = async (promo: Partial<PromoItem> & { brand: string; title: string; url: string }) => {
    const { promos } = contentRef.current;
    const now = new Date().toISOString();
    const updated = upsertBy(
      promos,
      (p) => Boolean(promo.id) && p.id === promo.id,
      (existing) =>
        existing
          ? ({ ...existing, ...promo, updatedAt: now } as PromoItem)
          : {
              id: `promo-${Date.now()}`,
              brand: promo.brand,
              title: promo.title,
              description: promo.description || "",
              url: promo.url,
              ctaText: promo.ctaText || "Ziyaret Et",
              badge: promo.badge,
              imageUrl: promo.imageUrl,
              highlights: promo.highlights || [],
              status: promo.status || "published",
              order: promo.order || promos.length + 1,
              updatedAt: now,
            },
      false
    );
    return persistCollection("promos", updated);
  };

  const deletePromo = (id: string) =>
    persistCollection("promos", contentRef.current.promos.filter((p) => p.id !== id));

  // --- NARRATIVE ---
  const saveNarrative = async (patch: Partial<SiteNarrative>): Promise<boolean> => {
    if (!loadedRef.current) {
      setSyncError("Veriler sunucudan henüz yüklenmedi; birkaç saniye sonra tekrar deneyin.");
      return false;
    }
    const narrative = { ...contentRef.current.narrative, ...patch };
    setContent((prev) => ({ ...prev, narrative }));
    try {
      setContent(
        await adminFetch<ContentSnapshot>("/api/admin/content/narrative", {
          method: "PUT",
          body: JSON.stringify({ narrative }),
        })
      );
      return true;
    } catch (error) {
      setSyncError((error as Error).message);
      reload();
      return false;
    }
  };

  // --- INQUIRIES ---
  const deleteInquiry = (id: string) => {
    setInquiries((prev) => prev.filter((inquiry) => inquiry.id !== id));
    adminFetch(`/api/admin/inquiries/${encodeURIComponent(id)}`, { method: "DELETE" }).catch(
      (error: Error) => {
        setSyncError(error.message);
        reload();
      }
    );
  };

  const resetToFactoryDefaults = () => {
    adminFetch<ContentSnapshot>("/api/admin/content/reset", { method: "POST" })
      .then(setContent)
      .catch((error: Error) => setSyncError(error.message));
  };

  return {
    ...content,
    inquiries,
    isLoaded,
    syncError,
    clearSyncError: () => setSyncError(""),
    reload,
    saveService,
    deleteService,
    saveCustomer,
    deleteCustomer,
    saveBlogPost,
    deleteBlogPost,
    saveTag,
    deleteTag,
    saveFAQ,
    deleteFAQ,
    savePromo,
    deletePromo,
    saveNarrative,
    deleteInquiry,
    resetToFactoryDefaults,
  };
}
