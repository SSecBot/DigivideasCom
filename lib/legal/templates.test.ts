import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DEFAULT_LEGAL_PAGES, companyVariables, renderTemplate } from "@/lib/legal/templates";
import { initialSiteNarrative } from "@/lib/data/initial-data";
import { SecretBoxError, hashToken, newToken, openSecret, sameHash, sealSecret } from "@/lib/server/security/secret-box";

describe("renderTemplate", () => {
  it("fills company placeholders from the admin settings (Happy Path)", () => {
    // 1. Arrange
    const narrative = { ...initialSiteNarrative, companyTitle: "digivideas Dijital Reklam", companyEmail: "info@digivideas.com" };

    // 2. Act
    const text = renderTemplate("{{firma_unvani}} · {{ firma_eposta }} · {{site_adresi}}", companyVariables(narrative, "https://digivideas.com"));

    // 3. Assert
    expect(text).toBe("digivideas Dijital Reklam · info@digivideas.com · https://digivideas.com");
  });

  it("marks missing known values instead of hiding them (Edge Case 1)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(renderTemplate("Vergi no: {{vergi_no}}", {})).toBe("Vergi no: [Vergi numarası]");
    expect(renderTemplate("Alıcı: {{alici_adi}}", {})).toBe("Alıcı: [Alıcının adı soyadı]");
    expect(renderTemplate("MERSİS: {{mersis_no}} · KEP: {{kep_adresi}}", {})).toBe("MERSİS: - · KEP: -"); // optional fields
  });

  it("leaves unknown placeholders untouched and ships all three pages (Edge Case 2)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(renderTemplate("{{bilinmeyen}}", {})).toBe("{{bilinmeyen}}");
    expect(DEFAULT_LEGAL_PAGES.map((page) => page.slug).sort()).toEqual(["gizlilik-sozlesmesi", "mesafeli-satis-sozlesmesi", "teslimat-ve-iade"]);
  });
});

describe("secret box", () => {
  const previous = process.env.ADMIN_SESSION_SECRET;
  beforeAll(() => {
    process.env.ADMIN_SESSION_SECRET = "test-secret-that-is-definitely-longer-than-32-chars";
  });
  afterAll(() => {
    process.env.ADMIN_SESSION_SECRET = previous;
  });

  it("round-trips sealed secrets (Happy Path)", () => {
    // 1. Arrange & 2. Act
    const sealed = sealSecret("uygulama-şifresi");

    // 3. Assert
    expect(sealed).not.toContain("uygulama");
    expect(openSecret(sealed)).toBe("uygulama-şifresi");
  });

  it("detects tampering and a changed key (Edge Case 1)", () => {
    // 1. Arrange
    const sealed = sealSecret("x");
    const tampered = `${sealed.slice(0, -2)}AA`;

    // 2. Act & 3. Assert
    expect(() => openSecret(tampered)).toThrow(SecretBoxError);
    process.env.ADMIN_SESSION_SECRET = "another-secret-that-is-also-longer-than-32-chars";
    expect(() => openSecret(sealed)).toThrow(SecretBoxError);
    process.env.ADMIN_SESSION_SECRET = "test-secret-that-is-definitely-longer-than-32-chars";
  });

  it("creates long random tokens and compares hashes safely (Edge Case 2)", () => {
    // 1. Arrange
    const a = newToken();
    const b = newToken();

    // 2. Act & 3. Assert
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(a).not.toBe(b);
    expect(sameHash(hashToken(a), hashToken(a))).toBe(true);
    expect(sameHash(hashToken(a), hashToken(b))).toBe(false);
    expect(sameHash("", "")).toBe(false);
  });
});
