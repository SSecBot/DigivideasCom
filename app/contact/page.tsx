import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/site";
import { breadcrumbSchema } from "@/lib/seo/structured-data";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = buildMetadata({
  title: "İletişim – Ücretsiz Teklif Alın",
  description:
    "digivideas ile iletişime geçin: İzmir Torbalı ofisimiz, WhatsApp +90 549 211 55 61 ve teklif formu ile dijital reklam hedeflerinizi konuşalım.",
  path: "/contact",
  keywords: ["reklam ajansı iletişim", "izmir reklam ajansı teklif", "sosyal medya ajansı fiyat"],
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Ana Sayfa", path: "/" },
            { name: "İletişim", path: "/contact" },
          ]),
        ]}
      />
      <ContactPageClient />
    </>
  );
}
