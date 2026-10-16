"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/ui/WhatsAppFloat";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";

/** Public site frame (sidebar, navbar, footer, tracking). The admin panel renders without it. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";

  if (pathname.startsWith("/dashboard")) {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-brand-500 focus:text-slate-950 focus:px-4 focus:py-2 focus:rounded-xl focus:font-semibold"
      >
        İçeriğe geç
      </a>
      <AnalyticsTracker />
      <Sidebar />
      <div className="flex flex-col min-h-screen pl-0 lg:pl-20 transition-all duration-300 min-w-0">
        <Navbar />
        <main id="main-content" className="flex-1 min-w-0">
          {children}
        </main>
        <WhatsAppFloat />
        <Footer />
      </div>
    </>
  );
}
