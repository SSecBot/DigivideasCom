import { NextRequest, NextResponse } from "next/server";
import { OrderError, regenerateLink, toOrderView } from "@/lib/server/orders/order-service";
import { jsonError, readJsonBody, requireAdmin } from "@/lib/server/http";

export const runtime = "nodejs";

/** Creates a new payment link; the previous link stops working. */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = await readJsonBody<{ days?: unknown }>(request, 1_000);
  try {
    const order = await regenerateLink(params.id, body?.days);
    return order ? NextResponse.json(toOrderView(order)) : jsonError("Sipariş bulunamadı", 404);
  } catch (error) {
    if (error instanceof OrderError) return jsonError(error.message, 422);
    throw error;
  }
}
