import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "digivideas – Dijital Reklam Ajansı",
    short_name: "digivideas",
    description: "İzmir merkezli dijital reklam, sosyal medya ve performans pazarlaması ajansı.",
    start_url: "/",
    display: "standalone",
    background_color: "#1F1F1F",
    theme_color: "#1F1F1F",
    lang: "tr",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
