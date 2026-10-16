import { NextRequest, NextResponse } from "next/server";
import { inquiryRepository } from "@/lib/server/repositories/inquiry-repository";
import { jsonError, requireAdmin } from "@/lib/server/http";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const removed = await inquiryRepository.softDelete(params.id);
  return removed ? NextResponse.json({ ok: true }) : jsonError("Talep bulunamadı", 404);
}
