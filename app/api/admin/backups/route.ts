import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import { BackupError, createBackup, listBackups } from "@/lib/server/backup/backup-service";
import { resolveDataPath } from "@/lib/server/storage/json-store";
import { jsonError, requireAdmin } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function contentCustomized(): Promise<boolean> {
  try {
    await fs.access(resolveDataPath("content.json"));
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  return NextResponse.json(
    { backups: await listBackups(), contentCustomized: await contentCustomized() },
    { headers: { "Cache-Control": "no-store" } }
  );
}

/** Creates a manual backup (or "eski-veri-aktarimi-oncesi" before importing legacy browser data). */
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as { reason?: string };
  const reason = body.reason === "eski-veri-aktarimi-oncesi" ? "eski-veri-aktarimi-oncesi" : "manuel";
  try {
    return NextResponse.json(await createBackup(reason), { status: 201 });
  } catch (error) {
    if (error instanceof BackupError) return jsonError(error.message, 422);
    throw error;
  }
}
