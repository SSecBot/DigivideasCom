"use client";

import React, { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Edit2, Plus, Trash2, Wallet } from "lucide-react";
import { CalendarEvent, EVENT_TYPE_LABELS, EventType } from "@/lib/crm/types";
import { buildMonthGrid, formatTL, paymentState } from "@/lib/crm/calc";
import { useCrm } from "@/components/admin/crm/CrmProvider";
import { CrmErrorBanner, Field, GhostButton, Modal, PanelHeader, PrimaryButton, formatDate, inputClass, todayKey } from "@/components/admin/crm/crm-ui";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

// Each type gets a marker colour; the label always accompanies it (identity is never colour-only).
const TYPE_DOT: Record<EventType, string> = {
  toplanti: "bg-sky-400",
  cekim: "bg-fuchsia-400",
  paylasim: "bg-brand-500",
  gorev: "bg-zinc-300",
  diger: "bg-emerald-400",
};

type Draft = Partial<CalendarEvent>;

export function CalendarPanel() {
  const { events, payments, clients, create, update, remove } = useCrm();
  const today = todayKey();
  const [cursor, setCursor] = useState(() => ({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) }));
  const [selected, setSelected] = useState(today);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");

  const grid = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor]);
  const clientName = (id?: string) => clients.find((client) => client.id === id)?.name;

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      if (typeFilter !== "all" && event.type !== typeFilter) continue;
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    map.forEach((list) => list.sort((a, b) => (a.time || "99").localeCompare(b.time || "99")));
    return map;
  }, [events, typeFilter]);

  const paymentsByDate = useMemo(() => {
    const map = new Map<string, typeof payments>();
    for (const payment of payments) {
      if (payment.paidDate) continue;
      const list = map.get(payment.dueDate) ?? [];
      list.push(payment);
      map.set(payment.dueDate, list);
    }
    return map;
  }, [payments]);

  const shiftMonth = (delta: number) =>
    setCursor((prev) => {
      const date = new Date(prev.year, prev.month - 1 + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() + 1 };
    });

  const toggleDone = (event: CalendarEvent) => update("events", event.id, { ...event, done: !event.done });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const ok = editing.id ? await update("events", editing.id, editing) : Boolean(await create("events", editing));
    if (ok) setEditing(null);
  };

  const dayEvents = eventsByDate.get(selected) ?? [];
  const dayPayments = paymentsByDate.get(selected) ?? [];
  const upcoming = events
    .filter((event) => !event.done && event.date >= today)
    .sort((a, b) => `${a.date}${a.time || ""}`.localeCompare(`${b.date}${b.time || ""}`))
    .slice(0, 6);
  const monthTitle = new Date(cursor.year, cursor.month - 1, 1).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Takvim"
        subtitle="Toplantı, çekim, paylaşım ve görevler. Vadesi gelen ödemeler otomatik görünür."
        action={
          <PrimaryButton onClick={() => setEditing({ title: "", date: selected, type: "gorev", done: false, notes: "" })} className="self-start">
            <Plus className="w-4 h-4" /> Yeni Etkinlik
          </PrimaryButton>
        }
      />
      <CrmErrorBanner />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GhostButton onClick={() => shiftMonth(-1)} aria-label="Önceki ay">
            <ChevronLeft className="w-4 h-4" />
          </GhostButton>
          <h3 className="text-base font-semibold text-white capitalize min-w-[150px] text-center">{monthTitle}</h3>
          <GhostButton onClick={() => shiftMonth(1)} aria-label="Sonraki ay">
            <ChevronRight className="w-4 h-4" />
          </GhostButton>
          <button
            onClick={() => {
              setCursor({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) });
              setSelected(today);
            }}
            className="text-xs text-brand-400 hover:underline ml-1"
          >
            Bugün
          </button>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none max-w-full">
          {(["all", ...Object.keys(EVENT_TYPE_LABELS)] as (EventType | "all")[]).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              aria-pressed={typeFilter === type}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] whitespace-nowrap border ${typeFilter === type ? "border-brand-500/60 bg-brand-500/10 text-white" : "border-white/10 text-zinc-400 hover:text-white"}`}
            >
              {type !== "all" && <span className={`w-2 h-2 rounded-full ${TYPE_DOT[type]}`} aria-hidden="true" />}
              {type === "all" ? "Tümü" : EVENT_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Month grid of day boxes */}
        <div className="xl:col-span-8 rounded-2xl border border-white/10 overflow-hidden bg-slate-900/40" role="grid" aria-label={`${monthTitle} takvimi`}>
          <div className="grid grid-cols-7 bg-slate-950/80 border-b border-white/10" role="row">
            {WEEKDAYS.map((day) => (
              <div key={day} role="columnheader" className="py-2 text-center text-[10px] sm:text-[11px] font-mono text-zinc-400">
                {day}
              </div>
            ))}
          </div>
          {grid.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7" role="row">
              {week.map(({ date, inMonth }) => {
                const items = eventsByDate.get(date) ?? [];
                const due = paymentsByDate.get(date) ?? [];
                const isToday = date === today;
                const isSelected = date === selected;
                const overdue = due.some((payment) => paymentState(payment, today) === "gecikti");
                return (
                  <button
                    key={date}
                    role="gridcell"
                    aria-selected={isSelected}
                    aria-label={`${formatDate(date)}: ${items.length} etkinlik, ${due.length} ödeme`}
                    onClick={() => setSelected(date)}
                    onDoubleClick={() => setEditing({ title: "", date, type: "gorev", done: false, notes: "" })}
                    className={`relative min-h-[64px] sm:min-h-[104px] p-1 sm:p-1.5 text-left align-top border-r border-b border-white/5 transition-colors ${
                      inMonth ? "bg-slate-900/40 hover:bg-slate-800/60" : "bg-slate-950/60 text-zinc-600"
                    } ${isSelected ? "ring-2 ring-inset ring-brand-500" : ""}`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-mono ${
                        isToday ? "bg-brand-500 text-slate-950 font-bold" : inMonth ? "text-zinc-200" : "text-zinc-600"
                      }`}
                    >
                      {Number(date.slice(8))}
                    </span>
                    {/* Phones: dots only */}
                    <div className="flex flex-wrap gap-0.5 mt-1 sm:hidden">
                      {items.slice(0, 4).map((event) => (
                        <span key={event.id} className={`w-1.5 h-1.5 rounded-full ${TYPE_DOT[event.type]} ${event.done ? "opacity-30" : ""}`} />
                      ))}
                      {due.length > 0 && <Wallet className={`w-2.5 h-2.5 ${overdue ? "text-red-400" : "text-amber-300"}`} />}
                    </div>
                    {/* Larger screens: titles */}
                    <div className="hidden sm:block space-y-0.5 mt-1">
                      {items.slice(0, 3).map((event) => (
                        <div key={event.id} className={`flex items-center gap-1 text-[10px] leading-tight truncate ${event.done ? "line-through text-zinc-500" : "text-zinc-200"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${TYPE_DOT[event.type]}`} aria-hidden="true" />
                          <span className="truncate">{event.time ? `${event.time} ` : ""}{event.title}</span>
                        </div>
                      ))}
                      {items.length > 3 && <div className="text-[10px] text-zinc-500">+{items.length - 3} daha</div>}
                      {due.length > 0 && (
                        <div className={`flex items-center gap-1 text-[10px] truncate ${overdue ? "text-red-300" : "text-amber-300"}`}>
                          <Wallet className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{due.length} ödeme</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Selected day + upcoming */}
        <div className="xl:col-span-4 space-y-4">
          <section className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-white">{formatDate(selected)}</h3>
              <GhostButton onClick={() => setEditing({ title: "", date: selected, type: "gorev", done: false, notes: "" })}>
                <Plus className="w-3.5 h-3.5" /> Ekle
              </GhostButton>
            </div>
            {dayEvents.length === 0 && dayPayments.length === 0 ? (
              <p className="text-xs text-zinc-500">Bu gün için kayıt yok. Takvimde bir kutuya çift tıklayarak da ekleyebilirsiniz.</p>
            ) : (
              <ul className="space-y-2">
                {dayEvents.map((event) => (
                  <li key={event.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                    <input
                      type="checkbox"
                      checked={event.done}
                      onChange={() => toggleDone(event)}
                      className="mt-0.5 accent-orange-500 w-4 h-4 flex-shrink-0"
                      aria-label={`${event.title} tamamlandı`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${event.done ? "line-through text-zinc-500" : "text-white"}`}>{event.title}</p>
                      <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${TYPE_DOT[event.type]}`} aria-hidden="true" />
                        {EVENT_TYPE_LABELS[event.type]}
                        {event.time ? ` · ${event.time}` : ""}
                        {clientName(event.clientId) ? ` · ${clientName(event.clientId)}` : ""}
                      </p>
                      {event.notes && <p className="text-[11px] text-zinc-500 whitespace-pre-line mt-0.5">{event.notes}</p>}
                    </div>
                    <button onClick={() => setEditing({ ...event })} className="p-1 text-zinc-500 hover:text-white" aria-label={`${event.title} düzenle`}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`"${event.title}" silinsin mi?`)) remove("events", event.id);
                      }}
                      className="p-1 text-zinc-500 hover:text-red-300"
                      aria-label={`${event.title} sil`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
                {dayPayments.map((payment) => (
                  <li key={payment.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs">
                    <Wallet className="w-4 h-4 text-amber-300 flex-shrink-0" />
                    <span className="flex-1 min-w-0 truncate text-zinc-200">
                      {payment.clientName} · {payment.description}
                    </span>
                    <span className="font-mono text-amber-200">{formatTL(payment.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-brand-400" /> Yaklaşanlar
            </h3>
            {upcoming.length === 0 ? (
              <p className="text-xs text-zinc-500">Bekleyen etkinlik yok.</p>
            ) : (
              <ul className="space-y-1.5">
                {upcoming.map((event) => (
                  <li key={event.id}>
                    <button
                      onClick={() => {
                        setSelected(event.date);
                        setCursor({ year: Number(event.date.slice(0, 4)), month: Number(event.date.slice(5, 7)) });
                      }}
                      className="w-full text-left flex items-center gap-2 text-xs text-zinc-300 hover:text-white"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${TYPE_DOT[event.type]}`} aria-hidden="true" />
                      <span className="font-mono text-zinc-500 w-20 flex-shrink-0">{formatDate(event.date)}</span>
                      <span className="truncate">{event.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {editing && (
        <Modal title={editing.id ? "Etkinliği Düzenle" : "Yeni Etkinlik"} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-4">
            <Field label="Başlık *" htmlFor="evt-title">
              <input id="evt-title" required autoFocus value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="örn. Laos Cafe Reels çekimi" className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tarih *" htmlFor="evt-date">
                <input id="evt-date" required type="date" value={editing.date ?? ""} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Saat" htmlFor="evt-time">
                <input id="evt-time" type="time" value={editing.time ?? ""} onChange={(e) => setEditing({ ...editing, time: e.target.value || undefined })} className={inputClass} />
              </Field>
              <Field label="Tür" htmlFor="evt-type">
                <select id="evt-type" value={editing.type ?? "gorev"} onChange={(e) => setEditing({ ...editing, type: e.target.value as EventType })} className={inputClass}>
                  {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Müşteri" htmlFor="evt-client">
                <select id="evt-client" value={editing.clientId ?? ""} onChange={(e) => setEditing({ ...editing, clientId: e.target.value || undefined })} className={inputClass}>
                  <option value="">—</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Notlar" htmlFor="evt-notes">
              <textarea id="evt-notes" rows={3} value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className={inputClass} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-zinc-200 cursor-pointer">
              <input type="checkbox" checked={editing.done ?? false} onChange={(e) => setEditing({ ...editing, done: e.target.checked })} className="accent-orange-500" />
              Tamamlandı
            </label>
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
