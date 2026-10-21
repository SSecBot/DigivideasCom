import { NextRequest, NextResponse } from "next/server";
import { orderRepository } from "@/lib/server/repositories/order-repository";
import { OrderError, toOrderView, updateOrder } from "@/lib/server/orders/order-service";
import { jsonError, readJsonBody, requireAdmin } from "@/lib/server/http";

export const runtime = "nodejs";
type Params = { params: { id: string } };

export async function PATCH(request: NextRequest, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = await readJsonBody<unknown>(request, 100_000);
  if (body === null) return jsonError("Geçersiz istek", 400);
  try {
    const order = await updateOrder(params.id, body);
    return order ? NextResponse.json(toOrderView(order)) : jsonError("Sipariş bulunamadı", 404);
  } catch (error) {
    if (error instanceof OrderError) return jsonError(error.message, 422);
    throw error;
  }
}

/** Soft delete; paid orders are kept as financial records. */
export async function DELETE(request: NextRequest, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const order = await orderRepository.findById(params.id);
  if (!order) return jsonError("Sipariş bulunamadı", 404);
  if (order.status === "odendi") return jsonError("Ödenmiş siparişler silinemez", 422);
  await orderRepository.softDelete(params.id);
  return NextResponse.json({ ok: true });
}
