import { describe, expect, it } from "vitest";
import { validateInquiry } from "@/lib/server/validation/inquiry";

const valid = {
  name: "Ayşe Yılmaz",
  email: "AYSE@Ornek.com ",
  phone: "0532 111 22 33",
  company: "Ornek Kafe",
  service: "Sosyal Medya Yönetimi",
  message: "Instagram reklamları için teklif almak istiyoruz.",
};

describe("validateInquiry", () => {
  it("accepts and cleans a valid contact form (Happy Path)", () => {
    // 1. Arrange
    const body = { ...valid, extra: "ignored" };

    // 2. Act
    const { data, error } = validateInquiry(body);

    // 3. Assert
    expect(error).toBeUndefined();
    expect(data?.email).toBe("ayse@ornek.com");
    expect(data).not.toHaveProperty("extra");
  });

  it("rejects invalid e-mail, phone and too-short messages (Edge Case 1)", () => {
    // 1. Arrange
    const cases = [
      { ...valid, email: "not-an-email" },
      { ...valid, phone: "abc" },
      { ...valid, message: "kısa" },
      { ...valid, name: "A" },
    ];

    // 2. Act
    const results = cases.map(validateInquiry);

    // 3. Assert
    expect(results.every((result) => result.error && !result.data)).toBe(true);
  });

  it("rejects non-object bodies and caps very long messages (Edge Case 2)", () => {
    // 1. Arrange
    const huge = { ...valid, message: "x".repeat(20_000) };

    // 2. Act
    const fromNull = validateInquiry(null);
    const fromHuge = validateInquiry(huge);

    // 3. Assert
    expect(fromNull.error).toBeDefined();
    expect(fromHuge.data?.message.length).toBe(5_000);
  });
});
