import { NextRequest, NextResponse } from "next/server";
import { getRunningJob, serializeJob, startScrapeJob } from "@/lib/server/leads/scrape-jobs";
import { rateLimit } from "@/lib/server/security/rate-limit";
import { jsonError, readJsonBody, requireAdmin } from "@/lib/server/http";

export const runtime = "nodejs";

const ALLOWED_LIMITS = new Set([10, 20, 40, 60]);

/** Starts a browser-based Google Maps scrape (free alternative to the Places API). */
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const running = getRunningJob();
  if (running) {
    return NextResponse.json(
      { error: "Zaten devam eden bir tarama var. Bitmesini bekleyin veya iptal edin.", job: serializeJob(running) },
      { status: 409 }
    );
  }
  // Keeps the server's IP from being flagged by Google
  if (!rateLimit("leads:scrape", 20, 60 * 60 * 1000).allowed) {
    return jsonError("Saatlik tarama limiti doldu (20). Biraz sonra tekrar deneyin.", 429);
  }

  const body = await readJsonBody<{ query?: unknown; limit?: unknown }>(request, 4_000);
  const query = typeof body?.query === "string" ? body.query.trim().slice(0, 200) : "";
  const limit = ALLOWED_LIMITS.has(Number(body?.limit)) ? Number(body?.limit) : 20;
  if (query.length < 3) return jsonError("Arama metni en az 3 karakter olmalı (örn. kafe Torbalı İzmir)", 400);

  return NextResponse.json(serializeJob(startScrapeJob(query, limit)), { status: 202 });
}
