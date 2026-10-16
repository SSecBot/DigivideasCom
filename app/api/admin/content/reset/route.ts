import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { contentRepository } from "@/lib/server/repositories/content-repository";
import { createBackup } from "@/lib/server/backup/backup-service";
import { requireAdmin } from "@/lib/server/http";

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  // Resetting is destructive: always keep a restorable copy of the current state first
  await createBackup("sifirlama-oncesi");
  const snapshot = await contentRepository.resetToDefaults();
  revalidatePath("/", "layout");
  return NextResponse.json(snapshot);
}
