import { NextRequest, NextResponse } from "next/server";
import { completeCheckout, paymentUrlFor } from "@/lib/server/orders/order-service";
import { orderRepository } from "@/lib/server/repositories/order-repository";
import { rateLimit } from "@/lib/server/security/rate-limit";
import { getClientIp } from "@/lib/server/http";
import { getSiteUrl } from "@/lib/seo/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * iyzico posts the Checkout Form result here (form field "token") after the card step.
 * The posted data is never trusted: the result is fetched from iyzico's API with our keys
 * and verified before the order is marked paid. The buyer is then sent back to their
 * payment page with the outcome.
 */
export async function POST(request: NextRequest) {
  const home = `${getSiteUrl()}/`;
  if (!rateLimit(`iyzico-callback:${getClientIp(request)}`, 60, 10 * 60 * 1000).allowed) {
    return NextResponse.redirect(home, 303);
  }
  const form = await request.formData().catch(() => null);
  const token = form?.get("token");
  if (typeof token !== "string" || !/^[A-Za-z0-9-]{10,200}$/.test(token)) return NextResponse.redirect(home, 303);

  const back = async (outcome: string) => {
    const order = await orderRepository.findByCheckoutToken(token);
    const url = order ? paymentUrlFor(order) : undefined;
    return NextResponse.redirect(url ? `${url}?sonuc=${outcome}` : home, 303);
  };

  try {
    const result = await completeCheckout(token);
    if (!result) return NextResponse.redirect(home, 303);
    return back(result.outcome === "basarisiz" ? "hata" : "odendi");
  } catch (error) {
    console.error("[iyzico] Ödeme sonucu alınamadı:", error);
    return back("kontrol");
  }
}
