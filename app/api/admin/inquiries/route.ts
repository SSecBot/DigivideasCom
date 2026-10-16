import { NextRequest, NextResponse } from "next/server";
import { inquiryRepository } from "@/lib/server/repositories/inquiry-repository";
import { requireAdmin } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  return NextResponse.json(await inquiryRepository.list(), {
    headers: { "Cache-Control": "no-store" },
  });
}
