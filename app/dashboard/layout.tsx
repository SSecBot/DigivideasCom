import type { Metadata, Viewport } from "next";
import { AdminInstallHint } from "@/components/admin/AdminInstallHint";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  // Admin-only home screen app (iPhone/iPad "Ana Ekrana Ekle", Android "Uygulamayı yükle")
  manifest: "/admin.webmanifest",
  appleWebApp: {
    capable: true,
    title: "dv Yönetim",
    statusBarStyle: "black",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#09090B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      {children}
      <AdminInstallHint />
    </div>
  );
}
