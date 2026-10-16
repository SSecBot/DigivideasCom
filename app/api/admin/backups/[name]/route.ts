import { NextRequest, NextResponse } from "next/server";
import { BackupError, deleteBackup, readBackupFile } from "@/lib/server/backup/backup-service";
import { jsonError, requireAdmin } from "@/lib/server/http";

export const runtime = "nodejs";

/** Downloads a backup file to the admin's computer. */
export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const data = await readBackupFile(params.name);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${params.name}"`,
        "Content-Length": String(data.length),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof BackupError) return jsonError(error.message, 404);
    throw error;
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { name: string } }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    await deleteBackup(params.name);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof BackupError) return jsonError(error.message, 404);
    throw error;
  }
}
