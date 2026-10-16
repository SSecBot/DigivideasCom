"use client";

import React, { useEffect, useState } from "react";
import { PlusSquare, Share, X } from "lucide-react";

/**
 * iOS/iPadOS have no install prompt, so the admin panel explains "Ana Ekrana Ekle" once.
 * Hidden when already running from the home screen, outside Apple devices, or after
 * being dismissed (for 30 days).
 */

const DISMISS_KEY = "dv_admin_install_hint_dismissed";
const DISMISS_DAYS = 30;

type AppleDevice = "iphone" | "ipad";

function detectAppleDevice(): AppleDevice | null {
  const ua = navigator.userAgent;
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ipad"; // iPadOS reports as Mac
  if (/iPhone|iPod/.test(ua)) return "iphone";
  return null;
}

function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
}

export function AdminInstallHint() {
  const [device, setDevice] = useState<AppleDevice | null>(null);

  useEffect(() => {
    try {
      const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) || 0);
      if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    } catch {
      // storage unavailable (private mode): still show the hint
    }
    if (isStandalone()) return;
    setDevice(detectAppleDevice());
  }, []);

  if (!device) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setDevice(null);
  };

  return (
    <div
      role="dialog"
      aria-label="Yönetim panelini ana ekrana ekle"
      className="print:hidden fixed z-[70] left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm bottom-[calc(env(safe-area-inset-bottom)+12px)] p-4 rounded-2xl bg-slate-900/95 border border-brand-500/40 shadow-2xl backdrop-blur-xl text-sm text-zinc-200"
    >
      <button onClick={dismiss} className="absolute top-2.5 right-2.5 p-1 text-zinc-400 hover:text-white" aria-label="Kapat">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3 pr-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/admin/admin-icon-192.png" alt="" className="w-11 h-11 rounded-xl flex-shrink-0" />
        <div className="space-y-1.5">
          <p className="font-semibold text-white">Paneli uygulama gibi kullanın</p>
          <ol className="text-xs text-zinc-300 space-y-1">
            <li className="flex items-center gap-1.5 flex-wrap">
              1. {device === "ipad" ? "Sağ üstteki" : "Alttaki"} <Share className="w-3.5 h-3.5 text-brand-400" aria-label="Paylaş" />
              <strong>Paylaş</strong> düğmesine dokunun
            </li>
            <li className="flex items-center gap-1.5 flex-wrap">
              2. <PlusSquare className="w-3.5 h-3.5 text-brand-400" aria-hidden="true" />
              <span>
                <strong>Ana Ekrana Ekle</strong>&apos;yi seçin
              </span>
            </li>
          </ol>
          <p className="text-[11px] text-zinc-500">Simgeye dokununca doğrudan yönetim paneli açılır.</p>
        </div>
      </div>
    </div>
  );
}
