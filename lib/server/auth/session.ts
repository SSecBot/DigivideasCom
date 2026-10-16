import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Stateless admin session tokens: `<expiresAtMs>.<nonce>.<hmac>` signed with
 * ADMIN_SESSION_SECRET. The token lives only in an httpOnly cookie, so client
 * JavaScript can neither read nor forge it.
 */

export const ADMIN_COOKIE_NAME = "dv_admin_session";
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const MIN_SECRET_LENGTH = 32;

export class AuthConfigError extends Error {}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || "";
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new AuthConfigError(
      `ADMIN_SESSION_SECRET en az ${MIN_SECRET_LENGTH} karakter olmalıdır (.env dosyasını kontrol edin).`
    );
  }
  return secret;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function createSessionToken(now = Date.now(), secret = getSecret()): string {
  const payload = `${now + SESSION_TTL_MS}.${randomBytes(16).toString("base64url")}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(
  token: string | undefined,
  now = Date.now(),
  secret = getSecret()
): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expiresAt, nonce, signature] = parts;
  const expires = Number(expiresAt);
  if (!Number.isFinite(expires) || expires < now) return false;
  return safeEqual(signature, sign(`${expiresAt}.${nonce}`, secret));
}

/**
 * Compares the submitted passcode against ADMIN_PASSCODE in constant time.
 * Both sides are hashed first so their lengths never leak.
 */
export function checkPasscode(submitted: string, expected = process.env.ADMIN_PASSCODE || ""): boolean {
  if (!expected) {
    throw new AuthConfigError("ADMIN_PASSCODE tanımlı değil (.env dosyasını kontrol edin).");
  }
  const hash = (value: string) => createHmac("sha256", "dv-passcode").update(value).digest();
  return timingSafeEqual(hash(submitted.trim()), hash(expected.trim()));
}
