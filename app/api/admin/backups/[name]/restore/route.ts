import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { BackupError, restoreBackup } from "@/lib/server/backup/backup-service";
import { resetAnalyticsCache } from "@/lib/server/repositories/analytics-repository";
import { jsonError, readJsonBody, requireAdmin } from "@/lib/server/http";

export const runtime = "nodejs";

/** Restores a backup. The current state is backed up first ("geri-yukleme-oncesi"). */
export async function POST(request: NextRequest, { params }: { params: { name: string } }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = await readJsonBody<{ confirm?: unknown }>(request, 1_000);
  if (body?.confirm !== "GERİ YÜKLE") return jsonError("Onay metni eksik", 400);
  try {
    const result = await restoreBackup(params.name);
    resetAnalyticsCache();
    revalidatePath("/", "layout");
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof BackupError) return jsonError(error.message, 422);
    throw error;
  }
}
