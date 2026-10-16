"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Download, Globe, Loader2, MapPinned, Search, Square, Star, Trash2 } from "lucide-react";
import {
  LEAD_STATUS_LABELS,
  LeadAnalysis,
  LeadSearchResponse,
  LeadSource,
  ScrapeJobView,
  LeadStatus,
  PlaceLead,
  SavedLead,
  WebsiteAudit,
} from "@/lib/leads/types";
import { LeadDetail } from "@/components/admin/leads/LeadDetail";
import { SECTOR_PRESETS, TIER_STYLES, downloadCsv, leadsFetch } from "@/components/admin/leads/lead-utils";
import { ownWebsite } from "@/lib/leads/social";

type ResultLead = PlaceLead & { analysis: LeadAnalysis; audit?: WebsiteAudit };
type SortKey = "score" | "ratingCount" | "rating";

function LeadRow({ lead, active, onSelect, extra }: { lead: ResultLead; active: boolean; onSelect: () => void; extra?: React.ReactNode }) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={active}
      className={`w-full text-left p-3.5 rounded-xl border transition-colors flex items-start gap-3 ${active ? "bg-brand-500/10 border-brand-500/50" : "bg-slate-900/60 border-white/10 hover:border-white/20"}`}
    >
      <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${TIER_STYLES[lead.analysis.tier]}`}>
        <span className="text-sm font-bold leading-none">{lead.analysis.score}</span>
        <span className="text-[9px] font-mono mt-0.5">{lead.analysis.tier}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white truncate">{lead.name}</p>
        <p className="text-[11px] text-zinc-400 truncate">{lead.primaryTypeLabel || lead.primaryType || "İşletme"} · {lead.address}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] font-mono text-zinc-500">
          {lead.rating !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
              {lead.rating.toFixed(1)} ({lead.ratingCount ?? 0})
            </span>
          )}
          <span className={`inline-flex items-center gap-1 ${ownWebsite(lead.website) ? "" : "text-brand-400"}`}>
            <Globe className="w-3 h-3" />{" "}
            {ownWebsite(lead.website) ? "web sitesi var" : lead.website ? "sadece sosyal medya" : "web sitesi yok"}
          </span>
          {lead.audit?.emails?.length ? <span className="text-zinc-300">{lead.audit.emails[0]}</span> : null}
          {extra}
        </div>
      </div>
    </button>
  );
}

export function LeadFinder() {
  const [view, setView] = useState<"search" | "saved">("search");
  const [sector, setSector] = useState(SECTOR_PRESETS[0]);
  const [customSector, setCustomSector] = useState("");
  const [location, setLocation] = useState("Torbalı, İzmir");
  const [results, setResults] = useState<ResultLead[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [lastQuery, setLastQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [onlyNoWebsite, setOnlyNoWebsite] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [placesApi, setPlacesApi] = useState<boolean | null>(null);
  const [source, setSource] = useState<LeadSource>("scraper");
  const [limit, setLimit] = useState(20);
  const [job, setJob] = useState<ScrapeJobView | null>(null);
  const pollTimer = useRef<number | null>(null);

  const detailRef = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState<SavedLead[]>([]);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");

  const loadSaved = useCallback(async () => {
    try {
      setSaved(await leadsFetch<SavedLead[]>("/api/admin/leads"));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  // Polls a browser scrape job until it finishes; results stream in while it runs.
  const pollJob = useCallback((id: string) => {
    if (pollTimer.current) window.clearTimeout(pollTimer.current);
    const tick = async () => {
      try {
        const data = await leadsFetch<ScrapeJobView>(`/api/admin/leads/scrape/${encodeURIComponent(id)}`);
        setJob(data);
        setResults(data.leads);
        if (data.status === "running") {
          pollTimer.current = window.setTimeout(tick, 1500);
        } else {
          setLoading(false);
          if (data.status === "error" && data.error) setError(data.error);
        }
      } catch (e) {
        setLoading(false);
        setError((e as Error).message);
      }
    };
    tick();
  }, []);

  useEffect(() => {
    leadsFetch<{ placesApi: boolean; runningJob: ScrapeJobView | null }>("/api/admin/leads/config")
      .then((config) => {
        setPlacesApi(config.placesApi);
        setSource(config.placesApi ? "places-api" : "scraper");
        if (config.runningJob) {
          setLastQuery(config.runningJob.query);
          setLoading(true);
          pollJob(config.runningJob.id);
        }
      })
      .catch(() => setPlacesApi(false));
    return () => {
      if (pollTimer.current) window.clearTimeout(pollTimer.current);
    };
  }, [pollJob]);

  // On narrow screens the detail sits under the list, so bring it into view on selection.
  useEffect(() => {
    if (selectedId && window.innerWidth < 1280) {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedId]);

  const savedPlaceIds = useMemo(() => new Set(saved.map((lead) => lead.place.placeId)), [saved]);

  const search = async (pageToken?: string) => {
    const query = pageToken ? lastQuery : `${customSector.trim() || sector} ${location.trim()}`.trim();
    setLoading(true);
    setError("");
    if (source === "scraper" && !pageToken) {
      try {
        const started = await leadsFetch<ScrapeJobView>("/api/admin/leads/scrape", {
          method: "POST",
          body: JSON.stringify({ query, limit }),
        });
        setLastQuery(query);
        setResults([]);
        setNextPageToken(undefined);
        setSelectedId(null);
        setJob(started);
        pollJob(started.id);
      } catch (e) {
        setError((e as Error).message);
        setLoading(false);
      }
      return;
    }
    try {
      const data = await leadsFetch<LeadSearchResponse>("/api/admin/leads/search", {
        method: "POST",
        body: JSON.stringify({ query, pageToken }),
      });
      setLastQuery(query);
      setResults((prev) => (pageToken ? [...prev, ...data.leads] : data.leads));
      setNextPageToken(data.nextPageToken);
      if (!pageToken) setSelectedId(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const visibleResults = useMemo(() => {
    const filtered = results.filter(
      (lead) => lead.analysis.score >= minScore && (!onlyNoWebsite || !ownWebsite(lead.website))
    );
    return [...filtered].sort((a, b) => {
      if (sortKey === "score") return b.analysis.score - a.analysis.score;
      if (sortKey === "ratingCount") return (b.ratingCount ?? 0) - (a.ratingCount ?? 0);
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
  }, [results, minScore, onlyNoWebsite, sortKey]);

  const auditResult = async (lead: ResultLead) => {
    try {
      const data = await leadsFetch<{ audit: WebsiteAudit; analysis: LeadAnalysis }>("/api/admin/leads/audit", {
        method: "POST",
        body: JSON.stringify({ place: lead }),
      });
      setResults((prev) =>
        prev.map((item) => (item.placeId === lead.placeId ? { ...item, audit: data.audit, analysis: data.analysis } : item))
      );
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const saveResult = async (lead: ResultLead) => {
    try {
      const { analysis: _analysis, audit, ...place } = lead;
      const created = await leadsFetch<SavedLead>("/api/admin/leads", {
        method: "POST",
        body: JSON.stringify({ place, audit, searchQuery: lastQuery }),
      });
      setSaved((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const patchSaved = async (id: string, patch: { status?: LeadStatus; notes?: string; audit?: WebsiteAudit }) => {
    try {
      const updated = await leadsFetch<SavedLead>(`/api/admin/leads/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setSaved((prev) => prev.map((lead) => (lead.id === id ? updated : lead)));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const auditSaved = async (lead: SavedLead) => {
    try {
      const data = await leadsFetch<{ audit: WebsiteAudit }>("/api/admin/leads/audit", {
        method: "POST",
        body: JSON.stringify({ place: lead.place }),
      });
      await patchSaved(lead.id, { audit: data.audit });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const deleteSaved = async (lead: SavedLead) => {
    if (!confirm(`${lead.place.name} aday listesinden kaldırılsın mı?`)) return;
    try {
      await leadsFetch(`/api/admin/leads/${encodeURIComponent(lead.id)}`, { method: "DELETE" });
      setSaved((prev) => prev.filter((item) => item.id !== lead.id));
      setSelectedId(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const filteredSaved = saved
    .filter((lead) => statusFilter === "all" || lead.status === statusFilter)
    .sort((a, b) => b.analysis.score - a.analysis.score);
  const selectedResult = visibleResults.find((lead) => lead.placeId === selectedId);
  const selectedSaved = saved.find((lead) => lead.id === selectedId);

  const exportSaved = () =>
    downloadCsv(`digivideas-musteri-adaylari-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["İşletme", "Tür", "Puan", "Seviye", "Durum", "Telefon", "E-posta", "Web sitesi", "Instagram", "Google puanı", "Yorum sayısı", "Adres", "Fırsatlar", "Notlar", "Google Haritalar"],
      ...filteredSaved.map((lead) => [
        lead.place.name,
        lead.place.primaryTypeLabel || lead.place.primaryType,
        lead.analysis.score,
        lead.analysis.tier,
        LEAD_STATUS_LABELS[lead.status],
        lead.place.phone,
        lead.audit?.emails?.join(", "),
        lead.place.website,
        lead.audit?.socials.instagram,
        lead.place.rating,
        lead.place.ratingCount,
        lead.place.address,
        lead.analysis.opportunities.join(", "),
        lead.notes,
        lead.place.mapsUrl,
      ]),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Müşteri Bulucu</h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Google Haritalar&apos;dan işletme bulun, sosyal medya reklamı potansiyelini analiz edin.
          </p>
        </div>
        <div role="tablist" className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-white/10 self-start">
          <button
            role="tab"
            aria-selected={view === "search"}
            onClick={() => {
              setView("search");
              setSelectedId(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${view === "search" ? "bg-brand-500 text-slate-950" : "text-zinc-400 hover:text-white"}`}
          >
            Arama
          </button>
          <button
            role="tab"
            aria-selected={view === "saved"}
            onClick={() => {
              setView("saved");
              setSelectedId(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${view === "saved" ? "bg-brand-500 text-slate-950" : "text-zinc-400 hover:text-white"}`}
          >
            Kayıtlı adaylar ({saved.length})
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-sm text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")} className="text-xs underline">
            Kapat
          </button>
        </div>
      )}

      {view === "search" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
          className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-white/10 grid grid-cols-2 md:grid-cols-12 gap-3 items-end"
        >
          <div className="col-span-2 md:col-span-12 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-400 mr-1">Kaynak:</span>
            <button
              type="button"
              onClick={() => setSource("scraper")}
              aria-pressed={source === "scraper"}
              className={`px-3 py-1.5 rounded-lg text-xs border ${source === "scraper" ? "border-brand-500/60 bg-brand-500/10 text-white" : "border-white/10 text-zinc-400 hover:text-white"}`}
            >
              Google Haritalar · ücretsiz (tarayıcı)
            </button>
            <button
              type="button"
              onClick={() => placesApi && setSource("places-api")}
              disabled={!placesApi}
              aria-pressed={source === "places-api"}
              title={placesApi ? undefined : "GOOGLE_MAPS_API_KEY tanımlı değil"}
              className={`px-3 py-1.5 rounded-lg text-xs border disabled:opacity-40 disabled:cursor-not-allowed ${source === "places-api" ? "border-brand-500/60 bg-brand-500/10 text-white" : "border-white/10 text-zinc-400 hover:text-white"}`}
            >
              Google Places API{placesApi === false ? " (anahtar yok)" : ""}
            </button>
          </div>
          <div className="col-span-2 md:col-span-3 space-y-1.5">
            <label htmlFor="lead-sector" className="block text-[11px] font-mono text-zinc-400">Sektör</label>
            <select
              id="lead-sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 focus:border-brand-500 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
            >
              {SECTOR_PRESETS.map((preset) => (
                <option key={preset}>{preset}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 md:col-span-2 space-y-1.5">
            <label htmlFor="lead-custom" className="block text-[11px] font-mono text-zinc-400">veya özel anahtar kelime</label>
            <input
              id="lead-custom"
              value={customSector}
              onChange={(e) => setCustomSector(e.target.value)}
              placeholder="örn. vegan restoran"
              className="w-full bg-slate-950 border border-white/10 focus:border-brand-500 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none"
            />
          </div>
          <div className="col-span-2 md:col-span-3 space-y-1.5">
            <label htmlFor="lead-location" className="block text-[11px] font-mono text-zinc-400">Konum</label>
            <input
              id="lead-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="örn. Bornova, İzmir"
              className="w-full bg-slate-950 border border-white/10 focus:border-brand-500 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label htmlFor="lead-limit" className="block text-[11px] font-mono text-zinc-400">Adet</label>
            <select
              id="lead-limit"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              disabled={source !== "scraper"}
              className="w-full bg-slate-950 border border-white/10 focus:border-brand-500 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none disabled:opacity-40"
            >
              {[10, 20, 40, 60].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-slate-950 text-sm font-bold"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Ara
          </button>
        </form>
      )}

      {view === "search" && job && (job.status === "running" || job.status === "cancelled") && (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-brand-500/30 space-y-2.5" aria-live="polite">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-zinc-200 min-w-0 truncate">
              {job.status === "running" && <Loader2 className="inline w-3.5 h-3.5 mr-1.5 animate-spin text-brand-400" />}
              {job.message}
            </span>
            {job.status === "running" && (
              <button
                onClick={() =>
                  leadsFetch(`/api/admin/leads/scrape/${encodeURIComponent(job.id)}`, { method: "DELETE" }).catch((e: Error) =>
                    setError(e.message)
                  )
                }
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 text-zinc-300 hover:text-white flex-shrink-0"
              >
                <Square className="w-3 h-3" /> Durdur
              </button>
            )}
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={job.progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${job.progress}%` }} />
          </div>
          <p className="text-[11px] font-mono text-zinc-500">
            {job.leads.length} işletme bulundu · web siteleri otomatik analiz ediliyor. Sayfadan ayrılabilirsiniz; tarama sunucuda devam eder.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* List column */}
        <div className="xl:col-span-5 space-y-3 min-w-0">
          {view === "search" ? (
            <>
              {results.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <select
                    aria-label="Sıralama"
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as SortKey)}
                    className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-200"
                  >
                    <option value="score">Potansiyel puanı</option>
                    <option value="ratingCount">Yorum sayısı</option>
                    <option value="rating">Google puanı</option>
                  </select>
                  <select
                    aria-label="En düşük puan"
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-200"
                  >
                    <option value={0}>Tüm puanlar</option>
                    <option value={40}>Ilık ve üstü (40+)</option>
                    <option value={65}>Sadece sıcak (65+)</option>
                  </select>
                  <label className="inline-flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                    <input type="checkbox" checked={onlyNoWebsite} onChange={(e) => setOnlyNoWebsite(e.target.checked)} className="accent-orange-500" />
                    Web sitesi olmayanlar
                  </label>
                  <span className="ml-auto text-zinc-500 font-mono">{visibleResults.length} sonuç</span>
                </div>
              )}

              {results.length === 0 && !loading && (
                <div className="p-8 rounded-2xl bg-slate-950/60 border border-white/10 text-center space-y-2">
                  <MapPinned className="w-8 h-8 text-zinc-500 mx-auto" />
                  <p className="text-sm text-zinc-300">Sektör ve konum seçip arayın.</p>
                  {source === "scraper" && (
                    <p className="text-xs text-zinc-500">
                      Ücretsiz tarayıcı yöntemi Google Haritalar&apos;ı sunucuda açıp sonuçları tek tek okur; 20 işletme yaklaşık 1–2 dakika sürer.
                    </p>
                  )}
                  <p className="text-xs text-zinc-500">
                    Her sonuç; sektör uyumu, Google yorumları, web sitesi ve sosyal medya varlığına göre 0–100 arası puanlanır.
                  </p>
                </div>
              )}

              {visibleResults.map((lead) => (
                <LeadRow
                  key={lead.placeId}
                  lead={lead}
                  active={lead.placeId === selectedId}
                  onSelect={() => setSelectedId(lead.placeId)}
                  extra={savedPlaceIds.has(lead.placeId) ? <span className="text-emerald-400">kayıtlı</span> : undefined}
                />
              ))}

              {nextPageToken && (
                <button
                  onClick={() => search(nextPageToken)}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl border border-white/10 text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-60"
                >
                  {loading ? "Yükleniyor..." : "Daha fazla sonuç yükle"}
                </button>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none max-w-full">
                  {(["all", ...Object.keys(LEAD_STATUS_LABELS)] as (LeadStatus | "all")[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      aria-pressed={statusFilter === status}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] whitespace-nowrap border ${statusFilter === status ? "border-brand-500/60 bg-brand-500/10 text-white" : "border-white/10 text-zinc-400 hover:text-white"}`}
                    >
                      {status === "all" ? "Tümü" : LEAD_STATUS_LABELS[status]} (
                      {status === "all" ? saved.length : saved.filter((lead) => lead.status === status).length})
                    </button>
                  ))}
                </div>
                <button
                  onClick={exportSaved}
                  disabled={filteredSaved.length === 0}
                  className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
              </div>
              {filteredSaved.length === 0 ? (
                <p className="p-8 rounded-2xl bg-slate-950/60 border border-white/10 text-center text-sm text-zinc-400">
                  Bu durumda kayıtlı aday yok. Arama sonuçlarından &ldquo;Aday listesine kaydet&rdquo; ile ekleyin.
                </p>
              ) : (
                filteredSaved.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={{ ...lead.place, analysis: lead.analysis, audit: lead.audit }}
                    active={lead.id === selectedId}
                    onSelect={() => setSelectedId(lead.id)}
                    extra={<span className="text-zinc-300">{LEAD_STATUS_LABELS[lead.status]}</span>}
                  />
                ))
              )}
            </>
          )}
        </div>

        {/* Detail column */}
        <div ref={detailRef} className="xl:col-span-7 xl:sticky xl:top-24 min-w-0 scroll-mt-32">
          {view === "search" && selectedResult && (
            <LeadDetail
              place={selectedResult}
              analysis={selectedResult.analysis}
              audit={selectedResult.audit}
              isSaved={savedPlaceIds.has(selectedResult.placeId)}
              onAudit={() => auditResult(selectedResult)}
              onSave={() => saveResult(selectedResult)}
              onClose={() => setSelectedId(null)}
            />
          )}
          {view === "saved" && selectedSaved && (
            <LeadDetail
              place={selectedSaved.place}
              analysis={selectedSaved.analysis}
              audit={selectedSaved.audit}
              isSaved
              onAudit={() => auditSaved(selectedSaved)}
              onClose={() => setSelectedId(null)}
            >
              <div className="space-y-3 p-4 rounded-xl bg-slate-950/70 border border-white/10">
                <div className="space-y-1.5">
                  <label htmlFor="lead-status" className="block text-[11px] font-mono text-zinc-400">Satış durumu</label>
                  <select
                    id="lead-status"
                    value={selectedSaved.status}
                    onChange={(e) => patchSaved(selectedSaved.id, { status: e.target.value as LeadStatus })}
                    className="w-full bg-slate-950 border border-white/10 focus:border-brand-500 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                  >
                    {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="lead-notes" className="block text-[11px] font-mono text-zinc-400">Notlar (odak dışına çıkınca kaydedilir)</label>
                  <textarea
                    id="lead-notes"
                    key={selectedSaved.id}
                    defaultValue={selectedSaved.notes}
                    onBlur={(e) => {
                      if (e.target.value !== selectedSaved.notes) patchSaved(selectedSaved.id, { notes: e.target.value });
                    }}
                    rows={3}
                    placeholder="Görüşme notları, karar verici, teklif tutarı..."
                    className="w-full bg-slate-950 border border-white/10 focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => deleteSaved(selectedSaved)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Listeden kaldır
                </button>
              </div>
            </LeadDetail>
          )}
          {!selectedResult && !selectedSaved && (
            <div className="hidden xl:flex p-10 rounded-2xl border border-dashed border-white/10 text-center text-sm text-zinc-500 items-center justify-center min-h-[300px]">
              Detay, harita ve müşteri analizini görmek için listeden bir işletme seçin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
