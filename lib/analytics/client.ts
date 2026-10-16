"use client";

import { CollectPayload } from "@/lib/analytics/types";

/**
 * Browser side of the first-party analytics. Uses random anonymous ids
 * (no cookies, no fingerprinting) and honours Do Not Track / Global Privacy Control.
 */

const ENDPOINT = "/api/analytics/collect";
const VISITOR_KEY = "dv_vid";
const SESSION_KEY = "dv_session";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const ATTRIBUTION_KEY = "dv_attribution";

type Attribution = Pick<CollectPayload, "referrer" | "utmSource" | "utmMedium" | "utmCampaign" | "clickId">;

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function storage(kind: "local" | "session"): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function isTrackingDisabled(): boolean {
  if (typeof window === "undefined") return true;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === "1" || nav.globalPrivacyControl === true;
}

function getVisitorId(): string {
  const store = storage("local");
  let id = store?.getItem(VISITOR_KEY);
  if (!id) {
    id = randomId();
    store?.setItem(VISITOR_KEY, id);
  }
  return id;
}

/** Returns the current session id and whether this call started a new session. */
function touchSession(): { sessionId: string; isNew: boolean } {
  const store = storage("local");
  const now = Date.now();
  try {
    const saved = JSON.parse(store?.getItem(SESSION_KEY) || "null") as { id: string; last: number } | null;
    if (saved && now - saved.last < SESSION_TIMEOUT_MS) {
      store?.setItem(SESSION_KEY, JSON.stringify({ id: saved.id, last: now }));
      return { sessionId: saved.id, isNew: false };
    }
  } catch {
    // corrupted value: start a new session
  }
  const id = randomId();
  store?.setItem(SESSION_KEY, JSON.stringify({ id, last: now }));
  return { sessionId: id, isNew: true };
}

/** Captures referrer + UTM/click ids at session start; later page views reuse them. */
function currentAttribution(isNewSession: boolean): Attribution {
  const store = storage("session");
  const params = new URLSearchParams(window.location.search);
  const clickId = (["gclid", "fbclid", "ttclid", "msclkid"] as const).find((key) => params.has(key));
  const fresh: Attribution = {
    referrer: document.referrer || undefined,
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    clickId,
  };
  const hasCampaign = Boolean(fresh.utmSource || fresh.utmMedium || fresh.utmCampaign || clickId);

  if (isNewSession || hasCampaign || !store?.getItem(ATTRIBUTION_KEY)) {
    store?.setItem(ATTRIBUTION_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    return JSON.parse(store.getItem(ATTRIBUTION_KEY) || "{}") as Attribution;
  } catch {
    return fresh;
  }
}

function send(payload: CollectPayload, useBeacon = false) {
  const body = JSON.stringify(payload);
  try {
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      return;
    }
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // analytics must never break the page
  }
}

export function trackPageview(path: string) {
  if (isTrackingDisabled()) return;
  const { sessionId, isNew } = touchSession();
  send({
    type: "pageview",
    visitorId: getVisitorId(),
    sessionId,
    path,
    title: document.title,
    language: navigator.language,
    screenWidth: window.screen?.width,
    ...currentAttribution(isNew),
  });
}

export function trackEngagement(path: string, durationMs: number) {
  if (isTrackingDisabled() || durationMs < 500) return;
  const { sessionId } = touchSession();
  send({ type: "engagement", visitorId: getVisitorId(), sessionId, path, durationMs }, true);
}

export function trackEvent(name: string, options: { label?: string } = {}) {
  if (isTrackingDisabled()) return;
  const { sessionId } = touchSession();
  send({
    type: "event",
    visitorId: getVisitorId(),
    sessionId,
    path: window.location.pathname,
    name,
    label: options.label,
  });
}
