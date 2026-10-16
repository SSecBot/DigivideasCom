import { NextRequest, NextResponse } from "next/server";
import { leadRepository } from "@/lib/server/repositories/lead-repository";
import { analyzeLead } from "@/lib/leads/scoring";
import { jsonError, readJsonBody, requireAdmin } from "@/lib/server/http";
import { PlaceLead, WebsiteAudit } from "@/lib/leads/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  return NextResponse.json(await leadRepository.list(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const body = await readJsonBody<{ place?: PlaceLead; audit?: WebsiteAudit; searchQuery?: string }>(request, 50_000);
  const place = body?.place;
  if (!place || typeof place.placeId !== "string" || typeof place.name !== "string" || !Array.isArray(place.types)) {
    return jsonError("Geçersiz işletme verisi", 400);
  }
  // The analysis is recomputed on the server instead of trusting the client's copy.
  const lead = await leadRepository.upsert({
    place,
    audit: body?.audit,
    analysis: analyzeLead(place, body?.audit),
    searchQuery: typeof body?.searchQuery === "string" ? body.searchQuery.slice(0, 200) : undefined,
  });
  return NextResponse.json(lead, { status: 201 });
}
