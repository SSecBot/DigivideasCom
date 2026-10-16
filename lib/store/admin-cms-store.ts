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
  const form = new FormData();
  files.forEach((file) => form.append("files", file));
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

export function useAdminCMSStore() {
  const [content, setContent] = useState<ContentSnapshot>(defaultContentSnapshot);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncError, setSyncError] = useState("");
  const contentRef = useRef(content);
  contentRef.current = content;

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
    <K extends ContentCollection>(collection: K, items: ContentSnapshot[K]) => {
      setContent((prev) => ({ ...prev, [collection]: items }));
      adminFetch<ContentSnapshot>(`/api/admin/content/${collection}`, {
        method: "PUT",
        body: JSON.stringify({ items }),
      })
        .then(setContent)
        .catch((error: Error) => {
          setSyncError(error.message);
          reload();
        });
    },
    [reload]
  );

  // --- SERVICES ---
  const saveService = (service: Partial<ServiceItem> & { title: string }) => {
    const { services } = contentRef.current;
    const slug = slugify(service.slug || service.title);
    const now = new Date().toISOString();
    const updated = upsertBy(
      services,
      (s) => s.id === service.id || s.slug === slug,
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
              metaTitle: service.metaTitle || service.title,
              metaDescription: service.metaDescription || service.shortDesc,
              status: service.status || "published",
              order: service.order || services.length + 1,
              updatedAt: now,
            }
    );
    persistCollection("services", updated);
    return slug;
  };

  const deleteService = (id: string) =>
    persistCollection("services", contentRef.current.services.filter((s) => s.id !== id));

  // --- CUSTOMERS ---
  const saveCustomer = (customer: Partial<CustomerItem> & { name: string }) => {
    const { customers } = contentRef.current;
    const slug = slugify(customer.slug || customer.name);
    const now = new Date().toISOString();
    const updated = upsertBy(
      customers,
      (c) => c.id === customer.id || c.slug === slug,
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
              metaTitle: customer.metaTitle || `${customer.name} Vaka Analizi`,
              metaDescription: customer.metaDescription || customer.summary,
              status: customer.status || "published",
              featured: customer.featured ?? true,
              updatedAt: now,
            }
    );
    persistCollection("customers", updated);
    return slug;
  };

  const deleteCustomer = (id: string) =>
    persistCollection("customers", contentRef.current.customers.filter((c) => c.id !== id));

  // --- BLOG ---
  const saveBlogPost = (post: Partial<BlogPost> & { title: string }) => {
    const { blogPosts } = contentRef.current;
    const slug = slugify(post.slug || post.title);
    const today = new Date().toISOString().split("T")[0];
    const updated = upsertBy(
      blogPosts,
      (b) => b.id === post.id || b.slug === slug,
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
              metaTitle: post.metaTitle || post.title,
              metaDescription: post.metaDescription || post.excerpt,
              status: post.status || "published",
              featured: post.featured ?? false,
            }
    );
    persistCollection("blogPosts", updated);
    return slug;
  };

  const deleteBlogPost = (id: string) =>
    persistCollection("blogPosts", contentRef.current.blogPosts.filter((b) => b.id !== id));

  // --- TAGS ---
  const saveTag = (tag: Partial<TagItem> & { name: string }) => {
    const slug = slugify(tag.slug || tag.name);
    const updated = upsertBy(
      contentRef.current.tags,
      (t) => t.id === tag.id || t.slug === slug,
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
    persistCollection("tags", updated);
    return slug;
  };

  const deleteTag = (id: string) =>
    persistCollection("tags", contentRef.current.tags.filter((t) => t.id !== id));

  // --- FAQ ---
  const saveFAQ = (faq: Partial<FAQItem> & { question: string; answer: string }) => {
    const { faqs } = contentRef.current;
    const now = new Date().toISOString();
    const updated = upsertBy(
      faqs,
      (f) => f.id === faq.id,
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
    persistCollection("faqs", updated);
    return faq.id;
  };

  const deleteFAQ = (id: string) =>
    persistCollection("faqs", contentRef.current.faqs.filter((f) => f.id !== id));

  // --- PROMOS (Reklamlarımız) ---
  const savePromo = (promo: Partial<PromoItem> & { brand: string; title: string; url: string }) => {
    const { promos } = contentRef.current;
    const now = new Date().toISOString();
    const updated = upsertBy(
      promos,
      (p) => p.id === promo.id,
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
    persistCollection("promos", updated);
  };

  const deletePromo = (id: string) =>
    persistCollection("promos", contentRef.current.promos.filter((p) => p.id !== id));

  // --- NARRATIVE ---
  const saveNarrative = (patch: Partial<SiteNarrative>) => {
    const narrative = { ...contentRef.current.narrative, ...patch };
    setContent((prev) => ({ ...prev, narrative }));
    adminFetch<ContentSnapshot>("/api/admin/content/narrative", {
      method: "PUT",
      body: JSON.stringify({ narrative }),
    })
      .then(setContent)
      .catch((error: Error) => {
        setSyncError(error.message);
        reload();
      });
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
