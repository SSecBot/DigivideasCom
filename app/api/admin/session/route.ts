import { NextRequest, NextResponse } from "next/server";
import { AuthConfigError } from "@/lib/server/auth/session";
import { isAdminRequest, jsonError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      { authenticated: isAdminRequest(request) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof AuthConfigError) return jsonError(error.message, 500);
    throw error;
  }
}
