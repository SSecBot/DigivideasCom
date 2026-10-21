import { NextRequest, NextResponse } from "next/server";
import { OrderError, sendPaymentLink, toOrderView } from "@/lib/server/orders/order-service";
import { jsonError, requireAdmin } from "@/lib/server/http";

export const runtime = "nodejs";

/** E-mails the payment link to the customer from the admin-configured address. */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    return NextResponse.json(toOrderView(await sendPaymentLink(params.id)));
  } catch (error) {
    if (error instanceof OrderError) return jsonError(error.message, 422);
    throw error;
  }
}
