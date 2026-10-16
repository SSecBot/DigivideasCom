import { CollectPayload, StoredAnalyticsEvent } from "@/lib/analytics/types";
import {
  classifyChannel,
  parseBrowser,
  parseDevice,
  parseOs,
  referrerHostOf,
} from "@/lib/analytics/classify";

/** Turns an untrusted tracker payload into a stored event, or null when it is invalid. */

const ID_PATTERN = /^[a-zA-Z0-9-]{8,64}$/;
const EVENT_NAME_PATTERN = /^[a-z0-9_]{2,40}$/;
const TYPES = new Set(["pageview", "engagement", "event"]);
const CLICK_IDS = new Set(["gclid", "fbclid", "ttclid", "msclkid"]);

function text(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, max);
  return trimmed || undefined;
}

export interface NormalizeContext {
  userAgent: string;
  siteHost?: string;
  country?: string;
  now: number;
}

export function normalizeCollectPayload(body: unknown, context: NormalizeContext): StoredAnalyticsEvent | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Partial<CollectPayload> & Record<string, unknown>;

  if (!TYPES.has(raw.type as string)) return null;
  if (!ID_PATTERN.test(String(raw.visitorId)) || !ID_PATTERN.test(String(raw.sessionId))) return null;

  const path = text(raw.path, 300);
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/dashboard")) return null;

  const name = text(raw.name, 40);
  if (raw.type === "event" && (!name || !EVENT_NAME_PATTERN.test(name))) return null;

  const durationMs = Number(raw.durationMs);
  const screenWidth = Number(raw.screenWidth);
  const referrerHost = referrerHostOf(text(raw.referrer, 500));
  const utmSource = text(raw.utmSource, 100)?.toLowerCase();
  const utmMedium = text(raw.utmMedium, 100)?.toLowerCase();

  return {
    type: raw.type as StoredAnalyticsEvent["type"],
    ts: context.now,
    visitorId: String(raw.visitorId),
    sessionId: String(raw.sessionId),
    path: path.split("?")[0].split("#")[0],
    title: text(raw.title, 200),
    referrerHost: referrerHost && referrerHost !== context.siteHost ? referrerHost : undefined,
    channel: classifyChannel({
      referrerHost,
      siteHost: context.siteHost,
      utmSource,
      utmMedium,
      hasClickId: CLICK_IDS.has(raw.clickId as string),
    }),
    utmSource,
    utmMedium,
    utmCampaign: text(raw.utmCampaign, 150),
    device: parseDevice(context.userAgent),
    browser: parseBrowser(context.userAgent),
    os: parseOs(context.userAgent),
    country: context.country,
    language: text(raw.language, 20)?.split("-")[0].toLowerCase(),
    screenWidth: Number.isFinite(screenWidth) && screenWidth > 0 ? Math.min(Math.round(screenWidth), 10_000) : undefined,
    durationMs:
      raw.type === "engagement" && Number.isFinite(durationMs)
        ? Math.max(0, Math.min(Math.round(durationMs), 30 * 60 * 1000))
        : undefined,
    name: raw.type === "event" ? name : undefined,
    label: raw.type === "event" ? text(raw.label, 200) : undefined,
  };
}
