import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { contentRepository } from "@/lib/server/repositories/content-repository";
import { requireAdmin } from "@/lib/server/http";

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const snapshot = await contentRepository.resetToDefaults();
  revalidatePath("/", "layout");
  return NextResponse.json(snapshot);
}
