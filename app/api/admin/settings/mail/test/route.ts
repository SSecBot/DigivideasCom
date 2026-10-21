import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/server/mail/mailer";
import { rateLimit } from "@/lib/server/security/rate-limit";
import { jsonError, readJsonBody, requireAdmin } from "@/lib/server/http";

export const runtime = "nodejs";

/** Sends a test e-mail with the saved SMTP settings. */
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!rateLimit("mail:test", 10, 10 * 60 * 1000).allowed) return jsonError("Çok fazla deneme, biraz bekleyin", 429);
  const body = await readJsonBody<{ to?: unknown }>(request, 1_000);
  const to = typeof body?.to === "string" ? body.to.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) return jsonError("Geçerli bir alıcı adresi girin", 400);
  try {
    await sendMail({
      to,
      subject: "digivideas – test e-postası",
      text: "Bu bir test e-postasıdır. E-posta ayarlarınız çalışıyor.",
      html: "<p>Bu bir test e-postasıdır. E-posta ayarlarınız <strong>çalışıyor</strong>.</p>",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(`Gönderilemedi: ${(error as Error).message}`, 422);
  }
}
