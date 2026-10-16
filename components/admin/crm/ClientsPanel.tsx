"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Edit2, FileText, Mail, MessageCircle, Phone, Plus, Search, Trash2, Users, Wallet } from "lucide-react";
import { CLIENT_STATUS_LABELS, Client, ClientStatus } from "@/lib/crm/types";
import { contractState, daysUntil, formatTL, paymentState } from "@/lib/crm/calc";
import { useCrm } from "@/components/admin/crm/CrmProvider";
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
import { toWhatsAppDigits } from "@/lib/utils/sanitize";

type ClientDraft = Partial<Client> & { servicesText?: string };

const EMPTY: ClientDraft = {
  name: "",
  contactName: "",
  phone: "",
  email: "",
  sector: "",
  address: "",
  instagram: "",
  website: "",
  status: "aktif",
  servicesText: "",
  notes: "",
};

const STATUS_STYLES: Record<ClientStatus, string> = {
  aktif: "bg-emerald-500/15 text-emerald-300",
  potansiyel: "bg-amber-400/15 text-amber-300",
  pasif: "bg-white/5 text-zinc-400",
};

function whatsappHref(phone: string): string | null {
  const digits = phone.replace(/[^0-9]/g, "");
  const normalized = digits.startsWith("0") ? `9${digits}` : digits.length === 10 ? `90${digits}` : digits;
  return normalized.length >= 11 ? `https://wa.me/${toWhatsAppDigits(normalized, "")}` : null;
}

