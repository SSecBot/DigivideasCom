import { NextRequest, NextResponse } from "next/server";
import { BackupError, importBackupFile } from "@/lib/server/backup/backup-service";
import { jsonError, requireAdmin } from "@/lib/server/http";

export const runtime = "nodejs";

/** Uploads a backup file from the admin's computer (e.g. when moving to a new server). */
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return jsonError("Yedek dosyası seçilmedi", 400);
  try {
    return NextResponse.json(await importBackupFile(Buffer.from(await file.arrayBuffer())), { status: 201 });
  } catch (error) {
    if (error instanceof BackupError) return jsonError(error.message, 422);
    throw error;
  }
}
