import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/site";
import { breadcrumbSchema } from "@/lib/seo/structured-data";
import CustomersPageClient from "./CustomersPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Müşterilerimiz & Vaka Analizleri",
  description:
    "digivideas ile dijitalde büyüyen markaların başarı hikayeleri, kampanya sonuçları ve sosyal medya reklam vaka analizleri.",
  path: "/customers",
  keywords: ["reklam ajansı referanslar", "sosyal medya vaka analizi", "dijital pazarlama başarı hikayeleri"],
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Ana Sayfa", path: "/" },
            { name: "Müşterilerimiz", path: "/customers" },
          ]),
        ]}
      />
      <CustomersPageClient />
    </>
  );
}
