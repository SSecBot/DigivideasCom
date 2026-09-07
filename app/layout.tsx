import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/ui/WhatsAppFloat";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "digivideas | Dijital Reklam Ajansı - İzmir, Türkiye",
  description:
    "Teknoloji ve yaratıcılığı harmanlayarak, markanızın dijital platformlarda öne çıkmasını sağlıyoruz. İhtiyaçlarınıza özel çözümlerle, markanızın dijital yolculuğunu başarıyla yönetiyoruz. İzmir, Türkiye.",
  keywords: [
    "digivideas",
    "dijital reklam ajansı",
    "izmir dijital reklam ajansı",
    "sosyal medya yönetimi",
    "meta ads",
    "google ads",
    "performans pazarlaması",
    "kreatif prodüksiyon",
    "web tasarım",
    "seo ajansı",
  ],
  authors: [{ name: "digivideas" }],
  openGraph: {
    title: "digivideas | Dijital Reklam Ajansı",
    description:
      "Teknoloji ve yaratıcılığı harmanlayarak, markanızın dijital platformlarda öne çıkmasını sağlıyoruz. İzmir, Türkiye.",
    url: "https://digivideas.com",
    siteName: "digivideas",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`dark ${poppins.variable}`}>
      <body
        className="font-sans bg-background text-foreground antialiased selection:bg-brand-500 selection:text-black font-normal"
      >
        {/* Left Fixed Vertical Sidebar */}
        <Sidebar />

        {/* Main Application Container (Offset for Sidebar) */}
        <div className="flex flex-col min-h-screen pl-0 lg:pl-20 transition-all duration-300">
          {/* Top Navbar */}
          <Navbar />

          {/* Page Content */}
          <main className="flex-1">{children}</main>

          {/* Global Floating WhatsApp Contact Button (+905492115561) */}
          <WhatsAppFloat />

          {/* Footer */}
          <Footer />
        </div>
      </body>
    </html>
  );
}
