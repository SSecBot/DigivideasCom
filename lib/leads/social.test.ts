import { describe, expect, it } from "vitest";
import { analyzeLead } from "@/lib/leads/scoring";
import { isSocialUrl, ownWebsite } from "@/lib/leads/social";
import { PlaceLead } from "@/lib/leads/types";

describe("isSocialUrl / ownWebsite", () => {
  it("keeps a business's own domain (Happy Path)", () => {
    // 1. Arrange
    const url = "https://kahveduragi.com.tr";

    // 2. Act & 3. Assert
    expect(isSocialUrl(url)).toBe(false);
    expect(ownWebsite(url)).toBe(url);
  });

  it("treats Instagram, marketplaces and subdomains as no website (Edge Case 1)", () => {
    // 1. Arrange
    const urls = ["https://www.instagram.com/kahve", "https://tr-tr.facebook.com/kahve", "https://www.trendyol.com/magaza/x"];

    // 2. Act & 3. Assert
    for (const url of urls) {
      expect(isSocialUrl(url)).toBe(true);
      expect(ownWebsite(url)).toBeUndefined();
    }
  });

  it("does not match look-alike domains or invalid URLs (Edge Case 2)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(isSocialUrl("https://notinstagram.com")).toBe(false);
    expect(isSocialUrl("not a url")).toBe(false);
    expect(ownWebsite(undefined)).toBeUndefined();
  });
});

describe("analyzeLead with scraped (Turkish label) places", () => {
  const scraped: PlaceLead = {
    placeId: "maps:1",
    name: "Gül Güzellik Salonu",
    address: "Torbalı",
    rating: 4.8,
    ratingCount: 95,
    types: [],
    primaryTypeLabel: "Güzellik salonu",
    businessStatus: "OPERATIONAL",
  };

  it("recognises a high-fit sector from the Turkish category (Happy Path)", () => {
    // 1. Arrange & 2. Act
    const result = analyzeLead(scraped);

    // 3. Assert
    expect(result.reasons.some((r) => r.points === 25 && r.text.includes("çok uygun"))).toBe(true);
  });

  it("counts an Instagram-only listing as having no website (Edge Case 1)", () => {
    // 1. Arrange
    const place = { ...scraped, website: "https://instagram.com/gulguzellik" };

    // 2. Act
    const result = analyzeLead(place);

    // 3. Assert
    expect(result.reasons.some((r) => r.text.includes("Kendi web sitesi yok"))).toBe(true);
    expect(result.opportunities).toContain("Web sitesi / landing page tasarımı");
  });

  it("does not treat a petrol station as a pet shop (Edge Case 2)", () => {
    // 1. Arrange
    const place = { ...scraped, primaryTypeLabel: "Petrol istasyonu" };

    // 2. Act
    const result = analyzeLead(place);

    // 3. Assert
    expect(result.reasons.some((r) => r.points === 25)).toBe(false);
  });
});
