/**
 * URL / string sanitizers shared by the client and the server.
 * Anything rendered into href/src that may come from the CMS goes through here
 * to block `javascript:`, `data:text/html` and protocol-relative injections.
 */

const SAFE_LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const SAFE_DATA_IMAGE = /^data:image\/(png|jpe?g|webp|gif|avif);base64,[a-z0-9+/=\s]+$/i;

export function safeHref(value: string | undefined | null, fallback = "#"): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (trimmed.startsWith("#")) return trimmed;
  try {
    const url = new URL(trimmed);
    return SAFE_LINK_PROTOCOLS.has(url.protocol) ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

export function safeImageSrc(value: string | undefined | null, fallback = ""): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (SAFE_DATA_IMAGE.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

export function clampString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.slice(0, maxLength);
}

export function toStringArray(value: unknown, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .slice(0, maxItems)
    .map((item) => item.slice(0, maxLength));
}

/** Converts a phone number into the digits-only form used by wa.me links. */
export function toWhatsAppDigits(phone: string | undefined, fallback = "905492115561"): string {
  const digits = (phone || "").replace(/[^0-9]/g, "");
  return digits.length >= 10 ? digits : fallback;
}
