import { describe, expect, it } from "vitest";
import { AuthConfigError, SESSION_TTL_MS, checkPasscode, createSessionToken, verifySessionToken } from "@/lib/server/auth/session";

const SECRET = "test-secret-that-is-definitely-longer-than-32-chars";

describe("admin session tokens", () => {
  it("verifies a freshly created token (Happy Path)", () => {
    // 1. Arrange
    const now = 1_790_000_000_000;
    const token = createSessionToken(now, SECRET);

    // 2. Act
    const valid = verifySessionToken(token, now + 1000, SECRET);

    // 3. Assert
    expect(valid).toBe(true);
  });

  it("rejects expired, tampered and wrongly signed tokens (Edge Case 1)", () => {
    // 1. Arrange
    const now = 1_790_000_000_000;
    const token = createSessionToken(now, SECRET);
    const [expires, nonce, signature] = token.split(".");
    const extended = `${Number(expires) + 10 * SESSION_TTL_MS}.${nonce}.${signature}`;

    // 2. Act & 3. Assert
    expect(verifySessionToken(token, now + SESSION_TTL_MS + 1, SECRET)).toBe(false);
    expect(verifySessionToken(extended, now, SECRET)).toBe(false);
    expect(verifySessionToken(token, now, `${SECRET}-other`)).toBe(false);
    expect(verifySessionToken("garbage", now, SECRET)).toBe(false);
    expect(verifySessionToken(undefined, now, SECRET)).toBe(false);
  });

  it("refuses to sign with a missing or short secret (Edge Case 2)", () => {
    // 1. Arrange
    const shortSecret = "too-short";

    // 2. Act & 3. Assert
    expect(() => createSessionToken(Date.now(), shortSecret)).not.toThrow(); // explicit secrets are trusted
    const previous = process.env.ADMIN_SESSION_SECRET;
    process.env.ADMIN_SESSION_SECRET = shortSecret;
    try {
      expect(() => createSessionToken()).toThrow(AuthConfigError);
    } finally {
      process.env.ADMIN_SESSION_SECRET = previous;
    }
  });
});

describe("checkPasscode", () => {
  it("accepts the configured passcode, ignoring surrounding spaces (Happy Path)", () => {
    // 1. Arrange
    const expected = "Dogru-Sifre-123";

    // 2. Act
    const result = checkPasscode("  Dogru-Sifre-123 ", expected);

    // 3. Assert
    expect(result).toBe(true);
  });

  it("rejects a wrong passcode of any length (Edge Case 1)", () => {
    // 1. Arrange
    const expected = "Dogru-Sifre-123";

    // 2. Act & 3. Assert
    expect(checkPasscode("dogru-sifre-123", expected)).toBe(false);
    expect(checkPasscode("x", expected)).toBe(false);
    expect(checkPasscode("", expected)).toBe(false);
  });

  it("throws a configuration error when no passcode is configured (Edge Case 2)", () => {
    // 1. Arrange
    const expected = "";

    // 2. Act & 3. Assert
    expect(() => checkPasscode("anything", expected)).toThrow(AuthConfigError);
  });
});
