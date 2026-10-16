import { NextRequest, NextResponse } from "next/server";
import { inquiryRepository } from "@/lib/server/repositories/inquiry-repository";
import { validateInquiry } from "@/lib/server/validation/inquiry";
import { rateLimit } from "@/lib/server/security/rate-limit";
import { getClientIp, isSameOrigin, jsonError, readJsonBody } from "@/lib/server/http";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("Geçersiz istek kaynağı", 403);

  const limit = rateLimit(`inquiry:${getClientIp(request)}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return jsonError("Çok fazla talep gönderildi. Lütfen daha sonra tekrar deneyin.", 429, {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  const body = await readJsonBody<Record<string, unknown>>(request, 20_000);
  // Honeypot: real visitors never fill the hidden "website" field.
  if (body && typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const { data, error } = validateInquiry(body);
  if (!data) return jsonError(error || "Geçersiz form verisi", 422);

  await inquiryRepository.create(data);
  return NextResponse.json({ ok: true }, { status: 201 });
}
