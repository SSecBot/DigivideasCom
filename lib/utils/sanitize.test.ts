import { describe, expect, it } from "vitest";
import { safeHref, safeImageSrc, toWhatsAppDigits } from "@/lib/utils/sanitize";

describe("safeHref", () => {
  it("passes through http(s), mailto, tel and relative links (Happy Path)", () => {
    // 1. Arrange
    const links = ["https://lrwebs.com.tr", "mailto:info@digivideas.com", "tel:+905492115561", "/contact", "#faq"];

    // 2. Act
    const results = links.map((link) => safeHref(link));

    // 3. Assert
    expect(results).toEqual(["https://lrwebs.com.tr/", "mailto:info@digivideas.com", "tel:+905492115561", "/contact", "#faq"]);
  });

  it("blocks javascript:, data: and protocol-relative URLs (Edge Case 1)", () => {
    // 1. Arrange
    const links = ["javascript:alert(1)", " JaVaScRiPt:alert(1)", "data:text/html,<script>", "//evil.example"];

    // 2. Act
    const results = links.map((link) => safeHref(link, "#"));

    // 3. Assert
    expect(results).toEqual(["#", "#", "#", "#"]);
  });

  it("returns the fallback for empty values (Edge Case 2)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(safeHref(undefined, "/x")).toBe("/x");
    expect(safeHref("", "/x")).toBe("/x");
  });
});

describe("safeImageSrc / toWhatsAppDigits", () => {
  it("accepts raster data images and normalizes phone numbers (Happy Path)", () => {
    // 1. Arrange
    const png = "data:image/png;base64,iVBORw0KGgo=";

    // 2. Act & 3. Assert
    expect(safeImageSrc(png)).toBe(png);
    expect(toWhatsAppDigits("+90 (549) 211 55 61")).toBe("905492115561");
  });

  it("rejects SVG data URLs which can carry scripts (Edge Case 1)", () => {
    // 1. Arrange
    const svg = "data:image/svg+xml;base64,PHN2Zz4=";

    // 2. Act & 3. Assert
    expect(safeImageSrc(svg, "/fallback.png")).toBe("/fallback.png");
  });

  it("falls back for too-short phone numbers (Edge Case 2)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(toWhatsAppDigits("123")).toBe("905492115561");
    expect(toWhatsAppDigits(undefined, "")).toBe("");
  });
});
