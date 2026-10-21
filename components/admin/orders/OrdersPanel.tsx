"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Copy,
  CreditCard,
  Edit2,
  Eye,
  Link2,
  Loader2,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { ORDER_STATUS_LABELS, OrderStatus, OrderView } from "@/lib/orders/types";
import { isLinkExpired, orderTotals } from "@/lib/orders/calc";
import { OrderPrefill } from "@/lib/orders/prefill";
import { OrderEditor } from "@/components/admin/orders/OrderEditor";
import { MailSettingsCard } from "@/components/admin/orders/MailSettingsCard";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

const formatTL = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value || 0);
const formatDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "–";

type DisplayStatus = OrderStatus | "suresi_doldu";

const STATUS_STYLES: Record<DisplayStatus, string> = {
  beklemede: "bg-white/5 text-zinc-300",
  link_gonderildi: "bg-sky-500/15 text-sky-300",
  odendi: "bg-emerald-500/15 text-emerald-300",
  basarisiz: "bg-red-500/15 text-red-300",
  iptal: "bg-white/5 text-zinc-500",
  suresi_doldu: "bg-amber-400/15 text-amber-300",
};

const HISTORY_LABELS: Record<string, string> = {
  olusturuldu: "Oluşturuldu",
  duzenlendi: "Düzenlendi",
  link_olusturuldu: "Yeni link oluşturuldu",
  link_gonderildi: "Link e-postayla gönderildi",
  odeme_baslatildi: "Müşteri ödeme sayfasına geçti",
  odendi: "Ödendi",
  odeme_basarisiz: "Ödeme başarısız",
  iptal_edildi: "İptal edildi",
};

function displayStatus(order: OrderView): DisplayStatus {
  if (order.status !== "odendi" && order.status !== "iptal" && isLinkExpired(order)) return "suresi_doldu";
  return order.status;
}

interface Readiness {
  iyzico: { configured: boolean; mode: "sandbox" | "live" };
  mailConfigured: boolean;
  siteUrl: string;
  siteUrlHttps: boolean;
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", headers: { "Content-Type": "application/json" }, ...init });
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(body.error || `İstek başarısız (${response.status})`);
  return body;
}

