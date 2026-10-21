"use client";

import React, { useMemo, useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { OrderView } from "@/lib/orders/types";
import { orderTotals } from "@/lib/orders/calc";
import { OrderPrefill } from "@/lib/orders/prefill";

const inputClass =
  "w-full bg-slate-950 border border-white/15 focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none";
const formatTL = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value || 0);

interface ItemDraft {
  key: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

let keyCounter = 0;
const nextKey = () => `k${Date.now().toString(36)}${(keyCounter += 1)}`;

interface Props {
  order: OrderView | null; // null = new order
  prefill?: OrderPrefill | null;
  onClose: () => void;
  onSaved: (order: OrderView, sendNow: boolean) => void;
}

export function OrderEditor({ order, prefill, onClose, onSaved }: Props) {
  const base: OrderPrefill = order ?? prefill ?? {};
  const [title, setTitle] = useState(base.title ?? "");
  const [customer, setCustomer] = useState({
    fullName: base.customer?.fullName ?? "",
    email: base.customer?.email ?? "",
    phone: base.customer?.phone ?? "",
    company: base.customer?.company ?? "",
  });
  const [items, setItems] = useState<ItemDraft[]>(
    (base.items?.length ? base.items : [{ name: "", description: "", quantity: 1, unitPrice: 0 }]).map((item) => ({ ...item, key: nextKey() }))
  );
  const [vatRate, setVatRate] = useState(base.vatRate ?? 20);
  const [note, setNote] = useState(base.note ?? "");
  const [internalNote, setInternalNote] = useState(order?.internalNote ?? "");
  const [linkValidDays, setLinkValidDays] = useState(7);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const totals = useMemo(() => orderTotals(items, vatRate), [items, vatRate]);

  const setItem = (key: string, patch: Partial<ItemDraft>) => setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  const save = async (sendNow: boolean) => {
    setBusy(true);
    setError("");
    try {
      const payload = {
        title,
        customer,
        items: items.map(({ key, ...item }) => ({ ...item, id: key })),
        vatRate,
        note,
        internalNote,
        linkValidDays,
        source: order?.source ?? prefill?.source ?? { type: "manuel" },
        clientId: order?.clientId ?? prefill?.clientId,
        crmPaymentId: order?.crmPaymentId ?? prefill?.crmPaymentId,
      };
      const response = await fetch(order ? `/api/admin/orders/${encodeURIComponent(order.id)}` : "/api/admin/orders", {
        method: order ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as OrderView & { error?: string };
      if (!response.ok) throw new Error(body.error || "Sipariş kaydedilemedi");
      onSaved(body, sendNow);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true" aria-label="Sipariş">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save(false);
        }}
        className="bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-7 w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-lg font-bold text-white">{order ? `${order.number} · Siparişi düzenle` : "Yeni sipariş / ödeme linki"}</h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white" aria-label="Kapat">
            <X className="w-5 h-5" />
          </button>
        </div>

        {prefill?.source?.label && !order && <p className="text-xs text-brand-300">Kaynak: {prefill.source.label}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="order-title" className="block text-[11px] font-mono text-zinc-400">Sipariş başlığı (müşteri görür)</label>
            <input id="order-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn. Ekim 2026 sosyal medya yönetimi" className={inputClass} />
          </div>
          <div className="space-y-1">
            <label htmlFor="order-name" className="block text-[11px] font-mono text-zinc-400">Müşteri adı soyadı *</label>
            <input id="order-name" required value={customer.fullName} onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label htmlFor="order-company" className="block text-[11px] font-mono text-zinc-400">Firma</label>
            <input id="order-company" value={customer.company} onChange={(e) => setCustomer({ ...customer, company: e.target.value })} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label htmlFor="order-email" className="block text-[11px] font-mono text-zinc-400">E-posta (link buraya gider) *</label>
            <input id="order-email" type="email" required value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label htmlFor="order-phone" className="block text-[11px] font-mono text-zinc-400">Cep telefonu *</label>
            <input id="order-phone" type="tel" required value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">Kalemler (KDV hariç fiyat)</h4>
          {items.map((item, index) => (
            <div key={item.key} className="p-3 rounded-xl bg-slate-950/70 border border-white/10 grid grid-cols-2 sm:grid-cols-12 gap-2 items-end">
              <div className="col-span-2 sm:col-span-5 space-y-1">
                <label htmlFor={`oi-name-${item.key}`} className="block text-[11px] font-mono text-zinc-400">{index + 1}. Hizmet *</label>
                <input id={`oi-name-${item.key}`} required value={item.name} onChange={(e) => setItem(item.key, { name: e.target.value })} className={inputClass} />
              </div>
              <div className="col-span-2 sm:col-span-3 space-y-1">
                <label htmlFor={`oi-desc-${item.key}`} className="block text-[11px] font-mono text-zinc-400">Açıklama</label>
                <input id={`oi-desc-${item.key}`} value={item.description} onChange={(e) => setItem(item.key, { description: e.target.value })} className={inputClass} />
              </div>
              <div className="sm:col-span-1 space-y-1">
                <label htmlFor={`oi-qty-${item.key}`} className="block text-[11px] font-mono text-zinc-400">Adet</label>
                <input id={`oi-qty-${item.key}`} type="number" min={1} value={item.quantity} onChange={(e) => setItem(item.key, { quantity: Number(e.target.value) })} className={inputClass} />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label htmlFor={`oi-price-${item.key}`} className="block text-[11px] font-mono text-zinc-400">Birim fiyat</label>
                <input id={`oi-price-${item.key}`} type="number" min={0} step="0.01" value={item.unitPrice} onChange={(e) => setItem(item.key, { unitPrice: Number(e.target.value) })} className={inputClass} />
              </div>
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((entry) => entry.key !== item.key))}
                disabled={items.length === 1}
                className="sm:col-span-1 p-2.5 rounded-xl text-zinc-500 hover:text-red-300 disabled:opacity-30 justify-self-end"
                aria-label={`${index + 1}. kalemi sil`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setItems((prev) => [...prev, { key: nextKey(), name: "", description: "", quantity: 1, unitPrice: 0 }])}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-200"
          >
            <Plus className="w-3.5 h-3.5" /> Kalem ekle
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="order-vat" className="block text-[11px] font-mono text-zinc-400">KDV (%)</label>
                <input id="order-vat" type="number" min={0} max={100} value={vatRate} onChange={(e) => setVatRate(Number(e.target.value))} className={inputClass} />
              </div>
              {!order && (
                <div className="space-y-1">
                  <label htmlFor="order-days" className="block text-[11px] font-mono text-zinc-400">Link geçerliliği (gün)</label>
                  <input id="order-days" type="number" min={1} max={60} value={linkValidDays} onChange={(e) => setLinkValidDays(Number(e.target.value))} className={inputClass} />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label htmlFor="order-note" className="block text-[11px] font-mono text-zinc-400">Müşteriye not (ödeme sayfasında ve e-postada görünür)</label>
              <textarea id="order-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label htmlFor="order-internal" className="block text-[11px] font-mono text-zinc-400">İç not (yalnızca panelde)</label>
              <textarea id="order-internal" rows={2} value={internalNote} onChange={(e) => setInternalNote(e.target.value)} className={inputClass} />
            </div>
          </div>
          <dl className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2 text-sm self-start">
            <div className="flex justify-between text-zinc-300"><dt>Ara toplam</dt><dd className="font-mono">{formatTL(totals.subtotal)}</dd></div>
            <div className="flex justify-between text-zinc-300"><dt>KDV (%{vatRate})</dt><dd className="font-mono">{formatTL(totals.vat)}</dd></div>
            <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-white/10"><dt>Müşterinin ödeyeceği</dt><dd className="font-mono">{formatTL(totals.total)}</dd></div>
          </dl>
        </div>

        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}

        <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-white/10">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs text-zinc-300 hover:bg-white/5">Vazgeç</button>
          <button type="submit" disabled={busy} className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-100 disabled:opacity-50">
            Kaydet
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={(e) => {
              const form = (e.currentTarget as HTMLButtonElement).form;
              if (form && !form.reportValidity()) return;
              save(true);
            }}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Kaydet ve linki e-postayla gönder
          </button>
        </div>
      </form>
    </div>
  );
}
