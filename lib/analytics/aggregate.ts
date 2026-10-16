import {
  AnalyticsReport,
  CONVERSION_EVENTS,
  CampaignRow,
  CountRow,
  DailyPoint,
  KpiSet,
  PageRow,
  RealtimeReport,
  StoredAnalyticsEvent,
} from "@/lib/analytics/types";

/** Pure aggregation of stored events into dashboard reports (unit-tested). */

export const REPORT_TIMEZONE_OFFSET_MS = 3 * 60 * 60 * 1000; // Europe/Istanbul (UTC+3, no DST)
const ENGAGED_SECONDS = 10;
const conversionNames = new Set<string>(CONVERSION_EVENTS);

export function localDateKey(ts: number): string {
  return new Date(ts + REPORT_TIMEZONE_OFFSET_MS).toISOString().slice(0, 10);
}

function localHour(ts: number): number {
  return new Date(ts + REPORT_TIMEZONE_OFFSET_MS).getUTCHours();
}

function topCounts(map: Map<string, number>, limit = 10): CountRow[] {
  return Array.from(map.entries())
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function increment(map: Map<string, number>, key: string | undefined, by = 1) {
  if (!key) return;
  map.set(key, (map.get(key) ?? 0) + by);
}

interface SessionSummary {
  visitorId: string;
  firstTs: number;
  pageviews: number;
  durationMs: number;
  hasConversion: boolean;
  first?: StoredAnalyticsEvent; // first pageview: carries channel/device/source info
}

function summarizeSessions(events: StoredAnalyticsEvent[]): Map<string, SessionSummary> {
  const sessions = new Map<string, SessionSummary>();
  for (const event of events) {
    let session = sessions.get(event.sessionId);
    if (!session) {
      session = { visitorId: event.visitorId, firstTs: event.ts, pageviews: 0, durationMs: 0, hasConversion: false };
      sessions.set(event.sessionId, session);
    }
    if (event.type === "pageview") {
      session.pageviews += 1;
      if (!session.first || event.ts < session.first.ts) session.first = event;
    } else if (event.type === "engagement") {
      session.durationMs += event.durationMs ?? 0;
    } else if (event.type === "event" && event.name && conversionNames.has(event.name)) {
      session.hasConversion = true;
    }
    session.firstTs = Math.min(session.firstTs, event.ts);
  }
  // Sessions consisting only of engagement pings (e.g. pageview in previous range) are ignored.
  sessions.forEach((session, key) => {
    if (!session.first) sessions.delete(key);
  });
  return sessions;
}

export function computeKpis(
  events: StoredAnalyticsEvent[],
  isNewVisitor: (visitorId: string) => boolean = () => true
): KpiSet {
  const sessions = summarizeSessions(events);
  const visitors = new Set<string>();
  let pageviews = 0;
  let totalDuration = 0;
  let engaged = 0;
  let converted = 0;
  let conversions = 0;

  for (const event of events) {
    if (event.type === "pageview") {
      pageviews += 1;
      visitors.add(event.visitorId);
    } else if (event.type === "event" && event.name && conversionNames.has(event.name)) {
      conversions += 1;
    }
  }
  sessions.forEach((session) => {
    totalDuration += session.durationMs;
    const isEngaged = session.pageviews >= 2 || session.durationMs >= ENGAGED_SECONDS * 1000 || session.hasConversion;
    if (isEngaged) engaged += 1;
    if (session.hasConversion) converted += 1;
  });

  const sessionCount = sessions.size;
  let newVisitors = 0;
  visitors.forEach((visitorId) => {
    if (isNewVisitor(visitorId)) newVisitors += 1;
  });

  return {
    visitors: visitors.size,
    newVisitors,
    sessions: sessionCount,
    pageviews,
    avgSessionSeconds: sessionCount ? Math.round(totalDuration / sessionCount / 1000) : 0,
    bounceRate: sessionCount ? 1 - engaged / sessionCount : 0,
    pagesPerSession: sessionCount ? pageviews / sessionCount : 0,
    conversions,
    conversionRate: sessionCount ? converted / sessionCount : 0,
  };
}

export function listDateKeys(fromTs: number, days: number): string[] {
  const keys: string[] = [];
  for (let i = 0; i < days; i += 1) {
    keys.push(localDateKey(fromTs + i * 24 * 60 * 60 * 1000));
  }
  return keys;
}

export interface BuildReportInput {
  events: StoredAnalyticsEvent[];
  previousEvents: StoredAnalyticsEvent[];
  isNewVisitor: (visitorId: string) => boolean;
  fromTs: number;
  days: number;
}

export function buildReport({ events, previousEvents, isNewVisitor, fromTs, days }: BuildReportInput): AnalyticsReport {
  const dateKeys = listDateKeys(fromTs, days);
  const daily = new Map<string, { visitors: Set<string>; sessions: Set<string>; pageviews: number }>(
    dateKeys.map((key) => [key, { visitors: new Set(), sessions: new Set(), pageviews: 0 }])
  );

  const pages = new Map<string, { title?: string; pageviews: number; visitors: Set<string>; durationMs: number; engagements: number }>();
  const hours = new Array<number>(24).fill(0);
  const eventsCount = new Map<string, number>();

  for (const event of events) {
    if (event.type === "pageview") {
      const day = daily.get(localDateKey(event.ts));
      if (day) {
        day.pageviews += 1;
        day.visitors.add(event.visitorId);
        day.sessions.add(event.sessionId);
      }
      const page = pages.get(event.path) ?? { pageviews: 0, visitors: new Set<string>(), durationMs: 0, engagements: 0 };
      page.pageviews += 1;
      page.visitors.add(event.visitorId);
      if (event.title) page.title = event.title;
      pages.set(event.path, page);
      hours[localHour(event.ts)] += 1;
    } else if (event.type === "engagement") {
      const page = pages.get(event.path);
      if (page) {
        page.durationMs += event.durationMs ?? 0;
        page.engagements += 1;
      }
    } else if (event.type === "event" && event.name) {
      increment(eventsCount, event.name);
    }
  }

  const sessions = summarizeSessions(events);
  const channels = new Map<string, number>();
  const referrers = new Map<string, number>();
  const devices = new Map<string, number>();
  const browsers = new Map<string, number>();
  const operatingSystems = new Map<string, number>();
  const countries = new Map<string, number>();
  const languages = new Map<string, number>();
  const landingPages = new Map<string, number>();
  const campaigns = new Map<string, CampaignRow>();

  sessions.forEach((session) => {
    const first = session.first as StoredAnalyticsEvent;
    increment(channels, first.channel);
    increment(referrers, first.referrerHost);
    increment(devices, first.device);
    increment(browsers, first.browser);
    increment(operatingSystems, first.os);
    increment(countries, first.country);
    increment(languages, first.language);
    increment(landingPages, first.path);
    if (first.utmCampaign || first.utmSource) {
      const key = `${first.utmCampaign}|${first.utmSource}|${first.utmMedium}`;
      const row = campaigns.get(key) ?? {
        campaign: first.utmCampaign || "(belirtilmemiş)",
        source: first.utmSource || "(belirtilmemiş)",
        medium: first.utmMedium || "(belirtilmemiş)",
        sessions: 0,
        conversions: 0,
      };
      row.sessions += 1;
      if (session.hasConversion) row.conversions += 1;
      campaigns.set(key, row);
    }
  });

  const topPages: PageRow[] = Array.from(pages.entries())
    .map(([path, page]) => ({
      path,
      title: page.title,
      pageviews: page.pageviews,
      visitors: page.visitors.size,
      avgSeconds: page.engagements ? Math.round(page.durationMs / page.engagements / 1000) : 0,
    }))
    .sort((a, b) => b.pageviews - a.pageviews)
    .slice(0, 15);

  const dailyPoints: DailyPoint[] = dateKeys.map((date) => {
    const day = daily.get(date)!;
    return { date, visitors: day.visitors.size, sessions: day.sessions.size, pageviews: day.pageviews };
  });

  return {
    range: { from: dateKeys[0], to: dateKeys[dateKeys.length - 1], days },
    kpis: computeKpis(events, isNewVisitor),
    previousKpis: computeKpis(previousEvents),
    daily: dailyPoints,
    topPages,
    landingPages: topCounts(landingPages),
    channels: topCounts(channels),
    referrers: topCounts(referrers),
    campaigns: Array.from(campaigns.values()).sort((a, b) => b.sessions - a.sessions).slice(0, 15),
    devices: topCounts(devices),
    browsers: topCounts(browsers),
    operatingSystems: topCounts(operatingSystems),
    countries: topCounts(countries),
    languages: topCounts(languages),
    hours,
    events: topCounts(eventsCount, 20),
  };
}

export function buildRealtime(events: StoredAnalyticsEvent[], now: number): RealtimeReport {
  const activeSince = now - 5 * 60 * 1000;
  const windowStart = now - 30 * 60 * 1000;
  const active = new Set<string>();
  const pages = new Map<string, number>();
  const minutes = new Array<number>(30).fill(0);
  let pageviews = 0;

  for (const event of events) {
    if (event.ts < windowStart || event.ts > now) continue;
    if (event.ts >= activeSince) active.add(event.visitorId);
    if (event.type !== "pageview") continue;
    pageviews += 1;
    const bucket = Math.min(29, Math.floor((event.ts - windowStart) / 60_000));
    minutes[bucket] += 1;
    if (event.ts >= activeSince) increment(pages, event.path);
  }

  return { activeVisitors: active.size, pageviewsLast30Min: pageviews, pages: topCounts(pages, 8), minutes };
}
