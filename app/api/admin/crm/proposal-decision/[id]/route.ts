import { NextRequest, NextResponse } from "next/server";
import { decideProposal } from "@/lib/server/crm/crm-service";
import { CrmValidationError } from "@/lib/server/validation/crm";
import { jsonError, readJsonBody, requireAdmin } from "@/lib/server/http";

/** Approves or rejects a proposal. Approval adds the customer to "Müşteri Takibi". */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const body = await readJsonBody<{
    decision?: unknown;
    note?: unknown;
    createPayment?: unknown;
    paymentDueDate?: unknown;
    monthlyFee?: unknown;
    endDate?: unknown;
  }>(request, 10_000);
  if (!body || (body.decision !== "approve" && body.decision !== "reject")) {
    return jsonError("Karar 'approve' veya 'reject' olmalı", 400);
  }
  const dueDate = typeof body.paymentDueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.paymentDueDate)
    ? body.paymentDueDate
    : undefined;
  const endDate = typeof body.endDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.endDate) ? body.endDate : undefined;
  const monthlyFee = body.monthlyFee === undefined || body.monthlyFee === "" ? undefined : Number(body.monthlyFee);

  try {
    const result = await decideProposal(params.id, {
      decision: body.decision,
      note: typeof body.note === "string" ? body.note : undefined,
      createPayment: body.createPayment === true,
      paymentDueDate: dueDate,
      endDate,
      monthlyFee: monthlyFee !== undefined && Number.isFinite(monthlyFee) && monthlyFee >= 0 ? monthlyFee : undefined,
    });
    return result ? NextResponse.json(result) : jsonError("Teklif bulunamadı", 404);
  } catch (error) {
    if (error instanceof CrmValidationError) return jsonError(error.message, 422);
    throw error;
  }
}
