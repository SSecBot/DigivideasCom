"use client";

import React, { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Proposal, ProposalItem } from "@/lib/crm/types";
import { computeProposalTotals, formatTL, isItemIncluded, itemTotal } from "@/lib/crm/calc";
import { useCrm } from "@/components/admin/crm/CrmProvider";
import { Field, GhostButton, Modal, PrimaryButton, formatDateTime, inputClass } from "@/components/admin/crm/crm-ui";
import { ProposalAttachments } from "@/components/admin/crm/ProposalAttachments";

export const SERVICE_SUGGESTIONS = [
  "Sosyal Medya Yönetimi",
  "Meta (Instagram/Facebook) Reklam Yönetimi",
  "Google Ads Yönetimi",
  "Reels / Video Prodüksiyon",
  "Fotoğraf Çekimi",
  "Web Sitesi Tasarımı",
  "SEO & İçerik",
  "Logo & Kurumsal Kimlik",
  "Google İşletme Profili Optimizasyonu",
  "Reklam Bütçesi (Meta/Google'a ödenecek)",
];

const HISTORY_LABELS: Record<Proposal["history"][number]["action"], string> = {
  olusturuldu: "Oluşturuldu",
  duzenlendi: "Düzenlendi",
  gonderildi: "Gönderildi olarak işaretlendi",
  onaylandi: "Onaylandı",
  reddedildi: "Reddedildi",
  dosya_eklendi: "PDF eklendi",
  dosya_silindi: "PDF silindi",
};

let itemCounter = 0;
function newItem(partial: Partial<ProposalItem> = {}): ProposalItem {
  itemCounter += 1;
  return {
    id: `item-${Date.now().toString(36)}-${itemCounter}`,
    service: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    optional: false,
    selected: true,
    ...partial,
  };
}

type Draft = Omit<Proposal, "id" | "number" | "status" | "createdAt" | "updatedAt" | "history" | "decidedAt" | "decisionNote" | "deletedAt" | "attachments"> &
  Partial<Pick<Proposal, "id" | "number" | "status" | "createdAt" | "updatedAt" | "history">>;

function emptyDraft(): Draft {
  const valid = new Date();
  valid.setDate(valid.getDate() + 15);
  return {
    title: "Dijital Pazarlama Teklifi",
    clientId: undefined,
    clientName: "",
    contactName: "",
    phone: "",
    email: "",
    items: [newItem({ service: "Sosyal Medya Yönetimi" })],
    discountRate: 0,
    vatRate: 20,
    validUntil: valid.toISOString().slice(0, 10),
    notes: "",
  };
}

