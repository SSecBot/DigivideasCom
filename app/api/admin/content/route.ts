import { NextRequest, NextResponse } from "next/server";
import { contentRepository } from "@/lib/server/repositories/content-repository";
import { requireAdmin } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  return NextResponse.json(await contentRepository.getAll(), {
    headers: { "Cache-Control": "no-store" },
  });
}
