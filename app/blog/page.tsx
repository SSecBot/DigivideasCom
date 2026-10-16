import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/site";
import { breadcrumbSchema } from "@/lib/seo/structured-data";
import BlogPageClient from "./BlogPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Blog – Dijital Pazarlama Trendleri & İpuçları",
  description:
    "Instagram Reels algoritması, Meta ve Google Ads stratejileri ve 2026 dijital pazarlama trendleri üzerine güncel makaleler.",
  path: "/blog",
  keywords: ["dijital pazarlama blog", "instagram reels ipuçları", "meta ads rehberi", "google ads rehberi"],
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Ana Sayfa", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        ]}
      />
      <BlogPageClient />
    </>
  );
}
