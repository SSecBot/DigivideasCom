"use client";

/**
 * Shrinks large photos in the browser before upload: images wider/taller than
 * MAX_SIDE or heavier than RESIZE_ABOVE_BYTES are re-encoded as WebP (keeps PNG
 * transparency). Large PNG screenshots/designs used to fail the upload limit.
 * GIFs are left untouched (animation would be lost).
 */

const MAX_SIDE = 2400;
const RESIZE_ABOVE_BYTES = 1.5 * 1024 * 1024;
const QUALITY = 0.86;

export const SUPPORTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export function describeUnsupported(file: File): string | null {
  if (SUPPORTED_IMAGE_TYPES.includes(file.type)) return null;
  if (/\.(png|jpe?g|webp|gif)$/i.test(file.name)) return null;
  if (/heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)) {
    return `${file.name}: iPhone HEIC biçimi desteklenmiyor. Telefonda "En Uyumlu" (JPG) biçimini seçin ya da dosyayı JPG/PNG'ye çevirin.`;
  }
  return `${file.name}: desteklenmeyen dosya türü (PNG, JPG, WEBP veya GIF yükleyin).`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`${file.name} okunamadı (dosya bozuk olabilir)`));
    };
    image.src = url;
  });
}

export async function optimizeImage(file: File): Promise<File> {
  if (file.type === "image/gif" || /\.gif$/i.test(file.name)) return file;
  const image = await loadImage(file);
  const largestSide = Math.max(image.naturalWidth, image.naturalHeight);
  if (largestSide <= MAX_SIDE && file.size <= RESIZE_ABOVE_BYTES) return file;

  const scale = Math.min(1, MAX_SIDE / largestSide);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", QUALITY));
  // Some browsers cannot encode WebP; keep the original then (the server still checks the size)
  if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
}
