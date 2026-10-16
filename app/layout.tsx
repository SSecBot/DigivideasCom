import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { ContentProvider } from "@/lib/store/cms-store";
import { contentRepository } from "@/lib/server/repositories/content-repository";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo/structured-data";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_TITLE,
  SITE_LOCALE,
  SITE_NAME,
  getSiteUrl,
} from "@/lib/seo/site";

// Content is edited live from the admin panel, so pages are rendered per request.
export const dynamic = "force-dynamic";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1F1F1F",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: DEFAULT_TITLE, template: "%s | digivideas" },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  applicationName: SITE_NAME,
  manifest: "/manifest.webmanifest",
  authors: [{ name: SITE_NAME, url: getSiteUrl() }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Dijital Pazarlama",
  formatDetection: { telephone: true, email: true, address: false },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    type: "website",
  },
  twitter: { card: "summary_large_image", title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await contentRepository.getPublished();

  return (
    <html lang="tr" className={`dark ${poppins.variable}`}>
      <body className="font-sans bg-background text-foreground antialiased selection:bg-brand-500 selection:text-black font-normal overflow-x-hidden">
        <JsonLd data={[organizationSchema(content.narrative), websiteSchema()]} />
        <ContentProvider content={content}>
          <SiteChrome>{children}</SiteChrome>
        </ContentProvider>
      </body>
    </html>
  );
}
