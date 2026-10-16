"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Download,
  Eye,
  MousePointerClick,
  RefreshCw,
  Table2,
  Target,
  UserPlus,
  Users,
  LogOut,
  Layers,
} from "lucide-react";
import { AnalyticsReport, EVENT_LABELS, KpiSet, RealtimeReport } from "@/lib/analytics/types";
import { AreaChart, BarList, ColumnChart, formatCompact } from "@/components/admin/analytics/charts";

const RANGES = [
  { days: 1, label: "Bugün" },
  { days: 7, label: "7 gün" },
  { days: 28, label: "28 gün" },
  { days: 90, label: "90 gün" },
  { days: 365, label: "12 ay" },
] as const;

type Metric = "visitors" | "sessions" | "pageviews";
const METRIC_LABELS: Record<Metric, string> = {
  visitors: "Ziyaretçi",
  sessions: "Oturum",
  pageviews: "Görüntüleme",
};

const COUNTRY_NAMES = new Intl.DisplayNames(["tr"], { type: "region" });
const LANGUAGE_NAMES = new Intl.DisplayNames(["tr"], { type: "language" });

function safeDisplayName(names: Intl.DisplayNames, code: string) {
  try {
    return names.of(code) || code;
  } catch {
    return code;
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} sn`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes} dk ${seconds % 60} sn`;
}

function formatDateShort(date: string): string {
  const [, month, day] = date.split("-");
  return `${day}.${month}`;
}

function formatDateLong(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "short",
  });
}

function delta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return (current - previous) / previous;
}

function KpiTile({
  label,
  value,
  current,
  previous,
  icon: Icon,
  higherIsBetter = true,
}: {
  label: string;
  value: string;
  current: number;
  previous: number;
  icon: React.ElementType;
  higherIsBetter?: boolean;
}) {
  const change = delta(current, previous);
  const isUp = (change ?? 0) > 0;
  const good = change === null || change === 0 ? null : isUp === higherIsBetter;
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2 min-w-0">
      <div className="flex items-center justify-between text-zinc-400 text-[11px] sm:text-xs font-mono gap-2">
        <span className="truncate">{label}</span>
        <Icon className="w-4 h-4 text-zinc-500 flex-shrink-0" />
      </div>
      <p className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">{value}</p>
      <p className="text-[11px] font-mono flex items-center gap-1 text-zinc-500">
        {change === null ? (
          <span>önceki dönemde veri yok</span>
        ) : (
          <>
            <span
              className={`inline-flex items-center gap-0.5 ${good === null ? "text-zinc-400" : good ? "text-emerald-400" : "text-red-400"}`}
            >
              {change !== 0 && (isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />)}
              %{Math.abs(Math.round(change * 100))}
            </span>
            <span>önceki döneme göre</span>
          </>
        )}
      </p>
    </div>
  );
}

