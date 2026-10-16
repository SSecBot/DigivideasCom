import { ImageResponse } from "next/og";

export const alt = "digivideas – İzmir Dijital Reklam Ajansı";
// Edge runtime: the Node build of @vercel/og fails on Windows paths with non-ASCII characters.
export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded social share image (Open Graph / Twitter / WhatsApp previews). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #181818 0%, #1F1F1F 55%, #3a1d08 100%)",
          color: "#FAFAFA",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: 28, color: "#FB923C" }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#F97316" }} />
          İzmir, Türkiye
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 800, letterSpacing: "-3px" }}>
            dig<span style={{ color: "#F97316" }}>ivi</span>deas
          </div>
          <div style={{ fontSize: 40, color: "#D4D4D8", maxWidth: 900 }}>
            Dijital dünyada kalıcı bir iz bırakın.
          </div>
        </div>
        <div style={{ display: "flex", gap: "16px", fontSize: 24, color: "#A1A1AA" }}>
          Sosyal Medya · Meta & Google Ads · Kreatif Prodüksiyon · Web & SEO
        </div>
      </div>
    ),
    size
  );
}
