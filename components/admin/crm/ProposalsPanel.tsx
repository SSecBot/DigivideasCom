"use client";

import React, { useMemo, useState } from "react";
import { Check, Copy, Edit2, Eye, FileDown, FileText, Paperclip, Plus, Search, Trash2, X } from "lucide-react";
import { PROPOSAL_STATUS_LABELS, Proposal, ProposalStatus } from "@/lib/crm/types";
import { computeProposalTotals, formatTL, isItemIncluded, itemTotal } from "@/lib/crm/calc";
import { useCrm } from "@/components/admin/crm/CrmProvider";
import { ProposalEditor } from "@/components/admin/crm/ProposalEditor";
import { ProposalAttachments } from "@/components/admin/crm/ProposalAttachments";
import { requestNewOrder } from "@/lib/orders/prefill";
import { ShoppingBag } from "lucide-react";

const printUrl = (proposal: Proposal) => `/dashboard/admin/digivideas/teklif/${encodeURIComponent(proposal.id)}`;
import {
  CrmErrorBanner,
  EmptyState,
  Field,
  GhostButton,
  Modal,
  PanelHeader,
  PrimaryButton,
  formatDate,
  formatDateTime,
  inputClass,
  todayKey,
} from "@/components/admin/crm/crm-ui";

const STATUS_STYLES: Record<ProposalStatus, string> = {
  taslak: "bg-white/5 text-zinc-300",
  gonderildi: "bg-sky-500/15 text-sky-300",
  onaylandi: "bg-emerald-500/15 text-emerald-300",
  reddedildi: "bg-red-500/15 text-red-300",
};

