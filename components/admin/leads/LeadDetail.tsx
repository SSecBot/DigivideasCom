"use client";

import React, { useState } from "react";
import {
  BookmarkPlus,
  Check,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ScanSearch,
  Star,
  X,
} from "lucide-react";
import { LeadAnalysis, PlaceLead, WebsiteAudit } from "@/lib/leads/types";
import { safeHref } from "@/lib/utils/sanitize";
import { ownWebsite } from "@/lib/leads/social";
import { TIER_STYLES, mapEmbedUrl, whatsappLink } from "@/components/admin/leads/lead-utils";

interface LeadDetailProps {
  place: PlaceLead;
  analysis: LeadAnalysis;
  audit?: WebsiteAudit;
  isSaved: boolean;
  onAudit: () => Promise<void>;
  onSave?: () => Promise<void>;
  onClose: () => void;
  children?: React.ReactNode; // extra controls (e.g. status/notes for saved leads)
}

function Check2({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      <span
        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${ok ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/15 text-red-300"}`}
        aria-hidden="true"
      >
        {ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      </span>
      <span className="text-zinc-300">{label}</span>
      <span className="sr-only">{ok ? "var" : "yok"}</span>
    </li>
  );
}

export function LeadDetail({ place, analysis, audit, isSaved, onAudit, onSave, onClose, children }: LeadDetailProps) {
  const [auditing, setAuditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pitch, setPitch] = useState(analysis.pitch);
  const mapUrl = mapEmbedUrl(place);
  const whatsapp = whatsappLink(place, pitch);

  React.useEffect(() => setPitch(analysis.pitch), [analysis.pitch]);

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-white/10 overflow-hidden">
      <div className="p-4 sm:p-5 flex items-start justify-between gap-3 border-b border-white/10">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-white leading-tight">{place.name}</h3>
          <p className="text-xs text-zinc-400 mt-1">{place.primaryTypeLabel || place.primaryType || "İşletme"}</p>
          {place.rating !== undefined && (
            <p className="text-xs text-zinc-300 mt-1 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              {place.rating.toFixed(1)} <span className="text-zinc-500">({place.ratingCount ?? 0} yorum)</span>
            </p>
          )}
        </div>
        <div className="flex items-start gap-2 flex-shrink-0">
          <div className={`px-3 py-1.5 rounded-xl text-center ${TIER_STYLES[analysis.tier]}`}>
            <div className="text-lg font-bold leading-none">{analysis.score}</div>
            <div className="text-[10px] font-mono mt-0.5">{analysis.tier}</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5" aria-label="Detayı kapat">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {mapUrl && (
        <iframe
          title={`${place.name} harita konumu`}
          src={mapUrl}
          className="w-full h-48 sm:h-56 border-0 grayscale-[30%]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}

      <div className="p-4 sm:p-5 space-y-5">
        {/* Contact */}
        <div className="space-y-2 text-xs">
          <p className="flex items-start gap-2 text-zinc-300">
            <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <span>{place.address}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {place.phone && (
              <a href={`tel:${(place.internationalPhone || place.phone).replace(/[^0-9+]/g, "")}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200">
                <Phone className="w-3.5 h-3.5" /> {place.phone}
              </a>
            )}
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500/15 hover:bg-brand-500/25 text-brand-300">
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp&apos;tan yaz
              </a>
            )}
            {place.website && (
              <a href={safeHref(place.website)} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 max-w-full">
                <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{place.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</span>
              </a>
            )}
            {place.mapsUrl && (
              <a href={safeHref(place.mapsUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200">
                <ExternalLink className="w-3.5 h-3.5" /> Google Haritalar
              </a>
            )}
          </div>
        </div>

        {/* Analysis */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">Müşteri analizi</h4>
          <ul className="space-y-1.5">
            {analysis.reasons.map((reason) => (
              <li key={reason.text} className="flex items-start gap-2 text-xs text-zinc-300">
                <span className="font-mono text-[11px] text-white bg-white/5 rounded px-1.5 py-0.5 flex-shrink-0">+{reason.points}</span>
                <span>{reason.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {analysis.opportunities.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">Satılabilecek hizmetler</h4>
            <div className="flex flex-wrap gap-1.5">
              {analysis.opportunities.map((item) => (
                <span key={item} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-zinc-200">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Website audit (own websites only, not Instagram/marketplace links) */}
        {ownWebsite(place.website) && (
          <div className="space-y-3 p-4 rounded-xl bg-slate-950/70 border border-white/10">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-mono font-bold text-white">Web sitesi & sosyal medya taraması</h4>
              <button
                onClick={async () => {
                  setAuditing(true);
                  await onAudit().finally(() => setAuditing(false));
                }}
                disabled={auditing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-slate-950 text-xs font-semibold"
              >
                {auditing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ScanSearch className="w-3.5 h-3.5" />}
                {audit ? "Yeniden tara" : "Siteyi analiz et"}
              </button>
            </div>
            {audit ? (
              audit.reachable ? (
                <div className="space-y-3">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <Check2 ok={audit.https} label="HTTPS (güvenli bağlantı)" />
                    <Check2 ok={audit.hasViewport} label="Mobil uyumlu (viewport)" />
                    <Check2 ok={audit.hasMetaPixel} label="Meta Pixel" />
                    <Check2 ok={audit.hasGoogleAnalytics || audit.hasGoogleTagManager} label="Google Analytics / GTM" />
                    <Check2 ok={audit.hasGoogleAds} label="Google Ads etiketi" />
                    <Check2 ok={audit.hasWhatsAppLink} label="WhatsApp bağlantısı" />
                  </ul>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(audit.socials).length === 0 ? (
                      <span className="text-xs text-zinc-500">Sitede sosyal medya bağlantısı bulunamadı.</span>
                    ) : (
                      Object.entries(audit.socials).map(([network, url]) => (
                        <a
                          key={network}
                          href={safeHref(url)}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[11px] text-zinc-200 capitalize"
                        >
                          {network} <ExternalLink className="w-3 h-3" />
                        </a>
                      ))
                    )}
                  </div>
                  {audit.emails?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {audit.emails.map((email) => (
                        <a
                          key={email}
                          href={`mailto:${email}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-500/15 hover:bg-brand-500/25 text-[11px] text-brand-300"
                        >
                          <Mail className="w-3 h-3" /> {email}
                        </a>
                      ))}
                    </div>
                  )}
                  <p className="text-[11px] font-mono text-zinc-500">
                    HTTP {audit.status} · {audit.loadMs} ms{audit.title ? ` · ${audit.title}` : ""}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-red-300">Siteye ulaşılamadı: {audit.error || `HTTP ${audit.status}`}</p>
              )
            ) : (
              <p className="text-xs text-zinc-500">
                Sitede Instagram/Facebook/TikTok hesapları, Meta Pixel, Google Analytics ve mobil uyumluluk kontrol edilir; puan buna göre güncellenir.
              </p>
            )}
          </div>
        )}

        {/* Pitch */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor={`pitch-${place.placeId}`} className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
              İlk temas mesajı
            </label>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(pitch).catch(() => undefined);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Kopyalandı" : "Kopyala"}
            </button>
          </div>
          <textarea
            id={`pitch-${place.placeId}`}
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            rows={7}
            className="w-full bg-slate-950 border border-white/10 focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-zinc-200 leading-relaxed focus:outline-none"
          />
        </div>

        {children}

        {onSave && (
          <button
            onClick={async () => {
              setSaving(true);
              await onSave().finally(() => setSaving(false));
            }}
            disabled={saving || isSaved}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-white/10 disabled:text-zinc-400 text-slate-950 text-sm font-bold"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <Check className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
            {isSaved ? "Aday listesinde" : "Aday listesine kaydet"}
          </button>
        )}
      </div>
    </div>
  );
}
