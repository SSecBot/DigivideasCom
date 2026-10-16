import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/site";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/structured-data";
import { contentRepository } from "@/lib/server/repositories/content-repository";
import FAQPageClient from "./FAQPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Sıkça Sorulan Sorular (SSS)",
  description:
    "Sosyal medya yönetimi, reklam bütçeleri, Meta & Google Ads, raporlama ve çalışma sürecimiz hakkında en çok sorulan soruların cevapları.",
  path: "/faq",
  keywords: ["reklam ajansı sss", "sosyal medya yönetimi fiyatları", "meta ads bütçe"],
});

export default async function Page() {
  const content = await contentRepository.getPublished();
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Ana Sayfa", path: "/" },
            { name: "Sıkça Sorulan Sorular", path: "/faq" },
          ]),
          faqSchema(content.faqs),
        ]}
      />
      <FAQPageClient />
    </>
  );
}
