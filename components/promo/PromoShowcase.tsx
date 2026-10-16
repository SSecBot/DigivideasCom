"use client";

import React from "react";
import { ArrowUpRight, CheckCircle2, Megaphone } from "lucide-react";
import { PromoItem } from "@/lib/types/cms";
import { safeHref, safeImageSrc } from "@/lib/utils/sanitize";

/**
 * "Reklamlarımız" — the agency's own sponsored placements, shown on the homepage
 * before the brand story. Managed from the admin panel (Reklamlarımız tab).
 */

function withUtm(url: string): string {
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("utm_source")) {
      parsed.searchParams.set("utm_source", "digivideas");
      parsed.searchParams.set("utm_medium", "referral");
      parsed.searchParams.set("utm_campaign", "anasayfa_reklam");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function PromoCard({ promo }: { promo: PromoItem }) {
  const href = safeHref(withUtm(promo.url));
  const image = safeImageSrc(promo.imageUrl);
  const host = (() => {
    try {
      return new URL(promo.url).hostname.replace(/^www\./, "");
    } catch {
      return promo.url;
    }
  })();

  return (
    <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 grid grid-cols-1 lg:grid-cols-12">
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-500/10 blur-[110px] rounded-full pointer-events-none" />

      <div className="relative lg:col-span-7 p-6 sm:p-10 space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-400">
            Sponsorlu
          </span>
          {promo.badge && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-[11px] font-mono text-brand-400">
              {promo.badge}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-mono font-bold text-brand-400 tracking-wide">{promo.brand}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">{promo.title}</h3>
          {promo.description && <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">{promo.description}</p>}
        </div>

        {promo.highlights.length > 0 && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {promo.highlights.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        <a
          href={href}
          target="_blank"
          rel="sponsored noopener"
          data-track="promo_click"
          data-track-label={host}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-sm px-6 py-3.5 rounded-2xl shadow-glow-orange transition-all active:scale-95"
        >
          <span>{promo.ctaText}</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      <div
        className={`relative lg:col-span-5 min-h-[180px] sm:min-h-[220px] border-t lg:border-t-0 lg:border-l border-white/10 bg-slate-950/60 items-center justify-center p-6 sm:p-8 ${image ? "flex" : "hidden sm:flex"}`}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={`${promo.brand} reklam görseli`} loading="lazy" className="max-h-64 w-auto rounded-2xl object-contain" />
        ) : (
          <div className="text-center space-y-3">
            <p className="text-4xl sm:text-5xl font-black tracking-tight text-white">{promo.brand}</p>
            <p className="text-xs font-mono text-zinc-400">{host}</p>
          </div>
        )}
      </div>
    </article>
  );
}

export function PromoShowcase({ promos }: { promos: PromoItem[] }) {
  if (promos.length === 0) return null;

  return (
    <section aria-labelledby="promo-heading" className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
          <Megaphone className="w-4 h-4" />
        </div>
        <div>
          <h2 id="promo-heading" className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Reklamlarımız
          </h2>
          <p className="text-xs text-zinc-400">Çözüm ortaklarımız ve önerdiğimiz markalar</p>
        </div>
      </div>
      <div className="space-y-6">
        {promos.map((promo) => (
          <PromoCard key={promo.id} promo={promo} />
        ))}
      </div>
    </section>
  );
}
