import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Small helpers for secrets that must be stored on disk:
 * - sealSecret/openSecret: AES-256-GCM, for values the admin needs back later
 *   (SMTP password, payment-link token so the link can be copied again);
 * - hashToken: SHA-256, for looking up payment links without storing them in clear.
 * The key comes from SETTINGS_ENCRYPTION_KEY, or is derived from ADMIN_SESSION_SECRET.
 * Changing that key makes sealed values unreadable (SMTP password must be re-entered).
 */

export class SecretBoxError extends Error {}

function key(): Buffer {
  const material = process.env.SETTINGS_ENCRYPTION_KEY || process.env.ADMIN_SESSION_SECRET || "";
  if (material.length < 32) {
    throw new SecretBoxError("SETTINGS_ENCRYPTION_KEY veya ADMIN_SESSION_SECRET en az 32 karakter olmalı");
  }
  return Buffer.from(hkdfSync("sha256", material, "digivideas", "settings-encryption-v1", 32));
}

export function sealSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function openSecret(sealed: string): string {
  const [version, iv, tag, data] = sealed.split(".");
  if (version !== "v1" || !iv || !tag || !data) throw new SecretBoxError("Şifreli değer okunamadı");
  try {
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    throw new SecretBoxError("Şifreli değer çözülemedi (anahtar değişmiş olabilir)");
  }
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function newToken(): string {
  return randomBytes(32).toString("base64url"); // 256-bit, URL-safe
}

export function sameHash(a: string, b: string): boolean {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && left.length > 0 && timingSafeEqual(left, right);
}
