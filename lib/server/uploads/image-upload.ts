/**
 * Image type detection by magic bytes. The browser-provided MIME type is never trusted,
 * and SVG is intentionally not accepted because it can carry scripts.
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const IMAGE_CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

export function detectImageExtension(bytes: Uint8Array): string | null {
  const startsWith = (signature: number[], offset = 0) =>
    signature.every((byte, i) => bytes[offset + i] === byte);

  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (startsWith([0xff, 0xd8, 0xff])) return "jpg";
  if (startsWith([0x47, 0x49, 0x46, 0x38])) return "gif";
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) return "webp";
  return null;
}

export const UPLOAD_FILE_PATTERN = /^[a-f0-9-]{36}\.(png|jpg|webp|gif)$/;
