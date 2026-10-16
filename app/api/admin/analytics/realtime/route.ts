import { NextRequest, NextResponse } from "next/server";
import { buildRealtime } from "@/lib/analytics/aggregate";
import { analyticsRepository } from "@/lib/server/repositories/analytics-repository";
import { requireAdmin } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const now = Date.now();
  const events = await analyticsRepository.readRange(now - 30 * 60 * 1000, now + 1);
  return NextResponse.json(buildRealtime(events, now), { headers: { "Cache-Control": "no-store" } });
}
