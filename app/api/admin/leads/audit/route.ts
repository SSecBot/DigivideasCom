import { NextRequest, NextResponse } from "next/server";
import { AuditBlockedError, auditWebsite } from "@/lib/server/leads/website-audit";
import { analyzeLead } from "@/lib/leads/scoring";
import { rateLimit } from "@/lib/server/security/rate-limit";
import { jsonError, readJsonBody, requireAdmin } from "@/lib/server/http";
import { PlaceLead } from "@/lib/leads/types";

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!rateLimit("leads:audit", 120, 60 * 60 * 1000).allowed) {
    return jsonError("Saatlik site analizi limiti doldu.", 429);
  }

  const body = await readJsonBody<{ place?: PlaceLead }>(request, 20_000);
  const place = body?.place;
  if (!place || typeof place.website !== "string" || !Array.isArray(place.types)) {
    return jsonError("Analiz için web sitesi olan bir işletme gerekli", 400);
  }

  try {
    const audit = await auditWebsite(place.website);
    return NextResponse.json({ audit, analysis: analyzeLead(place, audit) });
  } catch (error) {
    if (error instanceof AuditBlockedError) return jsonError(error.message, 422);
    throw error;
  }
}
