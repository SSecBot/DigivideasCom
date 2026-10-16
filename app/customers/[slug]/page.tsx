import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/site";
import { breadcrumbSchema, caseStudySchema } from "@/lib/seo/structured-data";
import { contentRepository } from "@/lib/server/repositories/content-repository";
import CustomerDetailClient from "./CustomerDetailClient";

interface PageProps {
  params: { slug: string };
}

async function findPublished(slug: string) {
  const content = await contentRepository.getPublished();
  return content.customers.find((entry) => entry.slug === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = await findPublished(params.slug);
  if (!item) return { title: "Sayfa bulunamadı", robots: { index: false } };
  return buildMetadata({
    title: item.metaTitle || `${item.name} Vaka Analizi`,
    description: item.metaDescription || item.summary,
    path: `/customers/${item.slug}`,
    image: item.heroImage,
    keywords: item.tags,
    type: "article",
    modifiedTime: item.updatedAt,
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
            { name: "Müşterilerimiz", path: "/customers" },
            { name: item.name, path: `/customers/${item.slug}` },
          ]),
          caseStudySchema(item),
        ]}
      />
      <CustomerDetailClient />
    </>
  );
}
