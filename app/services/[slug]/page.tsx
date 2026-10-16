import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/site";
import { breadcrumbSchema, serviceSchema } from "@/lib/seo/structured-data";
import { contentRepository } from "@/lib/server/repositories/content-repository";
import ServiceDetailClient from "./ServiceDetailClient";

interface PageProps {
  params: { slug: string };
}

async function findPublished(slug: string) {
  const content = await contentRepository.getPublished();
  return content.services.find((entry) => entry.slug === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = await findPublished(params.slug);
  if (!item) return { title: "Sayfa bulunamadı", robots: { index: false } };
  return buildMetadata({
    title: item.metaTitle || item.title,
    description: item.metaDescription || item.shortDesc,
    path: `/services/${item.slug}`,
    image: item.heroImage,
    keywords: item.tags,
    type: "website",
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
            { name: "Hizmetlerimiz", path: "/services" },
            { name: item.title, path: `/services/${item.slug}` },
          ]),
          serviceSchema(item),
        ]}
      />
      <ServiceDetailClient />
    </>
  );
}