export function ClientsPanel() {
  const { clients, proposals, payments, create, update, remove, loaded } = useCrm();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all" | "bitiyor">("all");
  const [editing, setEditing] = useState<ClientDraft | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const today = todayKey();

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return clients
      .filter((client) =>
        statusFilter === "all"
          ? true
          : statusFilter === "bitiyor"
            ? ["yaklasiyor", "doldu"].includes(contractState(client.endDate, today) ?? "")
            : client.status === statusFilter
      )
      .filter((client) =>
        !q ||
        [client.name, client.contactName, client.phone, client.email, client.sector, ...client.services]
          .join(" ")
          .toLocaleLowerCase("tr")
          .includes(q)
      )
      .sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [clients, query, statusFilter, today]);

  const endingSoon = clients.filter(
    (client) => client.status === "aktif" && ["yaklasiyor", "doldu"].includes(contractState(client.endDate, today) ?? "")
  ).length;

  const monthlyRecurring = clients
    .filter((client) => client.status === "aktif")
    .reduce((sum, client) => sum + (client.monthlyFee || 0), 0);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const payload = {
      ...editing,
      services: (editing.servicesText || "").split(",").map((item) => item.trim()).filter(Boolean),
    };
    const ok = editing.id ? await update("clients", editing.id, payload) : Boolean(await create("clients", payload));
    if (ok) setEditing(null);
  };

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Müşteri Takibi"
        subtitle="Aktif ve potansiyel müşteriler, aldıkları hizmetler, teklif ve ödeme geçmişi."
        action={
          <PrimaryButton onClick={() => setEditing({ ...EMPTY })} className="self-start">
            <Plus className="w-4 h-4" /> Yeni Müşteri
          </PrimaryButton>
        }
      />
      <CrmErrorBanner />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Aktif müşteri", value: String(clients.filter((c) => c.status === "aktif").length) },
          { label: "Potansiyel", value: String(clients.filter((c) => c.status === "potansiyel").length) },
          { label: "Aylık sabit gelir", value: formatTL(monthlyRecurring) },
          { label: "Sözleşmesi biten / 30 gün", value: String(endingSoon) },
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
          <input
            aria-label="Müşteri ara"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Firma, kişi, telefon veya hizmet ara..."
            className={`${inputClass} pl-9`}
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {(["all", "aktif", "potansiyel", "pasif", "bitiyor"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              aria-pressed={statusFilter === status}
              className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap border ${statusFilter === status ? "border-brand-500/60 bg-brand-500/10 text-white" : "border-white/10 text-zinc-400 hover:text-white"}`}
            >
              {status === "all" ? "Tümü" : status === "bitiyor" ? "Süresi biten / yaklaşan" : CLIENT_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {!loaded ? (
        <div className="h-32 rounded-2xl bg-slate-900/60 animate-pulse" aria-busy="true" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="Müşteri bulunamadı." hint="Yeni müşteri ekleyin ya da bir teklifi onaylayın; onaylanan teklifler otomatik olarak buraya eklenir." />
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => {
            const clientPayments = payments.filter((p) => p.clientId === client.id);
            const outstanding = clientPayments
              .filter((p) => paymentState(p, today) !== "odendi")
              .reduce((sum, p) => sum + p.amount, 0);
            const overdue = clientPayments.some((p) => paymentState(p, today) === "gecikti");
            const clientProposals = proposals.filter((p) => p.clientId === client.id);
            const wa = client.phone ? whatsappHref(client.phone) : null;
            const isOpen = expanded === client.id;

            return (
              <div key={client.id} className="rounded-2xl bg-slate-900/70 border border-white/10 overflow-hidden">
                <div className="p-4 flex flex-col lg:flex-row lg:items-center gap-3">
                  <button onClick={() => setExpanded(isOpen ? null : client.id)} className="flex-1 min-w-0 text-left" aria-expanded={isOpen}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white">{client.name}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${STATUS_STYLES[client.status]}`}>
                        {CLIENT_STATUS_LABELS[client.status]}
                      </span>
                      {client.source === "teklif" && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-brand-500/15 text-brand-300">tekliften</span>
                      )}
                      {(() => {
                        const contract = contractState(client.endDate, today);
                        if (!client.endDate || contract === "devam") return null;
                        const days = daysUntil(client.endDate, today);
                        return contract === "doldu" ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-red-500/15 text-red-300">sözleşme bitti</span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300">
                            {days === 0 ? "bugün bitiyor" : `${days} gün kaldı`}
                          </span>
                        );
                      })()}
                      {overdue && <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-red-500/15 text-red-300">gecikmiş ödeme</span>}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 truncate">
                      {[client.contactName, client.sector, client.services.slice(0, 3).join(", ")].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </button>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {client.monthlyFee ? <span className="font-mono text-zinc-200">{formatTL(client.monthlyFee)}/ay</span> : null}
                    {outstanding > 0 && <span className="font-mono text-amber-300">Bekleyen {formatTL(outstanding)}</span>}
                    {client.phone && (
                      <a href={`tel:${client.phone.replace(/[^0-9+]/g, "")}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200" aria-label={`${client.name} ara`}>
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {wa && (
                      <a href={wa} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-brand-500/15 hover:bg-brand-500/25 text-brand-300" aria-label={`${client.name} WhatsApp`}>
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {client.email && (
                      <a href={`mailto:${client.email}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200" aria-label={`${client.name} e-posta`}>
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <GhostButton onClick={() => setEditing({ ...client, servicesText: client.services.join(", ") })}>
                      <Edit2 className="w-3.5 h-3.5" /> Düzenle
                    </GhostButton>
                    <button
                      onClick={() => setExpanded(isOpen ? null : client.id)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-white"
                      aria-label={isOpen ? "Detayı kapat" : "Detayı aç"}
                    >
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-white/10 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1.5 text-zinc-300">
                      <p className="font-mono text-[11px] text-brand-400 uppercase">Bilgiler</p>
                      <p>Telefon: {client.phone || "–"}</p>
                      <p className="break-all">E-posta: {client.email || "–"}</p>
                      <p>Instagram: {client.instagram || "–"}</p>
                      <p className="break-all">Web: {client.website || "–"}</p>
                      <p>Adres: {client.address || "–"}</p>
                      <p>Başlangıç: {formatDate(client.startDate)}</p>
                      <p>Bitiş: {formatDate(client.endDate)}</p>
                      {client.notes && <p className="whitespace-pre-line text-zinc-400 pt-1">{client.notes}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <p className="font-mono text-[11px] text-brand-400 uppercase flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> Teklifler ({clientProposals.length})
                      </p>
                      {clientProposals.length === 0 ? (
                        <p className="text-zinc-500">Teklif yok.</p>
                      ) : (
                        clientProposals.map((p) => (
                          <p key={p.id} className="text-zinc-300">
                            {p.number} · {p.title} <span className="text-zinc-500">({p.status})</span>
                          </p>
                        ))
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <p className="font-mono text-[11px] text-brand-400 uppercase flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5" /> Ödemeler ({clientPayments.length})
                      </p>
                      {clientPayments.length === 0 ? (
                        <p className="text-zinc-500">Ödeme kaydı yok.</p>
                      ) : (
                        clientPayments
                          .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
                          .slice(0, 6)
                          .map((p) => {
                            const state = paymentState(p, today);
                            return (
                              <p key={p.id} className="text-zinc-300 flex justify-between gap-2">
                                <span className="truncate">{formatDate(p.dueDate)} · {p.description}</span>
                                <span className={state === "odendi" ? "text-emerald-300" : state === "gecikti" ? "text-red-300" : "text-amber-300"}>
                                  {formatTL(p.amount)}
                                </span>
                              </p>
                            );
                          })
                      )}
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                      <button
                        onClick={() => {
                          if (confirm(`${client.name} müşteri listesinden kaldırılsın mı? (Ödeme ve teklif kayıtları korunur)`)) remove("clients", client.id);
                        }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Müşteriyi kaldır
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? "Müşteriyi Düzenle" : "Yeni Müşteri"} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Firma / marka adı *" htmlFor="client-name">
                <input id="client-name" required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Yetkili kişi" htmlFor="client-contact">
                <input id="client-contact" value={editing.contactName} onChange={(e) => setEditing({ ...editing, contactName: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Telefon" htmlFor="client-phone">
                <input id="client-phone" type="tel" inputMode="tel" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className={inputClass} />
              </Field>
              <Field label="E-posta" htmlFor="client-email">
                <input id="client-email" type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Sektör" htmlFor="client-sector">
                <input id="client-sector" value={editing.sector} onChange={(e) => setEditing({ ...editing, sector: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Durum" htmlFor="client-status">
                <select id="client-status" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as ClientStatus })} className={inputClass}>
                  {Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Instagram" htmlFor="client-instagram">
                <input id="client-instagram" value={editing.instagram} onChange={(e) => setEditing({ ...editing, instagram: e.target.value })} placeholder="@kullaniciadi" className={inputClass} />
              </Field>
              <Field label="Web sitesi" htmlFor="client-website">
                <input id="client-website" value={editing.website} onChange={(e) => setEditing({ ...editing, website: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Aylık sabit ücret (TL)" htmlFor="client-fee">
                <input
                  id="client-fee"
                  type="number"
                  min={0}
                  step="0.01"
                  value={editing.monthlyFee ?? ""}
                  onChange={(e) => setEditing({ ...editing, monthlyFee: e.target.value === "" ? undefined : Number(e.target.value) })}
                  className={inputClass}
                />
              </Field>
              <Field label="Başlangıç tarihi" htmlFor="client-start">
                <input id="client-start" type="date" value={editing.startDate ?? ""} onChange={(e) => setEditing({ ...editing, startDate: e.target.value || undefined })} className={inputClass} />
              </Field>
              <Field label="Bitiş tarihi (sözleşme sonu)" htmlFor="client-end">
                <input
                  id="client-end"
                  type="date"
                  min={editing.startDate || undefined}
                  value={editing.endDate ?? ""}
                  onChange={(e) => setEditing({ ...editing, endDate: e.target.value || undefined })}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Aldığı hizmetler (virgülle ayırın)" htmlFor="client-services">
              <input id="client-services" value={editing.servicesText} onChange={(e) => setEditing({ ...editing, servicesText: e.target.value })} placeholder="Sosyal Medya Yönetimi, Meta Ads" className={inputClass} />
            </Field>
            <Field label="Adres" htmlFor="client-address">
              <input id="client-address" value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Notlar" htmlFor="client-notes">
              <textarea id="client-notes" rows={3} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className={inputClass} />
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
