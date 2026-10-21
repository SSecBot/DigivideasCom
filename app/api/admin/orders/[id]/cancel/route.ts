import { NextRequest, NextResponse } from "next/server";
import { OrderError, cancelOrder, toOrderView } from "@/lib/server/orders/order-service";
import { jsonError, readJsonBody, requireAdmin } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = await readJsonBody<{ note?: unknown }>(request, 2_000);
  try {
    const order = await cancelOrder(params.id, typeof body?.note === "string" ? body.note : undefined);
    return order ? NextResponse.json(toOrderView(order)) : jsonError("Sipariş bulunamadı", 404);
  } catch (error) {
    if (error instanceof OrderError) return jsonError(error.message, 422);
    throw error;
  }
}
