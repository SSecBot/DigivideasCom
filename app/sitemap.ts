import type { MetadataRoute } from "next";
import { contentRepository } from "@/lib/server/repositories/content-repository";
import { absoluteUrl } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

/** Validates loose CMS dates so a bad value never breaks the sitemap. */
function toDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { services, customers, blogPosts } = await contentRepository.getPublished();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/services"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/customers"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: absoluteUrl("/faq"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: absoluteUrl("/kvkk"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...staticPages,
    ...services.map((service) => ({
      url: absoluteUrl(`/services/${service.slug}`),
      lastModified: toDate(service.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...customers.map((customer) => ({
      url: absoluteUrl(`/customers/${customer.slug}`),
      lastModified: toDate(customer.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...blogPosts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: toDate(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
