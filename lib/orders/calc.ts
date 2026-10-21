import { Order, OrderItem } from "@/lib/orders/types";

/** Pure order math shared by server and UI (unit-tested). */

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export interface OrderTotals {
  subtotal: number; // KDV hariç
  vat: number;
  total: number; // KDV dahil, the amount charged
}

export function orderTotals(items: Pick<OrderItem, "quantity" | "unitPrice">[], vatRate: number): OrderTotals {
  const rate = Math.min(100, Math.max(0, Number.isFinite(vatRate) ? vatRate : 0));
  const subtotal = round2(items.reduce((sum, item) => sum + Math.max(0, item.quantity) * Math.max(0, item.unitPrice), 0));
  const vat = round2((subtotal * rate) / 100);
  return { subtotal, vat, total: round2(subtotal + vat) };
}

/**
 * VAT-inclusive basket lines for iyzico. iyzico requires the basket item prices to add up
 * to `price` exactly, so rounding differences are absorbed by the largest line.
 */
export function iyzicoBasketLines(items: OrderItem[], vatRate: number): { id: string; name: string; price: number }[] {
  const { total } = orderTotals(items, vatRate);
  const factor = 1 + Math.min(100, Math.max(0, vatRate)) / 100;
  const lines = items
    .filter((item) => item.quantity > 0 && item.unitPrice > 0)
    .map((item) => ({ id: item.id, name: item.name, price: round2(item.quantity * item.unitPrice * factor) }));
  const difference = round2(total - lines.reduce((sum, line) => sum + line.price, 0));
  if (lines.length > 0 && difference !== 0) {
    const largest = lines.reduce((best, line) => (line.price > best.price ? line : best), lines[0]);
    largest.price = round2(largest.price + difference);
  }
  return lines;
}

/** iyzico price string: always 2 decimals with a dot ("1250.50"). */
export function toIyzicoPrice(value: number): string {
  return round2(value).toFixed(2);
}

/** Normalises a price for iyzico signature checks: "50.00" -> "50", "10.50" -> "10.5". */
export function normalizeSignaturePrice(value: string | number | undefined): string {
  if (value === undefined || value === null || value === "") return "";
  const text = typeof value === "number" ? String(value) : value;
  if (!text.includes(".")) return text;
  return text.replace(/0+$/, "").replace(/\.$/, "");
}

export function nextOrderNumber(existing: string[], year: number): string {
  const prefix = `SIP-${year}-`;
  const max = existing
    .filter((number) => number.startsWith(prefix))
    .map((number) => Number(number.slice(prefix.length)))
    .filter(Number.isFinite)
    .reduce((acc, value) => Math.max(acc, value), 0);
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

export function isLinkExpired(order: Pick<Order, "linkExpiresAt">, now = Date.now()): boolean {
  return Boolean(order.linkExpiresAt) && Date.parse(order.linkExpiresAt as string) < now;
}

export function canBePaid(order: Pick<Order, "status" | "linkExpiresAt">, now = Date.now()): boolean {
  return (order.status === "link_gonderildi" || order.status === "beklemede" || order.status === "basarisiz") && !isLinkExpired(order, now);
}

/** iyzico needs a separate name and surname. */
export function splitFullName(fullName: string): { name: string; surname: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { name: parts[0] || "Müşteri", surname: parts[0] || "Müşteri" };
  return { name: parts.slice(0, -1).join(" "), surname: parts[parts.length - 1] };
}

/** "0532 111 22 33" / "5321112233" -> "+905321112233" (iyzico gsmNumber format). */
export function toGsmNumber(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("90") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+9${digits}`;
  if (digits.length === 10) return `+90${digits}`;
  return phone.startsWith("+") ? `+${digits}` : `+${digits}`;
}

/** Turkish ID number checksum (TCKN). */
export function isValidTckn(value: string): boolean {
  if (!/^[1-9][0-9]{10}$/.test(value)) return false;
  const d = value.split("").map(Number);
  const tenth = ((d[0] + d[2] + d[4] + d[6] + d[8]) * 7 - (d[1] + d[3] + d[5] + d[7])) % 10;
  const eleventh = d.slice(0, 10).reduce((sum, digit) => sum + digit, 0) % 10;
  return ((tenth + 10) % 10) === d[9] && eleventh === d[10];
}
