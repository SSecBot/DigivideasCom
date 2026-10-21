import { NextRequest, NextResponse } from "next/server";
import { iyzicoStatus } from "@/lib/server/payments/iyzico";
import { isMailConfigured, readMailSettings } from "@/lib/server/mail/mail-settings";
import { getSiteUrl } from "@/lib/seo/site";
import { requireAdmin } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Readiness checklist for online payments shown in the admin panel. */
export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const siteUrl = getSiteUrl();
  return NextResponse.json(
    {
      iyzico: iyzicoStatus(),
      mailConfigured: isMailConfigured(await readMailSettings()),
      siteUrl,
      siteUrlHttps: siteUrl.startsWith("https://"),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