function Panel({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4 min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function AnalyticsDashboard() {
  const [days, setDays] = useState<number>(28);
  const [metric, setMetric] = useState<Metric>("visitors");
  const [showTable, setShowTable] = useState(false);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [realtime, setRealtime] = useState<RealtimeReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/analytics?days=${days}`, { cache: "no-store" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Rapor alınamadı");
      setReport(await res.json());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [days]);

  const loadRealtime = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics/realtime", { cache: "no-store" });
      if (res.ok) setRealtime(await res.json());
    } catch {
      // keep previous realtime data
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadRealtime();
    const timer = window.setInterval(loadRealtime, 30_000);
    return () => window.clearInterval(timer);
  }, [loadRealtime]);

  const k: KpiSet | undefined = report?.kpis;
  const p: KpiSet | undefined = report?.previousKpis;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Site Analizi</h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Çerezsiz, birinci taraf ziyaretçi analitiği · Saat dilimi: İstanbul
          </p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
          <div role="tablist" aria-label="Tarih aralığı" className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-white/10">
            {RANGES.map((range) => (
              <button
                key={range.days}
                role="tab"
                aria-selected={days === range.days}
                onClick={() => setDays(range.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${days === range.days ? "bg-brand-500 text-slate-950" : "text-zinc-400 hover:text-white"}`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              load();
              loadRealtime();
            }}
            className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-zinc-400 hover:text-white flex-shrink-0"
            aria-label="Verileri yenile"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Realtime */}
      <section className="p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-brand-500/30 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </span>
            Şu an sitede (son 5 dk)
          </div>
          <p className="text-5xl font-semibold text-white tracking-tight">{realtime?.activeVisitors ?? "–"}</p>
          <p className="text-[11px] font-mono text-zinc-500">
            Son 30 dakikada {realtime?.pageviewsLast30Min ?? 0} sayfa görüntüleme · 30 sn&apos;de bir yenilenir
          </p>
        </div>
        <div className="md:col-span-1 min-w-0">
          <p className="text-[11px] font-mono text-zinc-500 mb-1">Dakika başına görüntüleme (son 30 dk)</p>
          <ColumnChart
            values={realtime?.minutes ?? new Array(30).fill(0)}
            labels={Array.from({ length: 30 }, (_, i) => `${30 - i} dk önce`)}
            height={90}
            valueLabel="Görüntüleme"
            labelEvery={0}
          />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-mono text-zinc-500 mb-1">Aktif sayfalar</p>
          <BarList rows={realtime?.pages ?? []} emptyText="Şu an aktif ziyaretçi yok." />
        </div>
      </section>

      {/* KPI tiles */}
      {k && p ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiTile label="Ziyaretçi" value={formatCompact(k.visitors)} current={k.visitors} previous={p.visitors} icon={Users} />
          <KpiTile label="Yeni ziyaretçi" value={formatCompact(k.newVisitors)} current={k.newVisitors} previous={p.newVisitors} icon={UserPlus} />
          <KpiTile label="Oturum" value={formatCompact(k.sessions)} current={k.sessions} previous={p.sessions} icon={Activity} />
          <KpiTile label="Sayfa görüntüleme" value={formatCompact(k.pageviews)} current={k.pageviews} previous={p.pageviews} icon={Eye} />
          <KpiTile label="Ort. oturum süresi" value={formatDuration(k.avgSessionSeconds)} current={k.avgSessionSeconds} previous={p.avgSessionSeconds} icon={Clock} />
          <KpiTile label="Hemen çıkma oranı" value={`%${Math.round(k.bounceRate * 100)}`} current={k.bounceRate} previous={p.bounceRate} icon={LogOut} higherIsBetter={false} />
          <KpiTile label="Sayfa / oturum" value={k.pagesPerSession.toFixed(2).replace(".", ",")} current={k.pagesPerSession} previous={p.pagesPerSession} icon={Layers} />
          <KpiTile label="Dönüşüm" value={`${k.conversions} · %${(k.conversionRate * 100).toFixed(1).replace(".", ",")}`} current={k.conversions} previous={p.conversions} icon={Target} />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-900/60 border border-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {report && (
        <>
          {/* Trend */}
          <Panel
            title={`${METRIC_LABELS[metric]} trendi`}
            subtitle={`${formatDateLong(report.range.from)} – ${formatDateLong(report.range.to)}`}
            action={
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => setShowTable((v) => !v)}
                  className={`p-2 rounded-lg border border-white/10 ${showTable ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"}`}
                  aria-label="Tablo görünümü"
                  aria-pressed={showTable}
                >
                  <Table2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    downloadCsv(`digivideas-analiz-${report.range.from}-${report.range.to}.csv`, [
                      ["Tarih", "Ziyaretçi", "Oturum", "Görüntüleme"],
                      ...report.daily.map((d) => [d.date, d.visitors, d.sessions, d.pageviews]),
                    ])
                  }
                  className="p-2 rounded-lg border border-white/10 text-zinc-400 hover:text-white"
                  aria-label="CSV olarak indir"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            }
          >
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {(Object.keys(METRIC_LABELS) as Metric[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setMetric(key)}
                  aria-pressed={metric === key}
                  className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap border ${metric === key ? "border-brand-500/60 bg-brand-500/10 text-white" : "border-white/10 text-zinc-400 hover:text-white"}`}
                >
                  {METRIC_LABELS[key]}
                </button>
              ))}
            </div>
            {showTable ? (
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left text-xs">
                  <thead className="text-zinc-500 font-mono sticky top-0 bg-slate-900">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Tarih</th>
                      <th className="py-2 pr-4 font-medium text-right">Ziyaretçi</th>
                      <th className="py-2 pr-4 font-medium text-right">Oturum</th>
                      <th className="py-2 font-medium text-right">Görüntüleme</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-200">
                    {[...report.daily].reverse().map((d) => (
                      <tr key={d.date}>
                        <td className="py-2 pr-4 font-mono">{formatDateLong(d.date)}</td>
                        <td className="py-2 pr-4 text-right">{d.visitors}</td>
                        <td className="py-2 pr-4 text-right">{d.sessions}</td>
                        <td className="py-2 text-right">{d.pageviews}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <AreaChart
                valueLabel={METRIC_LABELS[metric]}
                points={report.daily.map((d) => ({
                  label: formatDateLong(d.date),
                  shortLabel: formatDateShort(d.date),
                  value: d[metric],
                }))}
              />
            )}
          </Panel>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <Panel title="En çok görüntülenen sayfalar" subtitle="Görüntüleme · ortalama süre">
              <BarList
                rows={report.topPages.map((page) => ({
                  key: page.path,
                  value: page.pageviews,
                  hint: page.avgSeconds ? formatDuration(page.avgSeconds) : undefined,
                }))}
              />
            </Panel>
            <Panel title="Trafik kanalları" subtitle="Oturumların geldiği kanal">
              <BarList rows={report.channels} />
            </Panel>
            <Panel title="Yönlendiren siteler" subtitle="Referans alan adları">
              <BarList rows={report.referrers} emptyText="Yönlendiren site yok (doğrudan trafik)." />
            </Panel>
            <Panel title="Giriş sayfaları" subtitle="Oturumun başladığı sayfa">
              <BarList rows={report.landingPages} />
            </Panel>
          </div>

          <Panel title="Kampanyalar (UTM)" subtitle="utm_campaign / utm_source / utm_medium parametreli bağlantılar">
            {report.campaigns.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4">
                Henüz UTM&apos;li ziyaret yok. Reklam bağlantılarınıza örn.{" "}
                <code className="text-brand-400">?utm_source=instagram&amp;utm_medium=paid_social&amp;utm_campaign=ekim</code> ekleyin.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[480px]">
                  <thead className="text-zinc-500 font-mono">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Kampanya</th>
                      <th className="py-2 pr-4 font-medium">Kaynak / Ortam</th>
                      <th className="py-2 pr-4 font-medium text-right">Oturum</th>
                      <th className="py-2 font-medium text-right">Dönüşüm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-200">
                    {report.campaigns.map((row) => (
                      <tr key={`${row.campaign}-${row.source}-${row.medium}`}>
                        <td className="py-2 pr-4">{row.campaign}</td>
                        <td className="py-2 pr-4 font-mono text-zinc-400">
                          {row.source} / {row.medium}
                        </td>
                        <td className="py-2 pr-4 text-right">{row.sessions}</td>
                        <td className="py-2 text-right">{row.conversions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <Panel title="Cihaz türü">
              <BarList rows={report.devices} />
            </Panel>
            <Panel title="Tarayıcı">
              <BarList rows={report.browsers} />
            </Panel>
            <Panel title="İşletim sistemi">
              <BarList rows={report.operatingSystems} />
            </Panel>
            <Panel title="Ülke" subtitle="CDN/proxy ülke başlığı varsa">
              <BarList
                rows={report.countries}
                formatKey={(code) => safeDisplayName(COUNTRY_NAMES, code)}
                emptyText="Ülke bilgisi yok (Cloudflare vb. ülke başlığı gerekir)."
              />
            </Panel>
            <Panel title="Tarayıcı dili">
              <BarList rows={report.languages} formatKey={(code) => safeDisplayName(LANGUAGE_NAMES, code)} />
            </Panel>
            <Panel title="Etkileşim & dönüşüm olayları" subtitle="Tıklamalar ve form gönderimleri">
              <BarList
                rows={report.events}
                formatKey={(name) => EVENT_LABELS[name] || name}
                emptyText="Henüz kayıtlı olay yok."
              />
            </Panel>
          </div>

          <Panel title="Saatlere göre görüntüleme" subtitle="Reklam yayın saatlerini planlamak için (İstanbul saati)">
            <ColumnChart
              values={report.hours}
              labels={report.hours.map((_, h) => `${String(h).padStart(2, "0")}:00`)}
              valueLabel="Görüntüleme"
            />
          </Panel>

          <p className="text-[11px] text-zinc-500 font-mono flex items-start gap-2">
            <MousePointerClick className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            Botlar filtrelenir, IP adresi saklanmaz; &ldquo;Do Not Track&rdquo; açık ziyaretçiler sayılmaz. Bu nedenle değerler
            Google Analytics&apos;ten bir miktar farklı olabilir.
          </p>
        </>
      )}
    </div>
  );
}
