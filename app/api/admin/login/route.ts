import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  AuthConfigError,
  SESSION_TTL_MS,
  checkPasscode,
  createSessionToken,
} from "@/lib/server/auth/session";
import { rateLimit, resetRateLimit } from "@/lib/server/security/rate-limit";
import { getClientIp, isSameOrigin, jsonError, readJsonBody } from "@/lib/server/http";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("Geçersiz istek kaynağı", 403);

  const limiterKey = `login:${getClientIp(request)}`;
  // A global cap as well: X-Forwarded-For can be spoofed when no proxy overwrites it.
  const globalLimit = rateLimit("login:global", MAX_ATTEMPTS * 6, WINDOW_MS);
  const limit = globalLimit.allowed ? rateLimit(limiterKey, MAX_ATTEMPTS, WINDOW_MS) : globalLimit;
  if (!limit.allowed) {
    return jsonError(
      `Çok fazla hatalı deneme. ${Math.ceil(limit.retryAfterSeconds / 60)} dakika sonra tekrar deneyin.`,
      429,
      { "Retry-After": String(limit.retryAfterSeconds) }
    );
  }

  const body = await readJsonBody<{ passcode?: unknown }>(request, 2_000);
  const passcode = typeof body?.passcode === "string" ? body.passcode : "";
  if (!passcode) return jsonError("Şifre gerekli", 400);

  try {
    if (!checkPasscode(passcode)) return jsonError("Geçersiz Yönetici Şifresi", 401);

    resetRateLimit(limiterKey);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE_NAME, createSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_TTL_MS / 1000,
    });
    return response;
  } catch (error) {
    if (error instanceof AuthConfigError) return jsonError(error.message, 500);
    throw error;
  }
}
