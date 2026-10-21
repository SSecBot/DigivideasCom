"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, Edit2, Plus, Repeat, RotateCcw, Trash2, Wallet } from "lucide-react";
import { PAYMENT_METHOD_LABELS, Payment, PaymentMethod, PaymentState } from "@/lib/crm/types";
import { formatTL, paymentState, summarizePayments } from "@/lib/crm/calc";
import { useCrm } from "@/components/admin/crm/CrmProvider";
import { requestNewOrder } from "@/lib/orders/prefill";
import { ShoppingBag } from "lucide-react";
import {
  CrmErrorBanner,
  EmptyState,
  Field,
  GhostButton,
  Modal,
  PanelHeader,
  PrimaryButton,
  formatDate,
  inputClass,
  todayKey,
} from "@/components/admin/crm/crm-ui";

type Draft = Partial<Payment>;

const STATE_LABELS: Record<PaymentState, string> = { odendi: "Ödendi", bekliyor: "Bekliyor", gecikti: "Gecikti" };
const STATE_STYLES: Record<PaymentState, string> = {
  odendi: "bg-emerald-500/15 text-emerald-300",
  bekliyor: "bg-amber-400/15 text-amber-300",
  gecikti: "bg-red-500/15 text-red-300",
};

function monthLabel(prefix: string): string {
  const [y, m] = prefix.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}

