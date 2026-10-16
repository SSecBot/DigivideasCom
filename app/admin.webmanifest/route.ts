/**
 * Web app manifest for the admin panel only. Adding the admin page to the iPhone/iPad
 * (or Android) home screen installs "digivideas Yönetim", which opens straight into
 * the panel as a standalone app, separate from the public site's manifest.
 */
export const dynamic = "force-static";

const ADMIN_PATH = process.env.NEXT_PUBLIC_ADMIN_ROUTE || "/dashboard/admin/digivideas";

export function GET() {
  const manifest = {
    id: ADMIN_PATH,
    name: "digivideas Yönetim Paneli",
    short_name: "dv Yönetim",
    description: "digivideas içerik, müşteri, teklif ve ödeme yönetimi",
    start_url: ADMIN_PATH,
    scope: "/dashboard/",
    display: "standalone",
    orientation: "any",
    background_color: "#09090B",
    theme_color: "#09090B",
    lang: "tr",
    icons: [
      { src: "/assets/admin/admin-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/assets/admin/admin-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
