import { NextRequest, NextResponse } from "next/server";
import { PlacesApiError, PlacesConfigError, searchPlaces } from "@/lib/server/leads/google-places";
import { analyzeLead } from "@/lib/leads/scoring";
import { rateLimit } from "@/lib/server/security/rate-limit";
import { jsonError, readJsonBody, requireAdmin } from "@/lib/server/http";
import { LeadSearchResponse } from "@/lib/leads/types";

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  // Protects the Google Cloud bill from runaway clicking.
  if (!rateLimit("leads:search", 60, 60 * 60 * 1000).allowed) {
    return jsonError("Saatlik arama limiti doldu (60). Biraz sonra tekrar deneyin.", 429);
  }

  const body = await readJsonBody<{ query?: unknown; pageToken?: unknown }>(request, 4_000);
  const query = typeof body?.query === "string" ? body.query.trim().slice(0, 200) : "";
  const pageToken = typeof body?.pageToken === "string" ? body.pageToken.slice(0, 1000) : undefined;
  if (query.length < 3) {
    return jsonError("Arama metni en az 3 karakter olmalı (örn. kafe Torbalı İzmir)", 400);
  }

  try {
    const { places, nextPageToken } = await searchPlaces(query, pageToken);
    const response: LeadSearchResponse = {
      leads: places.map((place) => ({ ...place, analysis: analyzeLead(place) })),
      nextPageToken,
    };
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof PlacesConfigError) return jsonError(error.message, 503);
    if (error instanceof PlacesApiError) return jsonError(error.message, 502);
    throw error;
  }
}
