import { NextRequest, NextResponse } from "next/server";
import { CrmCollection } from "@/lib/crm/types";
import { crmRepositories } from "@/lib/server/repositories/crm-repository";
import { updatePayment, updateProposal } from "@/lib/server/crm/crm-service";
import { CrmValidationError, normalizeClient, normalizeEvent } from "@/lib/server/validation/crm";
import { jsonError, readJsonBody, requireAdmin } from "@/lib/server/http";

const COLLECTIONS = new Set<CrmCollection>(["clients", "proposals", "payments", "events"]);

type Params = { params: { collection: string; id: string } };

export async function PATCH(request: NextRequest, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const collection = params.collection as CrmCollection;
  if (!COLLECTIONS.has(collection)) return jsonError("Bilinmeyen koleksiyon", 404);

  const body = await readJsonBody<unknown>(request, 200_000);
  if (body === null) return jsonError("Geçersiz istek gövdesi", 400);

  try {
    let result: unknown = null;
    switch (collection) {
      case "clients": {
        const data = normalizeClient(body);
        result = await crmRepositories.clients.update(params.id, () => data);
        break;
      }
      case "proposals":
        result = await updateProposal(params.id, body);
        break;
      case "payments":
        result = await updatePayment(params.id, body);
        break;
      case "events": {
        const data = normalizeEvent(body);
        result = await crmRepositories.events.update(params.id, () => data);
        break;
      }
    }
    return result ? NextResponse.json(result) : jsonError("Kayıt bulunamadı", 404);
  } catch (error) {
    if (error instanceof CrmValidationError) return jsonError(error.message, 422);
    throw error;
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const collection = params.collection as CrmCollection;
  if (!COLLECTIONS.has(collection)) return jsonError("Bilinmeyen koleksiyon", 404);
  const removed = await crmRepositories[collection].softDelete(params.id);
  return removed ? NextResponse.json({ ok: true }) : jsonError("Kayıt bulunamadı", 404);
}
