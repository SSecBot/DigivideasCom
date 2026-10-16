import { describe, expect, it } from "vitest";
import { buildRealtime, buildReport, computeKpis, localDateKey } from "@/lib/analytics/aggregate";
import { StoredAnalyticsEvent } from "@/lib/analytics/types";

const T0 = Date.UTC(2026, 9, 16, 9, 0, 0); // 12:00 in Istanbul

function event(partial: Partial<StoredAnalyticsEvent>): StoredAnalyticsEvent {
  return {
    type: "pageview",
    ts: T0,
    visitorId: "visitor-a",
    sessionId: "session-a",
    path: "/",
    channel: "Doğrudan",
    device: "Mobil",
    browser: "Chrome",
    os: "Android",
    ...partial,
  };
}

describe("computeKpis", () => {
  it("counts visitors, sessions, bounce and conversions (Happy Path)", () => {
    // 1. Arrange
    const events = [
      // engaged session: 2 pages + a conversion
      event({ ts: T0 }),
      event({ ts: T0 + 1000, path: "/contact" }),
      event({ ts: T0 + 2000, type: "engagement", durationMs: 40_000 }),
      event({ ts: T0 + 3000, type: "event", name: "whatsapp_click" }),
      // bounced session: 1 page, 3 seconds
      event({ ts: T0, visitorId: "visitor-b", sessionId: "session-b" }),
      event({ ts: T0 + 3000, visitorId: "visitor-b", sessionId: "session-b", type: "engagement", durationMs: 3000 }),
    ];

    // 2. Act
    const kpis = computeKpis(events);

    // 3. Assert
    expect(kpis.visitors).toBe(2);
    expect(kpis.sessions).toBe(2);
    expect(kpis.pageviews).toBe(3);
    expect(kpis.bounceRate).toBeCloseTo(0.5);
    expect(kpis.conversions).toBe(1);
    expect(kpis.conversionRate).toBeCloseTo(0.5);
    expect(kpis.avgSessionSeconds).toBe(22); // (40 + 3) / 2 sessions
  });

  it("returns zeros instead of NaN for an empty range (Edge Case 1)", () => {
    // 1. Arrange
    const events: StoredAnalyticsEvent[] = [];

    // 2. Act
    const kpis = computeKpis(events);

    // 3. Assert
    expect(kpis).toMatchObject({ visitors: 0, sessions: 0, bounceRate: 0, pagesPerSession: 0, conversionRate: 0 });
  });

  it("ignores sessions that only contain engagement pings (Edge Case 2)", () => {
    // 1. Arrange
    const events = [event({ type: "engagement", durationMs: 5000, sessionId: "orphan" })];

    // 2. Act
    const kpis = computeKpis(events);

    // 3. Assert
    expect(kpis.sessions).toBe(0);
    expect(kpis.avgSessionSeconds).toBe(0);
  });
});

describe("buildReport", () => {
  it("fills every day of the range and attributes sessions to channels (Happy Path)", () => {
    // 1. Arrange
    const fromTs = T0 - 2 * 24 * 60 * 60 * 1000;
    const events = [
      event({ channel: "Sosyal Medya", referrerHost: "instagram.com", utmCampaign: "ekim", utmSource: "instagram" }),
      event({ visitorId: "visitor-b", sessionId: "session-b", channel: "Organik Arama", path: "/services" }),
    ];

    // 2. Act
    const report = buildReport({ events, previousEvents: [], isNewVisitor: () => true, fromTs, days: 3 });

    // 3. Assert
    expect(report.daily).toHaveLength(3);
    expect(report.daily[2]).toMatchObject({ date: localDateKey(T0), visitors: 2, pageviews: 2 });
    expect(report.channels.map((row) => row.key).sort()).toEqual(["Organik Arama", "Sosyal Medya"]);
    expect(report.campaigns[0]).toMatchObject({ campaign: "ekim", source: "instagram", sessions: 1 });
    expect(report.hours[12]).toBe(2);
  });

  it("uses the Istanbul day boundary, not UTC (Edge Case 1)", () => {
    // 1. Arrange: 22:30 UTC is already the next day in Istanbul
    const lateUtc = Date.UTC(2026, 9, 16, 22, 30, 0);

    // 2. Act
    const key = localDateKey(lateUtc);

    // 3. Assert
    expect(key).toBe("2026-10-17");
  });

  it("reports returning visitors via the isNewVisitor callback (Edge Case 2)", () => {
    // 1. Arrange
    const events = [event({}), event({ visitorId: "visitor-old", sessionId: "s-old" })];

    // 2. Act
    const report = buildReport({
      events,
      previousEvents: [],
      isNewVisitor: (id) => id !== "visitor-old",
      fromTs: T0,
      days: 1,
    });

    // 3. Assert
    expect(report.kpis.visitors).toBe(2);
    expect(report.kpis.newVisitors).toBe(1);
  });
});

describe("buildRealtime", () => {
  it("counts visitors active in the last five minutes (Happy Path)", () => {
    // 1. Arrange
    const now = T0 + 10 * 60 * 1000;
    const events = [
      event({ ts: now - 60_000, path: "/blog" }),
      event({ ts: now - 20 * 60_000, visitorId: "visitor-b", sessionId: "session-b" }),
    ];

    // 2. Act
    const realtime = buildRealtime(events, now);

    // 3. Assert
    expect(realtime.activeVisitors).toBe(1);
    expect(realtime.pageviewsLast30Min).toBe(2);
    expect(realtime.pages).toEqual([{ key: "/blog", value: 1 }]);
  });

  it("ignores events outside the 30 minute window or in the future (Edge Case 1)", () => {
    // 1. Arrange
    const now = T0;
    const events = [event({ ts: now - 31 * 60_000 }), event({ ts: now + 60_000 })];

    // 2. Act
    const realtime = buildRealtime(events, now);

    // 3. Assert
    expect(realtime.pageviewsLast30Min).toBe(0);
    expect(realtime.activeVisitors).toBe(0);
  });

  it("always returns 30 minute buckets (Edge Case 2)", () => {
    // 1. Arrange & 2. Act
    const realtime = buildRealtime([], T0);

    // 3. Assert
    expect(realtime.minutes).toHaveLength(30);
  });
});
