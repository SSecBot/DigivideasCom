import { describe, expect, it } from "vitest";
import { ContentValidationError, normalizeCollection, normalizeNarrative } from "@/lib/server/validation/content";
import { initialSiteNarrative } from "@/lib/data/initial-data";

describe("normalizeCollection", () => {
  it("normalizes a promo and drops unknown fields (Happy Path)", () => {
    // 1. Arrange
    const items = [
      {
        id: "promo-1",
        brand: "LrWebs",
        title: "Web altyapınızı yeniden inşa edin",
        url: "https://lrwebs.com.tr",
        highlights: ["Next.js", 42, "SEO"],
        status: "published",
        order: 1,
        injected: "<script>alert(1)</script>",
      },
    ];

    // 2. Act
    const [promo] = normalizeCollection("promos", items);

    // 3. Assert
    expect(promo.url).toBe("https://lrwebs.com.tr/");
    expect(promo.highlights).toEqual(["Next.js", "SEO"]);
    expect(promo).not.toHaveProperty("injected");
  });

  it("strips javascript: links and unsafe image sources (Edge Case 1)", () => {
    // 1. Arrange
    const items = [
      {
        name: "Kötü Niyetli",
        liveUrl: "javascript:alert(document.cookie)",
        heroImage: "data:text/html;base64,PHNjcmlwdD4=",
        galleryImages: ["javascript:alert(1)", "/assets/ok.webp"],
      },
    ];

    // 2. Act
    const [customer] = normalizeCollection("customers", items);

    // 3. Assert
    expect(customer.liveUrl).toBeUndefined();
    expect(customer.heroImage).toBe("/assets/customers/laoscafe-hero.webp");
    expect(customer.galleryImages).toEqual(["/assets/ok.webp"]);
    expect(customer.slug).toBe("kotu-niyetli");
  });

  it("rejects duplicate slugs, missing titles and non-array payloads (Edge Case 2)", () => {
    // 1. Arrange
    const duplicates = [{ title: "SEO" }, { title: "seo" }];

    // 2. Act & 3. Assert
    expect(() => normalizeCollection("services", duplicates)).toThrow(ContentValidationError);
    expect(() => normalizeCollection("services", [{ title: "   " }])).toThrow(ContentValidationError);
    expect(() => normalizeCollection("faqs", "not-an-array")).toThrow(ContentValidationError);
    expect(() => normalizeCollection("promos", [{ brand: "X", title: "Y", url: "mailto:a@b.co" }])).toThrow(
      ContentValidationError
    );
  });
});

describe("normalizeNarrative", () => {
  it("keeps valid settings (Happy Path)", () => {
    // 1. Arrange
    const input = { ...initialSiteNarrative };

    // 2. Act
    const narrative = normalizeNarrative(input);

    // 3. Assert
    expect(narrative.instagramUrl).toBe("https://instagram.com/digivideas");
    expect(narrative.whatsappNumber).toBe("+905492115561");
  });

  it("removes unsafe social links and phone characters (Edge Case 1)", () => {
    // 1. Arrange
    const input = { ...initialSiteNarrative, facebookUrl: "javascript:alert(1)", whatsappNumber: "+90<b>549</b>" };

    // 2. Act
    const narrative = normalizeNarrative(input);

    // 3. Assert
    expect(narrative.facebookUrl).toBeUndefined();
    expect(narrative.whatsappNumber).toBe("+90549");
  });

  it("throws on a non-object payload (Edge Case 2)", () => {
    // 1. Arrange
    const input = ["not", "an", "object"];

    // 2. Act & 3. Assert
    expect(() => normalizeNarrative(input)).toThrow(ContentValidationError);
  });
});
