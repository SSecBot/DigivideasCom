import { NextRequest, NextResponse } from "next/server";
import { buildReport } from "@/lib/analytics/aggregate";
import { analyticsRepository } from "@/lib/server/repositories/analytics-repository";
import { requireAdmin } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;
const ALLOWED_DAYS = new Set([1, 7, 28, 90, 365]);

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const requested = Number(request.nextUrl.searchParams.get("days") || 28);
  const days = ALLOWED_DAYS.has(requested) ? requested : 28;

  const now = Date.now();
  // Ranges are aligned to Europe/Istanbul midnight and include today.
  const offset = 3 * 60 * 60 * 1000;
  const todayStart = Math.floor((now + offset) / DAY_MS) * DAY_MS - offset;
  const fromTs = todayStart - (days - 1) * DAY_MS;
  const toTs = todayStart + DAY_MS;
  const previousFrom = fromTs - days * DAY_MS;

  const [events, previousEvents, firstSeen] = await Promise.all([
    analyticsRepository.readRange(fromTs, toTs),
    analyticsRepository.readRange(previousFrom, fromTs),
    analyticsRepository.firstSeenIndex(),
  ]);

  const report = buildReport({
    events,
    previousEvents,
    isNewVisitor: (visitorId) => (firstSeen[visitorId] ?? fromTs) >= fromTs,
    fromTs,
    days,
  });
  return NextResponse.json(report, { headers: { "Cache-Control": "no-store" } });
}
