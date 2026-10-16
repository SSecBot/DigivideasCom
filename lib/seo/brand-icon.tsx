import { ImageResponse } from "next/og";

/**
 * Square brand icon built from the site logo (public/assets/logo.png) so the
 * browser tab shows the same mark as the header. The logo is white on transparent,
 * so it sits centered on the dark brand surface to stay visible on light tab bars.
 * Must be called from an edge-runtime route (the logo is loaded via import.meta.url).
 */

const LOGO_ASPECT = 1486 / 466;

async function loadLogoDataUrl(): Promise<string> {
  const response = await fetch(new URL("../../public/assets/logo.png", import.meta.url));
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...Array.from(bytes.subarray(i, i + 0x8000)));
  }
  return `data:image/png;base64,${btoa(binary)}`;
}

export async function renderBrandIcon(px: number) {
  const logo = await loadLogoDataUrl();
  const logoWidth = Math.round(px * 0.86);
  const logoHeight = Math.round(logoWidth / LOGO_ASPECT);

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
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={logo} width={logoWidth} height={logoHeight} />
      </div>
    ),
    { width: px, height: px }
  );
}
