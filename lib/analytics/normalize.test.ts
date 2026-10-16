import { describe, expect, it } from "vitest";
import { normalizeCollectPayload } from "@/lib/analytics/normalize";

const context = {
  userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/129.0 Mobile Safari/537.36",
  siteHost: "digivideas.com",
  country: "TR",
  now: 1_790_000_000_000,
};

const validPageview = {
  type: "pageview",
  visitorId: "8f0f4f7e-1111-4222-8333-944455556666",
  sessionId: "0a0b0c0d-1111-4222-8333-944455556666",
  path: "/services?ref=x#top",
  title: "Hizmetlerimiz",
  referrer: "https://www.instagram.com/",
  utmSource: "Instagram",
  utmMedium: "paid_social",
  utmCampaign: "ekim-kampanyasi",
  language: "tr-TR",
  screenWidth: 412,
};

describe("normalizeCollectPayload", () => {
  it("turns a valid tracker payload into a stored event (Happy Path)", () => {
    // 1. Arrange
    const body = { ...validPageview };

    // 2. Act
    const event = normalizeCollectPayload(body, context);

    // 3. Assert
    expect(event).toMatchObject({
      type: "pageview",
      path: "/services",
      referrerHost: "instagram.com",
      channel: "Ücretli Reklam",
      utmSource: "instagram",
      device: "Mobil",
      os: "Android",
      country: "TR",
      language: "tr",
      ts: context.now,
    });
  });

  it("rejects bad ids, admin paths and protocol-relative paths (Edge Case 1)", () => {
    // 1. Arrange
    const invalid = [
      { ...validPageview, visitorId: "x" },
      { ...validPageview, path: "/dashboard/admin/digivideas" },
      { ...validPageview, path: "//evil.example/x" },
      { ...validPageview, type: "purchase" },
      null,
    ];

    // 2. Act
    const results = invalid.map((body) => normalizeCollectPayload(body, context));

    // 3. Assert
    expect(results.every((result) => result === null)).toBe(true);
  });

  it("validates custom event names and clamps engagement duration (Edge Case 2)", () => {
    // 1. Arrange
    const badEvent = { ...validPageview, type: "event", name: "<script>" };
    const longEngagement = { ...validPageview, type: "engagement", durationMs: 99_999_999 };

    // 2. Act
    const rejected = normalizeCollectPayload(badEvent, context);
    const clamped = normalizeCollectPayload(longEngagement, context);

    // 3. Assert
    expect(rejected).toBeNull();
    expect(clamped?.durationMs).toBe(30 * 60 * 1000);
  });
});