export function ProposalEditor({ proposal, onClose }: { proposal: Proposal | null; onClose: () => void }) {
  const { clients, proposals, create, update, uploadProposalFiles } = useCrm();
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [draft, setDraft] = useState<Draft>(() => (proposal ? JSON.parse(JSON.stringify(proposal)) : emptyDraft()));
  const [saving, setSaving] = useState(false);
  const totals = useMemo(() => computeProposalTotals(draft.items, draft.discountRate, draft.vatRate), [draft]);

  const setItem = (id: string, patch: Partial<ProposalItem>) =>
    setDraft((prev) => ({ ...prev, items: prev.items.map((item) => (item.id === id ? { ...item, ...patch } : item)) }));

  const pickClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    setDraft((prev) =>
      client
        ? { ...prev, clientId: client.id, clientName: client.name, contactName: client.contactName, phone: client.phone, email: client.email }
        : { ...prev, clientId: undefined }
    );
  };

  const save = async (sent: boolean) => {
    setSaving(true);
    const payload = { ...draft, sent };
    let ok: boolean;
    if (draft.id) {
      ok = await update("proposals", draft.id, payload);
    } else {
      const created = await create("proposals", payload);
      ok = Boolean(created);
      // PDFs chosen before the proposal existed are uploaded right after it is created
      if (created && pendingFiles.length > 0) ok = await uploadProposalFiles(created.id, pendingFiles);
    }
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Modal title={draft.id ? `${draft.number} · Teklifi Düzenle` : "Yeni Teklif"} onClose={onClose} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save(false);
        }}
        className="space-y-5"
      >
        {draft.id && (
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] font-mono text-zinc-400">
            <span>Eklenme: <span className="text-zinc-200">{formatDateTime(draft.createdAt)}</span></span>
            <span>Son düzenleme: <span className="text-zinc-200">{formatDateTime(draft.updatedAt)}</span></span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Teklif başlığı *" htmlFor="prop-title" className="sm:col-span-2">
            <input id="prop-title" required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Kayıtlı müşteri" htmlFor="prop-client">
            <select id="prop-client" value={draft.clientId ?? ""} onChange={(e) => pickClient(e.target.value)} className={inputClass}>
              <option value="">— Yeni müşteri / aday —</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Firma / müşteri adı *" htmlFor="prop-client-name">
            <input id="prop-client-name" required value={draft.clientName} onChange={(e) => setDraft({ ...draft, clientName: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Yetkili kişi" htmlFor="prop-contact">
            <input id="prop-contact" value={draft.contactName} onChange={(e) => setDraft({ ...draft, contactName: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Telefon" htmlFor="prop-phone">
            <input id="prop-phone" type="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className={inputClass} />
          </Field>
          <Field label="E-posta" htmlFor="prop-email">
            <input id="prop-email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Geçerlilik tarihi" htmlFor="prop-valid">
            <input id="prop-valid" type="date" value={draft.validUntil ?? ""} onChange={(e) => setDraft({ ...draft, validUntil: e.target.value || undefined })} className={inputClass} />
          </Field>
        </div>

        {/* Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">Hizmet kalemleri</h4>
            <p className="text-[11px] text-zinc-500">&ldquo;Seçenekli&rdquo; kalemler müşteriye opsiyon olarak sunulur; işaretliyse toplama dahil edilir.</p>
          </div>
          <datalist id="service-suggestions">
            {SERVICE_SUGGESTIONS.map((service) => (
              <option key={service} value={service} />
            ))}
          </datalist>
          <div className="space-y-2">
            {draft.items.map((item, index) => {
              const included = isItemIncluded(item);
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border grid grid-cols-2 md:grid-cols-12 gap-2 items-end ${included ? "bg-slate-950/70 border-white/10" : "bg-slate-950/30 border-dashed border-white/10 opacity-70"}`}
                >
                  <Field label={`${index + 1}. Hizmet *`} htmlFor={`item-service-${item.id}`} className="col-span-2 md:col-span-4">
                    <input
                      id={`item-service-${item.id}`}
                      required
                      list="service-suggestions"
                      value={item.service}
                      onChange={(e) => setItem(item.id, { service: e.target.value })}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Açıklama" htmlFor={`item-desc-${item.id}`} className="col-span-2 md:col-span-4">
                    <input
                      id={`item-desc-${item.id}`}
                      value={item.description}
                      onChange={(e) => setItem(item.id, { description: e.target.value })}
                      placeholder="örn. Ayda 12 gönderi + 4 Reels"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Adet" htmlFor={`item-qty-${item.id}`} className="md:col-span-1">
                    <input
                      id={`item-qty-${item.id}`}
                      type="number"
                      min={0}
                      step="1"
                      value={item.quantity}
                      onChange={(e) => setItem(item.id, { quantity: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Birim fiyat (TL)" htmlFor={`item-price-${item.id}`} className="md:col-span-2">
                    <input
                      id={`item-price-${item.id}`}
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => setItem(item.id, { unitPrice: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </Field>
                  <div className="col-span-2 md:col-span-1 flex md:flex-col items-center md:items-end justify-between gap-1 pb-1">
                    <span className="text-xs font-mono text-white whitespace-nowrap">{formatTL(itemTotal(item))}</span>
                    <button
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, items: prev.items.filter((entry) => entry.id !== item.id) }))}
                      disabled={draft.items.length === 1}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-300 disabled:opacity-30"
                      aria-label={`${index + 1}. kalemi sil`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="col-span-2 md:col-span-12 flex flex-wrap items-center gap-4 text-xs text-zinc-300">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.optional}
                        onChange={(e) => setItem(item.id, { optional: e.target.checked, selected: e.target.checked ? item.selected : true })}
                        className="accent-orange-500"
                      />
                      Seçenekli (opsiyonel) kalem
                    </label>
                    {item.optional && (
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={item.selected} onChange={(e) => setItem(item.id, { selected: e.target.checked })} className="accent-orange-500" />
                        Müşteri bu seçeneği aldı (toplama dahil)
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            <GhostButton type="button" onClick={() => setDraft((prev) => ({ ...prev, items: [...prev.items, newItem()] }))}>
              <Plus className="w-3.5 h-3.5" /> Kalem ekle
            </GhostButton>
            <GhostButton
              type="button"
              onClick={() => setDraft((prev) => ({ ...prev, items: [...prev.items, newItem({ optional: true, selected: false })] }))}
            >
              <Plus className="w-3.5 h-3.5" /> Seçenekli kalem ekle
            </GhostButton>
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="İndirim (%)" htmlFor="prop-discount">
                <input id="prop-discount" type="number" min={0} max={100} step="0.5" value={draft.discountRate} onChange={(e) => setDraft({ ...draft, discountRate: Number(e.target.value) })} className={inputClass} />
              </Field>
              <Field label="KDV (%)" htmlFor="prop-vat">
                <input id="prop-vat" type="number" min={0} max={100} step="1" value={draft.vatRate} onChange={(e) => setDraft({ ...draft, vatRate: Number(e.target.value) })} className={inputClass} />
              </Field>
            </div>
            <Field label="Notlar (ödeme koşulları, süre vb.)" htmlFor="prop-notes">
              <textarea id="prop-notes" rows={3} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <dl className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2 text-sm self-start">
            <div className="flex justify-between text-zinc-300"><dt>Ara toplam</dt><dd className="font-mono">{formatTL(totals.subtotal)}</dd></div>
            {totals.discount > 0 && <div className="flex justify-between text-zinc-300"><dt>İndirim (%{draft.discountRate})</dt><dd className="font-mono">−{formatTL(totals.discount)}</dd></div>}
            <div className="flex justify-between text-zinc-300"><dt>KDV (%{draft.vatRate})</dt><dd className="font-mono">{formatTL(totals.vat)}</dd></div>
            <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-white/10"><dt>Genel toplam</dt><dd className="font-mono">{formatTL(totals.total)}</dd></div>
            {totals.excludedOptional > 0 && (
              <p className="text-[11px] text-zinc-500">Seçilmemiş opsiyonlar: {formatTL(totals.excludedOptional)} (KDV hariç, toplama dahil değil)</p>
            )}
          </dl>
        </div>

        <ProposalAttachments
          proposalId={draft.id}
          attachments={proposals.find((p) => p.id === draft.id)?.attachments ?? []}
          pendingFiles={pendingFiles}
          onPendingChange={setPendingFiles}
        />

        {draft.history && draft.history.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">Geçmiş</h4>
            <ul className="space-y-1 text-[11px] font-mono text-zinc-400 max-h-32 overflow-y-auto">
              {[...draft.history].reverse().map((entry, i) => (
                <li key={`${entry.at}-${i}`}>
                  {formatDateTime(entry.at)} — <span className="text-zinc-200">{HISTORY_LABELS[entry.action]}</span>
                  {entry.note ? ` · ${entry.note}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-white/10">
          <GhostButton type="button" onClick={onClose}>
            Vazgeç
          </GhostButton>
          <GhostButton type="submit" disabled={saving}>
            {draft.id ? "Kaydet" : "Taslak olarak kaydet"}
          </GhostButton>
          {(!draft.status || draft.status === "taslak") && (
            <PrimaryButton
              type="button"
              disabled={saving}
              onClick={(e) => {
                const form = (e.currentTarget as HTMLButtonElement).form;
                if (form && !form.reportValidity()) return;
                save(true);
              }}
            >
              Kaydet ve gönderildi işaretle
            </PrimaryButton>
          )}
        </div>
      </form>
    </Modal>
  );
}
