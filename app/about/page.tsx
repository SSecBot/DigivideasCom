import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/site";
import { breadcrumbSchema } from "@/lib/seo/structured-data";
import AboutPageClient from "./AboutPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Hakkımızda – İzmir Dijital Reklam Ajansı",
  description:
    "digivideas'ın hikayesi, misyonu ve vizyonu: İzmir Torbalı merkezli, mühendislik yaklaşımıyla çalışan dijital reklam ve sosyal medya ajansı.",
  path: "/about",
  keywords: ["digivideas hakkında", "izmir reklam ajansı", "dijital ajans izmir", "torbalı reklam ajansı"],
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Ana Sayfa", path: "/" },
            { name: "Hakkımızda", path: "/about" },
          ]),
        ]}
      />
      <AboutPageClient />
    </>
  );
}
