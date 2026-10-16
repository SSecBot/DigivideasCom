import { describe, expect, it } from "vitest";
import { analyzeLead } from "@/lib/leads/scoring";
import { PlaceLead, WebsiteAudit } from "@/lib/leads/types";

const basePlace: PlaceLead = {
  placeId: "p1",
  name: "Kahve Durağı",
  address: "Torbalı, İzmir",
  rating: 4.7,
  ratingCount: 320,
  types: ["cafe", "food"],
  primaryType: "cafe",
  businessStatus: "OPERATIONAL",
};

const baseAudit: WebsiteAudit = {
  url: "https://ornek.com/",
  reachable: true,
  https: true,
  hasViewport: true,
  socials: { instagram: "https://instagram.com/ornek" },
  emails: [],
  hasMetaPixel: true,
  hasGoogleAnalytics: true,
  hasGoogleTagManager: false,
  hasGoogleAds: false,
  hasWhatsAppLink: false,
  checkedAt: "2026-10-16T00:00:00.000Z",
};

describe("analyzeLead", () => {
  it("rates a popular cafe without a website as a hot lead (Happy Path)", () => {
    // 1. Arrange
    const place = { ...basePlace, website: undefined };

    // 2. Act
    const result = analyzeLead(place);

    // 3. Assert
    expect(result.tier).toBe("Sıcak");
    expect(result.score).toBeGreaterThanOrEqual(65);
    expect(result.opportunities).toContain("Web sitesi / landing page tasarımı");
    expect(result.pitch).toContain("Kahve Durağı");
    expect(result.reasons[0].points).toBeGreaterThanOrEqual(result.reasons[result.reasons.length - 1].points);
  });

  it("returns score 0 for a permanently closed business (Edge Case 1)", () => {
    // 1. Arrange
    const place = { ...basePlace, businessStatus: "CLOSED_PERMANENTLY" };

    // 2. Act
    const result = analyzeLead(place);

    // 3. Assert
    expect(result.score).toBe(0);
    expect(result.tier).toBe("Soğuk");
    expect(result.opportunities).toEqual([]);
  });

  it("scores a digitally mature business lower than one with gaps (Edge Case 2)", () => {
    // 1. Arrange
    const place = { ...basePlace, website: "https://ornek.com" };
    const weakAudit: WebsiteAudit = { ...baseAudit, socials: {}, hasMetaPixel: false, hasGoogleAnalytics: false, hasViewport: false };

    // 2. Act
    const mature = analyzeLead(place, baseAudit);
    const weak = analyzeLead(place, weakAudit);

    // 3. Assert
    expect(weak.score).toBeGreaterThan(mature.score);
    expect(weak.opportunities).toContain("Meta Pixel & dönüşüm takibi kurulumu");
    expect(weak.opportunities).toContain("Instagram hesabı kurulumu & sosyal medya yönetimi");
  });

  it("never exceeds 100 points (Edge Case 3)", () => {
    // 1. Arrange
    const place = { ...basePlace, website: "https://ornek.com", rating: 4.9, ratingCount: 5000 };
    const brokenAudit: WebsiteAudit = { ...baseAudit, reachable: false, socials: {} };

    // 2. Act
    const result = analyzeLead(place, brokenAudit);

    // 3. Assert
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
