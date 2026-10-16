import { Payment, PaymentState, ProposalItem } from "@/lib/crm/types";

/** Pure CRM calculations shared by the server and the admin UI (unit-tested). */

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatTL(value: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 }).format(value || 0);
}

export function itemTotal(item: Pick<ProposalItem, "quantity" | "unitPrice">): number {
  return roundMoney(Math.max(0, item.quantity) * Math.max(0, item.unitPrice));
}

export function isItemIncluded(item: Pick<ProposalItem, "optional" | "selected">): boolean {
  return !item.optional || item.selected;
}

export interface ProposalTotals {
  subtotal: number; // dahil edilen kalemler (KDV hariç)
  excludedOptional: number; // seçilmemiş opsiyonel kalemlerin toplamı
  discount: number;
  taxable: number;
  vat: number;
  total: number; // KDV dahil genel toplam
}

export function computeProposalTotals(items: ProposalItem[], discountRate: number, vatRate: number): ProposalTotals {
  const clampRate = (rate: number) => Math.min(100, Math.max(0, Number.isFinite(rate) ? rate : 0));
  let subtotal = 0;
  let excludedOptional = 0;
  for (const item of items) {
    if (isItemIncluded(item)) subtotal += itemTotal(item);
    else excludedOptional += itemTotal(item);
  }
  subtotal = roundMoney(subtotal);
  const discount = roundMoney((subtotal * clampRate(discountRate)) / 100);
  const taxable = roundMoney(subtotal - discount);
  const vat = roundMoney((taxable * clampRate(vatRate)) / 100);
  return { subtotal, excludedOptional: roundMoney(excludedOptional), discount, taxable, vat, total: roundMoney(taxable + vat) };
}

/** Next proposal number for the year, e.g. TKL-2026-007. */
export function nextProposalNumber(existing: string[], year: number): string {
  const prefix = `TKL-${year}-`;
  const max = existing
    .filter((number) => number.startsWith(prefix))
    .map((number) => Number(number.slice(prefix.length)))
    .filter(Number.isFinite)
    .reduce((acc, value) => Math.max(acc, value), 0);
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

/** Local calendar date as YYYY-MM-DD (no UTC shift). */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function paymentState(payment: Pick<Payment, "paidDate" | "dueDate">, today: string): PaymentState {
  if (payment.paidDate) return "odendi";
  return payment.dueDate < today ? "gecikti" : "bekliyor";
}

/** Same day next month, clamped to the month's last day (31 Jan → 28/29 Feb). */
export function addOneMonth(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const targetMonth = m === 12 ? 1 : m + 1;
  const targetYear = m === 12 ? y + 1 : y;
  const lastDay = new Date(targetYear, targetMonth, 0).getDate();
  return `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(Math.min(d, lastDay)).padStart(2, "0")}`;
}

export interface PaymentSummary {
  collected: number; // tahsil edilen (seçilen ay)
  pending: number; // bekleyen (vadesi gelmemiş)
  overdue: number; // gecikmiş (tüm zamanlar)
  overdueCount: number;
}

export function summarizePayments(payments: Payment[], today: string, monthPrefix: string): PaymentSummary {
  const summary: PaymentSummary = { collected: 0, pending: 0, overdue: 0, overdueCount: 0 };
  for (const payment of payments) {
    const state = paymentState(payment, today);
    if (state === "odendi" && payment.paidDate?.startsWith(monthPrefix)) summary.collected += payment.amount;
    if (state === "bekliyor") summary.pending += payment.amount;
    if (state === "gecikti") {
      summary.overdue += payment.amount;
      summary.overdueCount += 1;
    }
  }
  summary.collected = roundMoney(summary.collected);
  summary.pending = roundMoney(summary.pending);
  summary.overdue = roundMoney(summary.overdue);
  return summary;
}

/**
 * Month grid for the box calendar: weeks start on Monday, leading/trailing days
 * from neighbouring months fill the first/last week. Returns 5 or 6 weeks of date keys.
 */
export function buildMonthGrid(year: number, month: number): { date: string; inMonth: boolean }[][] {
  const first = new Date(year, month - 1, 1);
  const offset = (first.getDay() + 6) % 7; // Monday = 0
  const start = new Date(year, month - 1, 1 - offset);
  const daysInMonth = new Date(year, month, 0).getDate();
  const weeks = Math.ceil((offset + daysInMonth) / 7);
  const grid: { date: string; inMonth: boolean }[][] = [];
  for (let w = 0; w < weeks; w += 1) {
    const week: { date: string; inMonth: boolean }[] = [];
    for (let d = 0; d < 7; d += 1) {
      const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d);
      week.push({ date: toDateKey(day), inMonth: day.getMonth() === month - 1 });
    }
    grid.push(week);
  }
  return grid;
}

export type ContractState = "devam" | "yaklasiyor" | "doldu";

/** Whole days from `today` to `endDate` (negative when already past). */
export function daysUntil(endDate: string, today: string): number {
  const toUtc = (key: string) => {
    const [y, m, d] = key.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(endDate) - toUtc(today)) / 86_400_000);
}

/** Contract status for a client's end date; `warnDays` before the end it counts as "yaklaşıyor". */
export function contractState(endDate: string | undefined, today: string, warnDays = 30): ContractState | null {
  if (!endDate) return null;
  const days = daysUntil(endDate, today);
  if (days < 0) return "doldu";
  return days <= warnDays ? "yaklasiyor" : "devam";
}
