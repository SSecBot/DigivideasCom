import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/site";
import { breadcrumbSchema, blogPostingSchema } from "@/lib/seo/structured-data";
import { contentRepository } from "@/lib/server/repositories/content-repository";
import BlogPostClient from "./BlogPostClient";

interface PageProps {
  params: { slug: string };
}

async function findPublished(slug: string) {
  const content = await contentRepository.getPublished();
  return content.blogPosts.find((entry) => entry.slug === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = await findPublished(params.slug);
  if (!item) return { title: "Sayfa bulunamadı", robots: { index: false } };
  return buildMetadata({
    title: item.metaTitle || item.title,
    description: item.metaDescription || item.excerpt,
    path: `/blog/${item.slug}`,
    image: item.coverImage,
    keywords: item.tags,
    type: "article",
    publishedTime: item.publishedAt,
  });
}

export default async function Page({ params }: PageProps) {
  const item = await findPublished(params.slug);
  if (!item) notFound();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Ana Sayfa", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: item.title, path: `/blog/${item.slug}` },
          ]),
          blogPostingSchema(item),
        ]}
      />
      <BlogPostClient />
    </>
  );
}
