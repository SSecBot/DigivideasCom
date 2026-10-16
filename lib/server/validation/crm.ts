import {
  CLIENT_STATUS_LABELS,
  CalendarEvent,
  Client,
  ClientStatus,
  EVENT_TYPE_LABELS,
  EventType,
  PAYMENT_METHOD_LABELS,
  Payment,
  PaymentMethod,
  Proposal,
  ProposalItem,
} from "@/lib/crm/types";
import { roundMoney } from "@/lib/crm/calc";
import { clampString, safeHref, toStringArray } from "@/lib/utils/sanitize";

/** Server-side normalizers for CRM payloads; unknown fields are dropped. */

export class CrmValidationError extends Error {}

type Raw = Record<string, unknown>;
type Editable<T> = Omit<T, "id" | "createdAt" | "updatedAt" | "deletedAt">;

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function record(value: unknown): Raw {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new CrmValidationError("Geçersiz veri");
  return value as Raw;
}

function text(value: unknown, max: number): string {
  return clampString(value, max).trim();
}

function required(value: unknown, max: number, label: string): string {
  const result = text(value, max);
  if (!result) throw new CrmValidationError(`${label} zorunludur`);
  return result;
}

function date(value: unknown, label: string, optional = true): string | undefined {
  const result = text(value, 10);
  if (!result) {
    if (optional) return undefined;
    throw new CrmValidationError(`${label} zorunludur`);
  }
  if (!DATE.test(result) || Number.isNaN(Date.parse(result))) throw new CrmValidationError(`${label} geçersiz (YYYY-AA-GG)`);
  return result;
}

function money(value: unknown, label: string, allowEmpty = false): number | undefined {
  if (allowEmpty && (value === undefined || value === null || value === "")) return undefined;
  const result = Number(value);
  if (!Number.isFinite(result) || result < 0 || result > 1_000_000_000) throw new CrmValidationError(`${label} geçersiz`);
  return roundMoney(result);
}

function rate(value: unknown): number {
  const result = Number(value ?? 0);
  return Number.isFinite(result) ? Math.min(100, Math.max(0, result)) : 0;
}

function optionalId(value: unknown): string | undefined {
  const result = text(value, 80).replace(/[^a-zA-Z0-9_-]/g, "");
  return result || undefined;
}

function oneOf<T extends string>(value: unknown, labels: Record<T, string>, fallback: T): T {
  return typeof value === "string" && value in labels ? (value as T) : fallback;
}

function link(value: unknown): string {
  const raw = text(value, 300);
  if (!raw) return "";
  return safeHref(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`, "");
}

export function normalizeClient(input: unknown): Omit<Editable<Client>, "source" | "proposalId"> {
  const raw = record(input);
  const monthlyFee = money(raw.monthlyFee, "Aylık ücret", true);
  return {
    name: required(raw.name, 160, "Firma / marka adı"),
    contactName: text(raw.contactName, 120),
    phone: text(raw.phone, 30).replace(/[^0-9+()\s-]/g, ""),
    email: text(raw.email, 200).toLowerCase(),
    sector: text(raw.sector, 120),
    address: text(raw.address, 400),
    instagram: text(raw.instagram, 200),
    website: link(raw.website),
    status: oneOf<ClientStatus>(raw.status, CLIENT_STATUS_LABELS, "aktif"),
    services: toStringArray(raw.services, 30, 120).map((item) => item.trim()).filter(Boolean),
    monthlyFee,
    ...contractDates(raw),
    notes: text(raw.notes, 5000),
  };
}

function contractDates(raw: Raw): { startDate?: string; endDate?: string } {
  const startDate = date(raw.startDate, "Başlangıç tarihi");
  const endDate = date(raw.endDate, "Bitiş tarihi");
  if (startDate && endDate && endDate < startDate) {
    throw new CrmValidationError("Bitiş tarihi başlangıç tarihinden önce olamaz");
  }
  return { startDate, endDate };
}

function normalizeItem(input: unknown, index: number): ProposalItem {
  const raw = record(input);
  const optional = raw.optional === true;
  return {
    id: optionalId(raw.id) || `item-${index + 1}`,
    service: required(raw.service, 160, `${index + 1}. kalemin hizmet adı`),
    description: text(raw.description, 1000),
    quantity: Math.max(0, Math.min(10_000, Number(raw.quantity) || 0)),
    unitPrice: money(raw.unitPrice, `${index + 1}. kalemin fiyatı`) as number,
    optional,
    selected: optional ? raw.selected === true : true,
  };
}

/** Fields the admin may edit on a proposal; status changes go through the decision endpoint. */
export function normalizeProposal(
  input: unknown
): Pick<Proposal, "title" | "clientId" | "clientName" | "contactName" | "phone" | "email" | "items" | "discountRate" | "vatRate" | "validUntil" | "notes"> & {
  sent: boolean;
} {
  const raw = record(input);
  if (!Array.isArray(raw.items) || raw.items.length === 0) throw new CrmValidationError("Teklife en az bir hizmet kalemi ekleyin");
  if (raw.items.length > 100) throw new CrmValidationError("En fazla 100 kalem eklenebilir");
  return {
    title: required(raw.title, 200, "Teklif başlığı"),
    clientId: optionalId(raw.clientId),
    clientName: required(raw.clientName, 160, "Müşteri / firma adı"),
    contactName: text(raw.contactName, 120),
    phone: text(raw.phone, 30).replace(/[^0-9+()\s-]/g, ""),
    email: text(raw.email, 200).toLowerCase(),
    items: raw.items.map(normalizeItem),
    discountRate: rate(raw.discountRate),
    vatRate: rate(raw.vatRate ?? 20),
    validUntil: date(raw.validUntil, "Geçerlilik tarihi"),
    notes: text(raw.notes, 5000),
    sent: raw.sent === true,
  };
}

export function normalizePayment(input: unknown): Editable<Payment> {
  const raw = record(input);
  const amount = money(raw.amount, "Tutar") as number;
  if (amount <= 0) throw new CrmValidationError("Tutar sıfırdan büyük olmalı");
  const paidDate = date(raw.paidDate, "Ödeme tarihi");
  return {
    clientId: optionalId(raw.clientId),
    clientName: required(raw.clientName, 160, "Müşteri"),
    description: required(raw.description, 300, "Açıklama"),
    amount,
    dueDate: date(raw.dueDate, "Vade tarihi", false) as string,
    paidDate,
    method: paidDate ? oneOf<PaymentMethod>(raw.method, PAYMENT_METHOD_LABELS, "havale") : undefined,
    recurring: raw.recurring === true,
    proposalId: optionalId(raw.proposalId),
    notes: text(raw.notes, 2000),
  };
}

export function normalizeEvent(input: unknown): Editable<CalendarEvent> {
  const raw = record(input);
  const time = text(raw.time, 5);
  if (time && !TIME.test(time)) throw new CrmValidationError("Saat geçersiz (SS:DD)");
  return {
    title: required(raw.title, 200, "Başlık"),
    date: date(raw.date, "Tarih", false) as string,
    time: time || undefined,
    type: oneOf<EventType>(raw.type, EVENT_TYPE_LABELS, "gorev"),
    clientId: optionalId(raw.clientId),
    done: raw.done === true,
    notes: text(raw.notes, 2000),
  };
}