function OrderDetail({ order, onClose }: { order: OrderView; onClose: () => void }) {
  const totals = orderTotals(order.items, order.vatRate);
  const [showContract, setShowContract] = useState(false);
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true" aria-label="Sipariş detayı">
      <div className="bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-7 w-full max-w-2xl max-h-[92vh] overflow-y-auto space-y-5">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-[11px] font-mono text-zinc-400">{order.number}</p>
            <h3 className="text-lg font-bold text-white">{order.title}</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white" aria-label="Kapat">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1 text-zinc-300">
            <p className="font-mono text-[11px] text-brand-400 uppercase">Müşteri</p>
            <p className="text-white">{order.customer.fullName}{order.customer.company ? ` · ${order.customer.company}` : ""}</p>
            <p>{order.customer.email}</p>
            <p>{order.customer.phone}</p>
            {order.customer.address && <p className="text-zinc-400">{order.customer.address}{order.customer.city ? `, ${order.customer.city}` : ""}</p>}
          </div>
          <div className="space-y-1 text-zinc-300">
            <p className="font-mono text-[11px] text-brand-400 uppercase">Tutar</p>
            <p className="text-white text-lg font-bold">{formatTL(totals.total)}</p>
            <p className="text-xs">KDV hariç {formatTL(totals.subtotal)} + KDV {formatTL(totals.vat)}</p>
            <p className="text-xs">Durum: {ORDER_STATUS_LABELS[displayStatus(order)]}</p>
            {order.linkExpiresAt && <p className="text-xs">Link geçerliliği: {formatDateTime(order.linkExpiresAt)}</p>}
          </div>
        </div>

        {(order.iyzico.paymentId || order.iyzico.lastError) && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-zinc-300 space-y-1">
            <p className="font-mono text-[11px] text-brand-400 uppercase">iyzico</p>
            {order.iyzico.paymentId && <p>Ödeme no: <span className="font-mono text-white">{order.iyzico.paymentId}</span> · {formatDateTime(order.paidAt)}</p>}
            {order.iyzico.paidPrice && <p>Tahsil edilen (taksit farkı dahil): {order.iyzico.paidPrice} TL · Taksit: {order.iyzico.installment ?? 1}</p>}
            {order.iyzico.lastFourDigits && <p>Kart: {order.iyzico.cardAssociation} {order.iyzico.cardFamily} ···· {order.iyzico.lastFourDigits}</p>}
            {order.iyzico.fraudStatus !== undefined && order.iyzico.fraudStatus !== 1 && (
              <p className="text-amber-300">Dolandırıcılık kontrolü: inceleme gerekiyor (iyzico panelinden kontrol edin)</p>
            )}
            {order.iyzico.lastError && order.status !== "odendi" && <p className="text-red-300">Son hata: {order.iyzico.lastError}</p>}
          </div>
        )}

        {order.agreementSnapshot && (
          <div className="space-y-2">
            <button onClick={() => setShowContract((v) => !v)} className="text-xs text-brand-300 underline">
              {showContract ? "Onaylanan sözleşmeyi gizle" : `Müşterinin onayladığı sözleşmeyi göster (${formatDateTime(order.agreementAcceptedAt)}, IP ${order.buyerIp ?? "-"})`}
            </button>
            {showContract && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 max-h-72 overflow-y-auto">
                <MarkdownRenderer content={order.agreementSnapshot} />
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <p className="font-mono text-[11px] text-brand-400 uppercase">Geçmiş</p>
            <ul className="space-y-1 text-[11px] font-mono text-zinc-400 max-h-48 overflow-y-auto">
              {[...order.history].reverse().map((entry, index) => (
                <li key={`${entry.at}-${index}`}>
                  {formatDateTime(entry.at)} — <span className="text-zinc-200">{HISTORY_LABELS[entry.action] ?? entry.action}</span>
                  {entry.note ? ` · ${entry.note}` : ""}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-1.5">
            <p className="font-mono text-[11px] text-brand-400 uppercase">E-postalar</p>
            {order.emailLog.length === 0 ? (
              <p className="text-[11px] text-zinc-500">Henüz e-posta gönderilmedi.</p>
            ) : (
              <ul className="space-y-1 text-[11px] font-mono text-zinc-400 max-h-48 overflow-y-auto">
                {[...order.emailLog].reverse().map((entry, index) => (
                  <li key={`${entry.at}-${index}`} className={entry.ok ? "" : "text-red-300"}>
                    {formatDateTime(entry.at)} — {entry.kind === "odeme_linki" ? "Ödeme linki" : entry.kind === "odeme_onayi" ? "Ödeme onayı" : "Yönetici bildirimi"} → {entry.to}
                    {entry.ok ? " ✓" : ` ✗ ${entry.error ?? ""}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {order.internalNote && <p className="text-xs text-zinc-400 whitespace-pre-line border-t border-white/10 pt-3">İç not: {order.internalNote}</p>}
      </div>
    </div>
  );
}

export function OrdersPanel({ prefill, onPrefillUsed }: { prefill: OrderPrefill | null; onPrefillUsed: () => void }) {
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [busyId, setBusyId] = useState("");
  const [filter, setFilter] = useState<DisplayStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<OrderView | "new" | null>(null);
  const [viewing, setViewing] = useState<OrderView | null>(null);

  const load = useCallback(async () => {
    try {
      const [list, ready] = await Promise.all([api<OrderView[]>("/api/admin/orders"), api<Readiness>("/api/admin/payments-config")]);
      setOrders(list);
      setReadiness(ready);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (prefill) setEditing("new");
  }, [prefill]);

  const notify = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 4000);
  };

  const action = async (order: OrderView, label: string, task: () => Promise<unknown>, success: string) => {
    setBusyId(`${order.id}:${label}`);
    setError("");
    try {
      await task();
      notify(success);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId("");
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return orders
      .filter((order) => filter === "all" || displayStatus(order) === filter)
      .filter((order) => !q || `${order.number} ${order.title} ${order.customer.fullName} ${order.customer.email} ${order.customer.company ?? ""}`.toLocaleLowerCase("tr").includes(q))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [orders, filter, query]);

  const paidThisMonth = orders
    .filter((order) => order.status === "odendi" && order.paidAt?.slice(0, 7) === new Date().toISOString().slice(0, 7))
    .reduce((sum, order) => sum + orderTotals(order.items, order.vatRate).total, 0);
  const waiting = orders.filter((order) => ["beklemede", "link_gonderildi", "basarisiz"].includes(displayStatus(order)));

  const copyLink = async (order: OrderView) => {
    if (!order.paymentUrl) return;
    await navigator.clipboard.writeText(order.paymentUrl).catch(() => undefined);
    notify("Ödeme linki kopyalandı");
  };

  const whatsappHref = (order: OrderView) => {
    const digits = order.customer.phone.replace(/[^0-9]/g, "");
    const number = digits.startsWith("0") ? `9${digits}` : digits.length === 10 ? `90${digits}` : digits;
    const text = `Merhaba ${order.customer.fullName}, ${order.title} için güvenli ödeme bağlantınız: ${order.paymentUrl}`;
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Siparişler & Ödeme Linkleri</h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Müşteriye özel, gizli bağlantıyla iyzico üzerinden kartla ödeme. Ödeme gelince sipariş ve Ödemeler sayfası otomatik güncellenir.
          </p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl self-start"
        >
          <Plus className="w-4 h-4" /> Yeni sipariş
        </button>
      </div>

      {toast && <div role="status" className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-200">{toast}</div>}
      {error && (
        <div role="alert" className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-sm text-red-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span className="flex-1">{error}</span>
          <button onClick={() => setError("")} className="text-xs underline">Kapat</button>
        </div>
      )}

      {readiness && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {[
            {
              ok: readiness.iyzico.configured,
              title: readiness.iyzico.configured ? `iyzico bağlı (${readiness.iyzico.mode === "live" ? "CANLI" : "test / sandbox"})` : "iyzico anahtarları eksik",
              hint: readiness.iyzico.configured
                ? readiness.iyzico.mode === "live" ? "Gerçek kartlardan çekim yapılır." : "Test modunda gerçek para çekilmez."
                : "Sunucu .env: IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_MODE",
            },
            { ok: readiness.mailConfigured, title: readiness.mailConfigured ? "E-posta gönderimi hazır" : "E-posta ayarları eksik", hint: "Aşağıdaki E-posta ayarları bölümünden." },
            {
              ok: readiness.siteUrlHttps,
              title: readiness.siteUrlHttps ? "Site adresi HTTPS" : "Site adresi HTTPS değil",
              hint: `${readiness.siteUrl} — ödeme linkleri ve iyzico dönüşü bu adresi kullanır.`,
            },
          ].map((item) => (
            <div key={item.title} className={`p-3 rounded-xl border ${item.ok ? "bg-emerald-500/5 border-emerald-500/30" : "bg-amber-400/10 border-amber-400/40"}`}>
              <p className={`font-semibold flex items-center gap-1.5 ${item.ok ? "text-emerald-300" : "text-amber-200"}`}>
                {item.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />} {item.title}
              </p>
              <p className="text-zinc-400 mt-1 break-words">{item.hint}</p>
            </div>
          ))}
        </div>
      )}

      <MailSettingsCard onChanged={load} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Bu ay tahsil edilen", value: formatTL(paidThisMonth) },
          { label: "Ödeme bekleyen", value: `${waiting.length} sipariş` },
          { label: "Bekleyen tutar", value: formatTL(waiting.reduce((sum, order) => sum + orderTotals(order.items, order.vatRate).total, 0)) },
          { label: "Toplam sipariş", value: String(orders.length) },
        ].map((tile) => (
          <div key={tile.label} className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
            <p className="text-[11px] font-mono text-zinc-400">{tile.label}</p>
            <p className="text-xl font-semibold text-white mt-1">{tile.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            aria-label="Sipariş ara"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sipariş no, müşteri, e-posta..."
            className="w-full bg-slate-950 border border-white/15 focus:border-brand-500 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {(["all", "link_gonderildi", "beklemede", "odendi", "basarisiz", "suresi_doldu", "iptal"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              aria-pressed={filter === status}
              className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap border ${filter === status ? "border-brand-500/60 bg-brand-500/10 text-white" : "border-white/10 text-zinc-400 hover:text-white"}`}
            >
              {status === "all" ? "Tümü" : ORDER_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-32 rounded-2xl bg-slate-900/60 animate-pulse" aria-busy="true" />
      ) : filtered.length === 0 ? (
        <div className="p-10 rounded-2xl bg-slate-950/60 border border-white/10 text-center space-y-2">
          <ShoppingBag className="w-8 h-8 text-zinc-500 mx-auto" />
          <p className="text-sm text-zinc-300">Sipariş yok.</p>
          <p className="text-xs text-zinc-500">
            &ldquo;Yeni sipariş&rdquo; ile ya da Gelen Talepler, onaylı Teklifler ve Ödemeler ekranındaki &ldquo;Ödeme linki&rdquo; düğmeleriyle oluşturun.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => {
            const status = displayStatus(order);
            const total = orderTotals(order.items, order.vatRate).total;
            const payable = ["beklemede", "link_gonderildi", "basarisiz"].includes(status);
            const busy = (label: string) => busyId === `${order.id}:${label}`;
            return (
              <div key={order.id} className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono text-zinc-400">{order.number}</span>
                    <span className="text-sm font-bold text-white">{order.customer.company || order.customer.fullName}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${STATUS_STYLES[status]}`}>{ORDER_STATUS_LABELS[status]}</span>
                  </div>
                  <p className="text-xs text-zinc-300 truncate">{order.title} · {order.customer.email}</p>
                  <p className="text-[11px] font-mono text-zinc-500">
                    Oluşturma {formatDateTime(order.createdAt)}
                    {order.paidAt ? ` · Ödeme ${formatDateTime(order.paidAt)}` : order.linkExpiresAt ? ` · Link son ${formatDateTime(order.linkExpiresAt)}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-mono font-semibold text-white mr-1">{formatTL(total)}</span>
                  {payable && (
                    <>
                      <button
                        onClick={() => action(order, "send", () => api(`/api/admin/orders/${order.id}/send`, { method: "POST" }), `Ödeme linki ${order.customer.email} adresine gönderildi`)}
                        disabled={Boolean(busyId)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500/15 hover:bg-brand-500/25 text-xs text-brand-200 disabled:opacity-50"
                      >
                        {busy("send") ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        {order.status === "link_gonderildi" ? "Tekrar gönder" : "E-postayla gönder"}
                      </button>
                      <button onClick={() => copyLink(order)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200" aria-label="Ödeme linkini kopyala" title="Linki kopyala">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {order.paymentUrl && (
                        <a href={whatsappHref(order)} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200" aria-label="WhatsApp ile gönder" title="WhatsApp ile gönder">
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button onClick={() => setEditing(order)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200" aria-label="Düzenle" title="Düzenle">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  {status === "suresi_doldu" && (
                    <button
                      onClick={() => action(order, "link", () => api(`/api/admin/orders/${order.id}/link`, { method: "POST", body: JSON.stringify({ days: 7 }) }), "Yeni link oluşturuldu (7 gün geçerli)")}
                      disabled={Boolean(busyId)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 text-xs text-amber-200 disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Yeni link
                    </button>
                  )}
                  <button onClick={() => setViewing(order)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200" aria-label="Detay" title="Detay">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {payable && (
                    <>
                      <button
                        onClick={() => {
                          if (confirm("Mevcut link geçersiz olacak ve yeni link oluşturulacak. Devam edilsin mi?")) {
                            action(order, "relink", () => api(`/api/admin/orders/${order.id}/link`, { method: "POST", body: JSON.stringify({ days: 7 }) }), "Yeni link oluşturuldu; eski link artık çalışmaz");
                          }
                        }}
                        className="p-2 rounded-lg text-zinc-500 hover:text-white"
                        aria-label="Linki yenile"
                        title="Linki yenile (eski linki iptal eder)"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`${order.number} iptal edilsin mi? Ödeme linki çalışmaz hale gelir.`)) {
                            action(order, "cancel", () => api(`/api/admin/orders/${order.id}/cancel`, { method: "POST", body: "{}" }), "Sipariş iptal edildi");
                          }
                        }}
                        className="p-2 rounded-lg text-zinc-500 hover:text-red-300"
                        aria-label="İptal et"
                        title="İptal et"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  {status !== "odendi" && (
                    <button
                      onClick={() => {
                        if (confirm(`${order.number} silinsin mi?`)) action(order, "delete", () => api(`/api/admin/orders/${order.id}`, { method: "DELETE" }), "Sipariş silindi");
                      }}
                      className="p-2 rounded-lg text-zinc-500 hover:text-red-300"
                      aria-label="Sil"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {status === "odendi" && <CreditCard className="w-4 h-4 text-emerald-400" aria-label="Kartla ödendi" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <OrderEditor
          order={editing === "new" ? null : editing}
          prefill={editing === "new" ? prefill : null}
          onClose={() => {
            setEditing(null);
            onPrefillUsed();
          }}
          onSaved={async (saved, sendNow) => {
            setEditing(null);
            onPrefillUsed();
            if (sendNow) {
              await action(saved, "send", () => api(`/api/admin/orders/${saved.id}/send`, { method: "POST" }), `Sipariş kaydedildi ve link ${saved.customer.email} adresine gönderildi`);
            } else {
              notify(`${saved.number} kaydedildi`);
              await load();
            }
          }}
        />
      )}
      {viewing && <OrderDetail order={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
