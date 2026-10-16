import { renderBrandIcon } from "@/lib/seo/brand-icon";

// Edge runtime: the Node build of @vercel/og fails on Windows paths with non-ASCII characters.
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return renderBrandIcon(size.width);
}
