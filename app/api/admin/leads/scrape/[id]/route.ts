import { NextRequest, NextResponse } from "next/server";
import { cancelJob, getJob, serializeJob } from "@/lib/server/leads/scrape-jobs";
import { jsonError, requireAdmin } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const job = getJob(params.id);
  if (!job) return jsonError("Tarama bulunamadı (süresi dolmuş olabilir)", 404);
  return NextResponse.json(serializeJob(job), { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  return cancelJob(params.id) ? NextResponse.json({ ok: true }) : jsonError("Çalışan bir tarama bulunamadı", 404);
}
