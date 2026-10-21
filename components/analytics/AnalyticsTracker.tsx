"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEngagement, trackEvent, trackPageview } from "@/lib/analytics/client";

/**
 * Sends a page view on every route change, measures visible time on each page,
 * and records clicks on WhatsApp / phone / e-mail / outbound links and on
 * elements marked with `data-track="event_name"`.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const visibleSince = useRef<number | null>(null);
  const accumulated = useRef(0);
  const currentPath = useRef<string | null>(null);

  // Page views + time-on-page per route (private payment links are never tracked)
  useEffect(() => {
    if (!pathname || pathname.startsWith("/odeme")) return;

    const flush = () => {
      if (!currentPath.current) return;
      if (visibleSince.current !== null) {
        accumulated.current += Date.now() - visibleSince.current;
        visibleSince.current = document.visibilityState === "visible" ? Date.now() : null;
      }
      trackEngagement(currentPath.current, accumulated.current);
      accumulated.current = 0;
    };

    flush();
    currentPath.current = pathname;
    accumulated.current = 0;
    visibleSince.current = document.visibilityState === "visible" ? Date.now() : null;
    // Wait a tick so the new page's <title> is in place.
    const timer = window.setTimeout(() => trackPageview(pathname), 50);

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        flush();
        visibleSince.current = null;
      } else {
        visibleSince.current = Date.now();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [pathname]);

  // Click / conversion tracking via event delegation
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const tracked = target?.closest<HTMLElement>("[data-track]");
      if (tracked?.dataset.track) {
        trackEvent(tracked.dataset.track, { label: tracked.dataset.trackLabel });
        return;
      }

      const anchor = target?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(href)) {
        trackEvent("whatsapp_click", { label: window.location.pathname });
      } else if (href.startsWith("tel:")) {
        trackEvent("phone_click", { label: href.slice(4) });
      } else if (href.startsWith("mailto:")) {
        trackEvent("email_click", { label: href.slice(7) });
      } else if (anchor.host && anchor.host !== window.location.host) {
        trackEvent("outbound_click", { label: anchor.hostname });
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