function DecisionDialog({
  proposal,
  decision,
  onClose,
}: {
  proposal: Proposal;
  decision: "approve" | "reject";
  onClose: () => void;
}) {
  const { decide } = useCrm();
  const totals = computeProposalTotals(proposal.items, proposal.discountRate, proposal.vatRate);
  const [note, setNote] = useState("");
  const [createPayment, setCreatePayment] = useState(true);
  const [dueDate, setDueDate] = useState(todayKey());
  const [monthlyFee, setMonthlyFee] = useState("");
  const [endDate, setEndDate] = useState("");
  const [busy, setBusy] = useState(false);
  const approve = decision === "approve";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok = await decide(proposal.id, {
      decision,
      note,
      createPayment: approve && createPayment,
      paymentDueDate: dueDate,
      monthlyFee: approve && monthlyFee !== "" ? Number(monthlyFee) : undefined,
      endDate: approve && endDate ? endDate : undefined,
    });
    setBusy(false);
    if (ok) onClose();
  };

  return (
    <Modal title={approve ? `${proposal.number} · Teklifi Onayla` : `${proposal.number} · Teklifi Reddet`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-zinc-300">
          <span className="text-white font-semibold">{proposal.clientName}</span> · {proposal.title} ·{" "}
          <span className="font-mono">{formatTL(totals.total)}</span>
        </p>
        {approve && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
            {proposal.clientId
              ? "Kayıtlı müşteri aktif yapılacak ve teklifteki hizmetler müşteriye eklenecek."
              : "Müşteri, Müşteri Takibi listesine teklifteki bilgilerle otomatik eklenecek."}
          </div>
        )}
        {approve && (
          <div className="space-y-3 p-4 rounded-xl bg-slate-950/70 border border-white/10">
            <label className="flex items-center gap-2 text-sm text-zinc-200 cursor-pointer">
              <input type="checkbox" checked={createPayment} onChange={(e) => setCreatePayment(e.target.checked)} className="accent-orange-500" />
              Ödemeler sayfasına tahsilat kaydı oluştur
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Aylık sabit ücret (TL, opsiyonel)" htmlFor="decision-fee">
                <input
                  id="decision-fee"
                  type="number"
                  min={0}
                  step="0.01"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(e.target.value)}
                  placeholder={`Boşsa tek seferlik ${formatTL(totals.total)}`}
                  className={inputClass}
                />
              </Field>
              <Field label="İlk ödeme vadesi" htmlFor="decision-due">
                <input id="decision-due" type="date" value={dueDate} disabled={!createPayment} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
              </Field>
            </div>
            <Field label="Sözleşme bitiş tarihi (opsiyonel)" htmlFor="decision-end">
              <input id="decision-end" type="date" min={todayKey()} value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
            </Field>
            <p className="text-[11px] text-zinc-500">
              Aylık ücret girerseniz ödeme her ay tekrarlanır: ödendi işaretlediğinizde bir sonraki ayın ödemesi otomatik oluşur.
            </p>
          </div>
        )}
        <Field label={approve ? "Not (opsiyonel)" : "Ret nedeni (opsiyonel)"} htmlFor="decision-note">
          <textarea id="decision-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
        </Field>
        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
          <GhostButton type="button" onClick={onClose}>
            Vazgeç
          </GhostButton>
          {approve ? (
            <PrimaryButton type="submit" disabled={busy}>
              <Check className="w-4 h-4" /> Onayla ve müşteriye ekle
            </PrimaryButton>
          ) : (
            <button type="submit" disabled={busy} className="inline-flex items-center gap-2 bg-red-500/80 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl">
              <X className="w-4 h-4" /> Reddet
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}

function ProposalView({ proposal, onClose }: { proposal: Proposal; onClose: () => void }) {
  const { proposals } = useCrm();
  // Read attachments from live state so uploads/removals here show up immediately
  const liveAttachments = proposals.find((p) => p.id === proposal.id)?.attachments ?? [];
  const totals = computeProposalTotals(proposal.items, proposal.discountRate, proposal.vatRate);
  const [copied, setCopied] = useState(false);
  const summary = [
    `${proposal.number} – ${proposal.title}`,
    `Sayın ${proposal.contactName || proposal.clientName},`,
    "",
    ...proposal.items.map(
      (item) =>
        `${isItemIncluded(item) ? "•" : "○ (opsiyonel)"} ${item.service}${item.description ? ` – ${item.description}` : ""}: ${item.quantity} × ${formatTL(item.unitPrice)} = ${formatTL(itemTotal(item))}`
    ),
    "",
    `Ara toplam: ${formatTL(totals.subtotal)}`,
    ...(totals.discount > 0 ? [`İndirim (%${proposal.discountRate}): −${formatTL(totals.discount)}`] : []),
    `KDV (%${proposal.vatRate}): ${formatTL(totals.vat)}`,
    `Genel toplam: ${formatTL(totals.total)}`,
    ...(proposal.validUntil ? [`Geçerlilik: ${formatDate(proposal.validUntil)}`] : []),
    ...(proposal.notes ? ["", proposal.notes] : []),
    "",
    "digivideas – Dijital Reklam Ajansı",
  ].join("\n");

  return (
    <Modal title={`${proposal.number} · ${proposal.title}`} onClose={onClose} wide>
      <div className="space-y-4 text-sm">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] font-mono text-zinc-400">
          <span>Durum: <span className="text-zinc-200">{PROPOSAL_STATUS_LABELS[proposal.status]}</span></span>
          <span>Eklenme: <span className="text-zinc-200">{formatDateTime(proposal.createdAt)}</span></span>
          <span>Son düzenleme: <span className="text-zinc-200">{formatDateTime(proposal.updatedAt)}</span></span>
          {proposal.decidedAt && <span>Karar: <span className="text-zinc-200">{formatDateTime(proposal.decidedAt)}</span></span>}
        </div>
        <pre className="whitespace-pre-wrap font-sans text-zinc-200 p-4 rounded-xl bg-slate-950/70 border border-white/10 text-xs leading-relaxed">{summary}</pre>
        {proposal.decisionNote && <p className="text-xs text-zinc-400">Karar notu: {proposal.decisionNote}</p>}
        <ProposalAttachments proposalId={proposal.id} attachments={liveAttachments} />
        <div className="flex flex-wrap justify-end gap-2">
          <a
            href={printUrl(proposal)}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-100"
          >
            <FileDown className="w-4 h-4" /> PDF olarak indir
          </a>
          <PrimaryButton
            onClick={async () => {
              await navigator.clipboard.writeText(summary).catch(() => undefined);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            <Copy className="w-4 h-4" /> {copied ? "Kopyalandı" : "Metni kopyala (WhatsApp / e-posta)"}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

export function ProposalsPanel() {
  const { proposals, remove, loaded } = useCrm();
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Proposal | null | "new">(null);
  const [viewing, setViewing] = useState<Proposal | null>(null);
  const [deciding, setDeciding] = useState<{ proposal: Proposal; decision: "approve" | "reject" } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return proposals
      .filter((p) => statusFilter === "all" || p.status === statusFilter)
      .filter((p) => !q || `${p.number} ${p.title} ${p.clientName}`.toLocaleLowerCase("tr").includes(q))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [proposals, statusFilter, query]);

  const approvedTotal = proposals
    .filter((p) => p.status === "onaylandi")
    .reduce((sum, p) => sum + computeProposalTotals(p.items, p.discountRate, p.vatRate).total, 0);
  const openCount = proposals.filter((p) => p.status === "taslak" || p.status === "gonderildi").length;
  const decided = proposals.filter((p) => p.status === "onaylandi" || p.status === "reddedildi").length;
  const winRate = decided ? Math.round((proposals.filter((p) => p.status === "onaylandi").length / decided) * 100) : 0;

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Teklifler"
        subtitle="Müşterilere verilen teklifler: seçenekli hizmetler, fiyatlar, düzenleme geçmişi ve onay durumu."
        action={
          <PrimaryButton onClick={() => setEditing("new")} className="self-start">
            <Plus className="w-4 h-4" /> Yeni Teklif
          </PrimaryButton>
        }
      />
      <CrmErrorBanner />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Açık teklif", value: String(openCount) },
          { label: "Onaylanan", value: String(proposals.filter((p) => p.status === "onaylandi").length) },
          { label: "Kazanma oranı", value: `%${winRate}` },
          { label: "Onaylanan toplam", value: formatTL(approvedTotal) },
        ].map((tile) => (
          <div key={tile.label} className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
            <p className="text-[11px] font-mono text-zinc-400">{tile.label}</p>
            <p className="text-xl sm:text-2xl font-semibold text-white mt-1">{tile.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input aria-label="Teklif ara" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Teklif no, başlık veya müşteri ara..." className={`${inputClass} pl-9`} />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {(["all", "taslak", "gonderildi", "onaylandi", "reddedildi"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              aria-pressed={statusFilter === status}
              className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap border ${statusFilter === status ? "border-brand-500/60 bg-brand-500/10 text-white" : "border-white/10 text-zinc-400 hover:text-white"}`}
            >
              {status === "all" ? "Tümü" : PROPOSAL_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {!loaded ? (
        <div className="h-32 rounded-2xl bg-slate-900/60 animate-pulse" aria-busy="true" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="Teklif bulunamadı." hint="“Yeni Teklif” ile hizmet kalemlerini ve fiyatları girerek başlayın." />
      ) : (
        <div className="space-y-3">
          {filtered.map((proposal) => {
            const totals = computeProposalTotals(proposal.items, proposal.discountRate, proposal.vatRate);
            const open = proposal.status === "taslak" || proposal.status === "gonderildi";
            const optionalCount = proposal.items.filter((item) => item.optional).length;
            return (
              <div key={proposal.id} className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono text-zinc-400">{proposal.number}</span>
                    <span className="text-sm font-bold text-white">{proposal.clientName}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${STATUS_STYLES[proposal.status]}`}>
                      {PROPOSAL_STATUS_LABELS[proposal.status]}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 truncate">
                    {proposal.title} · {proposal.items.length} kalem{optionalCount ? ` (${optionalCount} seçenekli)` : ""}
                    {proposal.attachments?.length ? (
                      <span className="inline-flex items-center gap-0.5 ml-1.5 text-zinc-400">
                        <Paperclip className="w-3 h-3" /> {proposal.attachments.length} PDF
                      </span>
                    ) : null}
                  </p>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                    Eklenme {formatDateTime(proposal.createdAt)} · Düzenleme {formatDateTime(proposal.updatedAt)}
                    {proposal.validUntil ? ` · Geçerlilik ${formatDate(proposal.validUntil)}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-mono font-semibold text-white mr-1">{formatTL(totals.total)}</span>
                  <GhostButton onClick={() => setViewing(proposal)} aria-label={`${proposal.number} görüntüle`}>
                    <Eye className="w-3.5 h-3.5" /> Gör
                  </GhostButton>
                  <a
                    href={printUrl(proposal)}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-200"
                    aria-label={`${proposal.number} PDF olarak indir`}
                  >
                    <FileDown className="w-3.5 h-3.5" /> PDF
                  </a>
                  {proposal.status === "onaylandi" && (
                    <button
                      onClick={() =>
                        requestNewOrder({
                          title: `${proposal.number} – ${proposal.title}`,
                          customer: { fullName: proposal.contactName || proposal.clientName, email: proposal.email, phone: proposal.phone, company: proposal.clientName },
                          // The proposal discount is applied to each unit price; VAT stays the same
                          items: proposal.items
                            .filter((item) => !item.optional || item.selected)
                            .map((item) => ({
                              name: item.service,
                              description: item.description,
                              quantity: item.quantity,
                              unitPrice: Math.round(item.unitPrice * (1 - proposal.discountRate / 100) * 100) / 100,
                            })),
                          vatRate: proposal.vatRate,
                          clientId: proposal.clientId,
                          source: { type: "teklif", id: proposal.id, label: `Teklif ${proposal.number}` },
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500/15 hover:bg-brand-500/25 text-xs text-brand-200"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Ödeme linki
                    </button>
                  )}
                  {open && (
                    <>
                      <GhostButton onClick={() => setEditing(proposal)}>
                        <Edit2 className="w-3.5 h-3.5" /> Düzenle
                      </GhostButton>
                      <button
                        onClick={() => setDeciding({ proposal, decision: "approve" })}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-xs text-emerald-300"
                      >
                        <Check className="w-3.5 h-3.5" /> Onayla
                      </button>
                      <button
                        onClick={() => setDeciding({ proposal, decision: "reject" })}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs text-red-300"
                      >
                        <X className="w-3.5 h-3.5" /> Reddet
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`${proposal.number} silinsin mi?`)) remove("proposals", proposal.id);
                    }}
                    className="p-2 rounded-lg text-zinc-500 hover:text-red-300"
                    aria-label={`${proposal.number} sil`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && <ProposalEditor proposal={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      {viewing && <ProposalView proposal={viewing} onClose={() => setViewing(null)} />}
      {deciding && <DecisionDialog proposal={deciding.proposal} decision={deciding.decision} onClose={() => setDeciding(null)} />}
    </div>
  );
}
