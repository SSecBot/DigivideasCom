import { NextRequest, NextResponse } from "next/server";
import { getRunningJob, serializeJob } from "@/lib/server/leads/scrape-jobs";
import { requireAdmin } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Tells the lead finder which search sources are available and resumes a running scrape. */
export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const running = getRunningJob();
  return NextResponse.json(
    {
      placesApi: Boolean(process.env.GOOGLE_MAPS_API_KEY),
      runningJob: running ? serializeJob(running) : null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
