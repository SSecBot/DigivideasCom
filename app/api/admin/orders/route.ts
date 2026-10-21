import { NextRequest, NextResponse } from "next/server";
import { orderRepository } from "@/lib/server/repositories/order-repository";
import { OrderError, createOrder, toOrderView } from "@/lib/server/orders/order-service";
import { jsonError, readJsonBody, requireAdmin } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const orders = (await orderRepository.list()).map(toOrderView);
  return NextResponse.json(orders, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = await readJsonBody<unknown>(request, 100_000);
  if (body === null) return jsonError("Geçersiz istek", 400);
  try {
    return NextResponse.json(toOrderView(await createOrder(body)), { status: 201 });
  } catch (error) {
    if (error instanceof OrderError) return jsonError(error.message, 422);
    throw error;
  }
}
