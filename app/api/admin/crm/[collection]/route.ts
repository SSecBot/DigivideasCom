import { NextRequest, NextResponse } from "next/server";
import { CrmCollection } from "@/lib/crm/types";
import { crmRepositories } from "@/lib/server/repositories/crm-repository";
import { createProposal } from "@/lib/server/crm/crm-service";
import { CrmValidationError, normalizeClient, normalizeEvent, normalizePayment } from "@/lib/server/validation/crm";
import { jsonError, readJsonBody, requireAdmin } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const COLLECTIONS = new Set<CrmCollection>(["clients", "proposals", "payments", "events"]);

function isCollection(value: string): value is CrmCollection {
  return COLLECTIONS.has(value as CrmCollection);
}

export async function GET(request: NextRequest, { params }: { params: { collection: string } }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!isCollection(params.collection)) return jsonError("Bilinmeyen koleksiyon", 404);
  const items = await crmRepositories[params.collection].list();
  return NextResponse.json(items, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest, { params }: { params: { collection: string } }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!isCollection(params.collection)) return jsonError("Bilinmeyen koleksiyon", 404);

  const body = await readJsonBody<unknown>(request, 200_000);
  if (body === null) return jsonError("Geçersiz istek gövdesi", 400);

  try {
    switch (params.collection) {
      case "clients":
        return NextResponse.json(
          await crmRepositories.clients.create({ ...normalizeClient(body), source: "manuel" }),
          { status: 201 }
        );
      case "proposals":
        return NextResponse.json(await createProposal(body), { status: 201 });
      case "payments":
        return NextResponse.json(await crmRepositories.payments.create(normalizePayment(body)), { status: 201 });
      case "events":
        return NextResponse.json(await crmRepositories.events.create(normalizeEvent(body)), { status: 201 });
    }
  } catch (error) {
    if (error instanceof CrmValidationError) return jsonError(error.message, 422);
    throw error;
  }
}
