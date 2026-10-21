import { NextRequest, NextResponse } from "next/server";
import { MailSettingsError, readMailSettings, saveMailSettings, toView } from "@/lib/server/mail/mail-settings";
import { SecretBoxError } from "@/lib/server/security/secret-box";
import { jsonError, readJsonBody, requireAdmin } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  return NextResponse.json(toView(await readMailSettings()), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = await readJsonBody<Record<string, unknown>>(request, 10_000);
  if (!body) return jsonError("Geçersiz istek", 400);
  try {
    return NextResponse.json(toView(await saveMailSettings(body)));
  } catch (error) {
    if (error instanceof MailSettingsError || error instanceof SecretBoxError) return jsonError(error.message, 422);
    throw error;
  }
}
