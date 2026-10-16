import { NextRequest, NextResponse } from "next/server";
import { LeadPatch, leadRepository } from "@/lib/server/repositories/lead-repository";
import { analyzeLead } from "@/lib/leads/scoring";
import { jsonError, readJsonBody, requireAdmin } from "@/lib/server/http";
import { LEAD_STATUS_LABELS, LeadStatus, WebsiteAudit } from "@/lib/leads/types";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const body = await readJsonBody<{ status?: string; notes?: unknown; audit?: WebsiteAudit }>(request, 50_000);
  if (!body) return jsonError("Geçersiz istek", 400);

  const patch: LeadPatch = {};
  if (body.status !== undefined) {
    if (!(body.status in LEAD_STATUS_LABELS)) return jsonError("Geçersiz durum", 400);
    patch.status = body.status as LeadStatus;
  }
  if (typeof body.notes === "string") patch.notes = body.notes.slice(0, 5_000);
  if (body.audit) {
    const current = await leadRepository.findById(params.id);
    if (current) {
      patch.audit = body.audit;
      patch.analysis = analyzeLead(current.place, body.audit);
    }
  }

  const lead = await leadRepository.update(params.id, patch);
  return lead ? NextResponse.json(lead) : jsonError("Kayıt bulunamadı", 404);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const removed = await leadRepository.softDelete(params.id);
  return removed ? NextResponse.json({ ok: true }) : jsonError("Kayıt bulunamadı", 404);
}
