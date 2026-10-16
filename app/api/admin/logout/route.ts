import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/server/auth/session";
import { isSameOrigin, jsonError } from "@/lib/server/http";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("Geçersiz istek kaynağı", 403);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
