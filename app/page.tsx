import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS, DEFAULT_TITLE, buildMetadata } from "@/lib/seo/site";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  ...buildMetadata({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: "/",
    keywords: DEFAULT_KEYWORDS,
  }),
  // The homepage uses the full brand title, not the "%s | digivideas" template.
  title: { absolute: DEFAULT_TITLE },
};

export default function Page() {
  return <HomePageClient />;
}
