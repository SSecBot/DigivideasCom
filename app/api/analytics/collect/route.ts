import { NextRequest } from "next/server";
import { normalizeCollectPayload } from "@/lib/analytics/normalize";
import { countryFromHeaders, isBot } from "@/lib/analytics/classify";
import { analyticsRepository } from "@/lib/server/repositories/analytics-repository";
import { rateLimit } from "@/lib/server/security/rate-limit";
import { getClientIp } from "@/lib/server/http";

const noContent = () => new Response(null, { status: 204 });

/**
 * Receives hits from the first-party tracker (fetch keepalive / sendBeacon).
 * Always answers 204 so the tracker never retries or surfaces errors to visitors.
 */
export async function POST(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  if (isBot(userAgent)) return noContent();
  if (!rateLimit(`collect:${getClientIp(request)}`, 300, 5 * 60 * 1000).allowed) return noContent();

  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || undefined;
  if (origin) {
    try {
      if (new URL(origin).host !== host) return noContent();
    } catch {
      return noContent();
    }
  }

  const text = await request.text();
  if (text.length > 4_000) return noContent();

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return noContent();
  }

  const event = normalizeCollectPayload(body, {
    userAgent,
    siteHost: host?.split(":")[0].replace(/^www\./, ""),
    country: countryFromHeaders(request.headers),
    now: Date.now(),
  });
  if (event) await analyticsRepository.append(event);
  return noContent();
}
