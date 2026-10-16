import { ImageResponse } from "next/og";

/** Square brand monogram ("di") rendered at any size for favicon / apple / PWA icons. */
export function renderBrandIcon(px: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1F1F1F",
          borderRadius: px * 0.22,
          fontSize: px * 0.5,
          fontWeight: 800,
          color: "#FAFAFA",
          letterSpacing: `-${px * 0.02}px`,
        }}
      >
        d<span style={{ color: "#F97316" }}>i</span>
      </div>
    ),
    { width: px, height: px }
  );
}
