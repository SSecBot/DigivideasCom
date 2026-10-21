import { NextRequest, NextResponse } from "next/server";
import { CheckoutBuyerInput, OrderError, startCheckout } from "@/lib/server/orders/order-service";
import { IyzicoApiError, IyzicoConfigError } from "@/lib/server/payments/iyzico";
import { rateLimit } from "@/lib/server/security/rate-limit";
import { getClientIp, isSameOrigin, jsonError, readJsonBody } from "@/lib/server/http";

export const runtime = "nodejs";

/** Customer pressed "iyzico ile Öde": starts the hosted iyzico Checkout Form. */
export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  if (!isSameOrigin(request)) return jsonError("Geçersiz istek kaynağı", 403);
  const ip = getClientIp(request);
  if (!rateLimit(`checkout:${ip}`, 15, 15 * 60 * 1000).allowed) {
    return jsonError("Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.", 429);
  }
  if (!/^[A-Za-z0-9_-]{40,64}$/.test(params.token)) return jsonError("Ödeme bağlantısı geçersiz", 404);

  const body = await readJsonBody<CheckoutBuyerInput>(request, 10_000);
  if (!body) return jsonError("Geçersiz istek", 400);
  try {
    const paymentPageUrl = await startCheckout(params.token, body, ip);
    return NextResponse.json({ paymentPageUrl });
  } catch (error) {
    if (error instanceof OrderError) return jsonError(error.message, 422);
    if (error instanceof IyzicoConfigError) return jsonError("Online ödeme şu an kullanılamıyor. Lütfen bizimle iletişime geçin.", 503);
    if (error instanceof IyzicoApiError) return jsonError(error.message, 502);
    throw error;
  }
}
