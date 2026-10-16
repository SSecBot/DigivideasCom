import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, AuthConfigError, verifySessionToken } from "@/lib/server/auth/session";

/** Best-effort client IP (behind a reverse proxy such as nginx / Cloudflare). */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || request.ip || "unknown";
}

export function jsonError(message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error: message }, { status, headers });
}

/**
 * Rejects cross-site state-changing requests. Browsers always send Origin on
 * POST/PUT/PATCH/DELETE fetches, so a mismatch means the request came from another site.
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return request.method === "GET" || request.method === "HEAD";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function isAdminRequest(request: NextRequest): boolean {
  return verifySessionToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
}

/**
 * Guard for every /api/admin route. Returns an error response when the caller
 * is not an authenticated admin (or the request is cross-site), otherwise null.
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  try {
    if (!isSameOrigin(request)) return jsonError("Geçersiz istek kaynağı", 403);
    if (!isAdminRequest(request)) return jsonError("Yetkisiz erişim", 401);
    return null;
  } catch (error) {
    if (error instanceof AuthConfigError) return jsonError(error.message, 500);
    throw error;
  }
}

export async function readJsonBody<T>(request: NextRequest, maxBytes: number): Promise<T | null> {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > maxBytes) return null;
  const text = await request.text();
  if (Buffer.byteLength(text) > maxBytes) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
