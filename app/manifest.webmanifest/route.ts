import type { MetadataRoute } from "next";

/**
 * Public site manifest. Served as a route (instead of app/manifest.ts) so that the admin
 * section can point to its own /admin.webmanifest: a file-based root manifest would win
 * over the dashboard layout's metadata.
 */
export const dynamic = "force-static";

export function GET() {
  const manifest: MetadataRoute.Manifest = {
    name: "digivideas – Dijital Reklam Ajansı",
    short_name: "digivideas",
    description: "İzmir merkezli dijital reklam, sosyal medya ve performans pazarlaması ajansı.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#1F1F1F",
    theme_color: "#1F1F1F",
    lang: "tr",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