export function PaymentsPanel() {
  const { payments, clients, create, update, remove, loaded } = useCrm();
  const today = todayKey();
  const [month, setMonth] = useState(today.slice(0, 7));
  const [stateFilter, setStateFilter] = useState<PaymentState | "all">("all");
  const [editing, setEditing] = useState<Draft | null>(null);

  const summary = summarizePayments(payments, today, month);

  const filtered = useMemo(
    () =>
      payments
        .filter((p) => stateFilter === "all" || paymentState(p, today) === stateFilter)
        // overdue items always show; others are scoped to the selected month
        .filter((p) => paymentState(p, today) === "gecikti" || p.dueDate.startsWith(month) || p.paidDate?.startsWith(month))
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [payments, stateFilter, month, today]
  );

  const shiftMonth = (delta: number) => {
    const [y, m] = month.split("-").map(Number);
    const date = new Date(y, m - 1 + delta, 1);
    setMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  };

  const markPaid = (payment: Payment, paid: boolean) =>
    update("payments", payment.id, {
      ...payment,
      paidDate: paid ? today : undefined,
      method: paid ? payment.method || "havale" : undefined,
    });

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const ok = editing.id ? await update("payments", editing.id, editing) : Boolean(await create("payments", editing));
    if (ok) setEditing(null);
  };

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Ödemeler"
        subtitle="Tahsilat takibi: vadesi gelen, geciken ve tahsil edilen ödemeler. Aylık ödemeler kendini yeniler."
        action={
          <PrimaryButton
            onClick={() => setEditing({ clientName: "", description: "", amount: 0, dueDate: today, recurring: false, notes: "" })}
            className="self-start"
          >
            <Plus className="w-4 h-4" /> Yeni Ödeme
          </PrimaryButton>
        }
      />
      <CrmErrorBanner />

      <div className="flex items-center gap-2">
        <GhostButton onClick={() => shiftMonth(-1)} aria-label="Önceki ay">‹</GhostButton>
        <span className="text-sm font-semibold text-white capitalize min-w-[140px] text-center">{monthLabel(month)}</span>
        <GhostButton onClick={() => shiftMonth(1)} aria-label="Sonraki ay">›</GhostButton>
        {month !== today.slice(0, 7) && (
          <button onClick={() => setMonth(today.slice(0, 7))} className="text-xs text-brand-400 hover:underline ml-1">
            Bu ay
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
          <p className="text-[11px] font-mono text-zinc-400">Tahsil edilen ({monthLabel(month)})</p>
          <p className="text-2xl font-semibold text-emerald-300 mt-1">{formatTL(summary.collected)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
          <p className="text-[11px] font-mono text-zinc-400">Bekleyen (tüm vadeler)</p>
          <p className="text-2xl font-semibold text-amber-300 mt-1">{formatTL(summary.pending)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
          <p className="text-[11px] font-mono text-zinc-400">Gecikmiş ({summary.overdueCount} ödeme)</p>
          <p className="text-2xl font-semibold text-red-300 mt-1">{formatTL(summary.overdue)}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        {(["all", "gecikti", "bekliyor", "odendi"] as const).map((state) => (
          <button
            key={state}
            onClick={() => setStateFilter(state)}
            aria-pressed={stateFilter === state}
            className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap border ${stateFilter === state ? "border-brand-500/60 bg-brand-500/10 text-white" : "border-white/10 text-zinc-400 hover:text-white"}`}
          >
            {state === "all" ? "Tümü" : STATE_LABELS[state]}
          </button>
        ))}
      </div>

      {!loaded ? (
        <div className="h-32 rounded-2xl bg-slate-900/60 animate-pulse" aria-busy="true" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Wallet} title="Bu ay için ödeme kaydı yok." hint="Onaylanan tekliflerden otomatik ya da “Yeni Ödeme” ile elle ekleyebilirsiniz." />
      ) : (
        <div className="space-y-2">
          {filtered.map((payment) => {
            const state = paymentState(payment, today);
            return (
              <div key={payment.id} className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white">{payment.clientName}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${STATE_STYLES[state]}`}>{STATE_LABELS[state]}</span>
                    {payment.recurring && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-zinc-300">
                        <Repeat className="w-3 h-3" /> aylık
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 truncate">{payment.description}</p>
                  <p className="text-[11px] font-mono text-zinc-500">
                    Vade {formatDate(payment.dueDate)}
                    {payment.paidDate ? ` · Ödendi ${formatDate(payment.paidDate)}${payment.method ? ` (${PAYMENT_METHOD_LABELS[payment.method]})` : ""}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-mono font-semibold text-white mr-1">{formatTL(payment.amount)}</span>
                  {state === "odendi" ? (
                    <GhostButton onClick={() => markPaid(payment, false)}>
                      <RotateCcw className="w-3.5 h-3.5" /> Geri al
                    </GhostButton>
                  ) : (
                    <button
                      onClick={() => markPaid(payment, true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-xs text-emerald-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ödendi
                    </button>
                  )}
                  {state !== "odendi" && (
                    <button
                      onClick={() => {
                        const client = clients.find((c) => c.id === payment.clientId);
                        requestNewOrder({
                          title: payment.description,
                          customer: { fullName: client?.contactName || payment.clientName, email: client?.email ?? "", phone: client?.phone ?? "", company: client?.name },
                          // The CRM amount is what the customer pays, so it is charged as-is (KDV %0 on top)
                          items: [{ name: payment.description, description: "", quantity: 1, unitPrice: payment.amount }],
                          vatRate: 0,
                          clientId: payment.clientId,
                          crmPaymentId: payment.id,
                          source: { type: "odeme", id: payment.id, label: `Ödeme kaydı: ${payment.clientName}` },
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500/15 hover:bg-brand-500/25 text-xs text-brand-200"
                      title="iyzico ile online ödeme linki oluştur"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Ödeme linki
                    </button>
                  )}
                  <GhostButton onClick={() => setEditing({ ...payment })} aria-label="Ödemeyi düzenle">
                    <Edit2 className="w-3.5 h-3.5" />
                  </GhostButton>
                  <button
                    onClick={() => {
                      if (confirm("Bu ödeme kaydı silinsin mi?")) remove("payments", payment.id);
                    }}
                    className="p-2 rounded-lg text-zinc-500 hover:text-red-300"
                    aria-label="Ödemeyi sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? "Ödemeyi Düzenle" : "Yeni Ödeme"} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Kayıtlı müşteri" htmlFor="pay-client">
                <select
                  id="pay-client"
                  value={editing.clientId ?? ""}
                  onChange={(e) => {
                    const client = clients.find((c) => c.id === e.target.value);
                    setEditing({ ...editing, clientId: client?.id, clientName: client ? client.name : editing.clientName });
                  }}
                  className={inputClass}
                >
                  <option value="">— Seçin veya aşağıya yazın —</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Müşteri adı *" htmlFor="pay-client-name">
                <input id="pay-client-name" required value={editing.clientName ?? ""} onChange={(e) => setEditing({ ...editing, clientName: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Açıklama *" htmlFor="pay-desc" className="sm:col-span-2">
                <input id="pay-desc" required value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="örn. Ekim ayı sosyal medya yönetimi" className={inputClass} />
              </Field>
              <Field label="Tutar (TL) *" htmlFor="pay-amount">
                <input id="pay-amount" required type="number" min={0.01} step="0.01" value={editing.amount ?? ""} onChange={(e) => setEditing({ ...editing, amount: Number(e.target.value) })} className={inputClass} />
              </Field>
              <Field label="Vade tarihi *" htmlFor="pay-due">
                <input id="pay-due" required type="date" value={editing.dueDate ?? ""} onChange={(e) => setEditing({ ...editing, dueDate: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Ödeme tarihi (ödendiyse)" htmlFor="pay-paid">
                <input id="pay-paid" type="date" value={editing.paidDate ?? ""} onChange={(e) => setEditing({ ...editing, paidDate: e.target.value || undefined })} className={inputClass} />
              </Field>
              <Field label="Ödeme yöntemi" htmlFor="pay-method">
                <select
                  id="pay-method"
                  value={editing.method ?? "havale"}
                  disabled={!editing.paidDate}
                  onChange={(e) => setEditing({ ...editing, method: e.target.value as PaymentMethod })}
                  className={inputClass}
                >
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-200 cursor-pointer">
              <input type="checkbox" checked={editing.recurring ?? false} onChange={(e) => setEditing({ ...editing, recurring: e.target.checked })} className="accent-orange-500" />
              Her ay tekrarla (ödendi işaretlenince bir sonraki ayın ödemesi oluşur)
            </label>
            <Field label="Notlar" htmlFor="pay-notes">
              <textarea id="pay-notes" rows={2} value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className={inputClass} />
            </Field>
            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <GhostButton type="button" onClick={() => setEditing(null)}>
                Vazgeç
              </GhostButton>
              <PrimaryButton type="submit">Kaydet</PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
