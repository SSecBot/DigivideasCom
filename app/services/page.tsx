import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/site";
import { breadcrumbSchema, servicesListSchema } from "@/lib/seo/structured-data";
import { contentRepository } from "@/lib/server/repositories/content-repository";
import ServicesPageClient from "./ServicesPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Hizmetlerimiz – Sosyal Medya, Meta & Google Ads, Web Tasarım",
  description:
    "Sosyal medya yönetimi, Meta & Google Ads performans pazarlaması, kreatif prodüksiyon, web tasarım, SEO ve marka kimliği hizmetlerimizi inceleyin.",
  path: "/services",
  keywords: ["sosyal medya yönetimi", "meta ads yönetimi", "google ads ajansı", "web tasarım izmir", "seo hizmeti", "reels prodüksiyon"],
});

export default async function Page() {
  const content = await contentRepository.getPublished();
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Ana Sayfa", path: "/" },
            { name: "Hizmetlerimiz", path: "/services" },
          ]),
          servicesListSchema(content.services),
        ]}
      />
      <ServicesPageClient />
    </>
  );
}
