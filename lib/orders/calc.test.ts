import { describe, expect, it } from "vitest";
import {
  canBePaid,
  iyzicoBasketLines,
  isValidTckn,
  nextOrderNumber,
  normalizeSignaturePrice,
  orderTotals,
  splitFullName,
  toGsmNumber,
  toIyzicoPrice,
} from "@/lib/orders/calc";
import { OrderItem } from "@/lib/orders/types";

const item = (partial: Partial<OrderItem>): OrderItem => ({ id: "a", name: "Hizmet", description: "", quantity: 1, unitPrice: 0, ...partial });

describe("order totals and iyzico basket", () => {
  it("adds VAT and builds basket lines that sum exactly to the price (Happy Path)", () => {
    // 1. Arrange
    const items = [item({ id: "a", unitPrice: 10_000 }), item({ id: "b", quantity: 3, unitPrice: 333.33 })];

    // 2. Act
    const totals = orderTotals(items, 20);
    const lines = iyzicoBasketLines(items, 20);

    // 3. Assert
    expect(totals).toEqual({ subtotal: 10_999.99, vat: 2_200, total: 13_199.99 });
    expect(Math.round(lines.reduce((sum, line) => sum + line.price, 0) * 100) / 100).toBe(totals.total);
    expect(toIyzicoPrice(totals.total)).toBe("13199.99");
  });

  it("absorbs rounding differences into the largest line (Edge Case 1)", () => {
    // 1. Arrange: three lines of 0.10 + 18% VAT = 0.118 each → rounding drift
    const items = [item({ id: "a", unitPrice: 0.1 }), item({ id: "b", unitPrice: 0.1 }), item({ id: "c", unitPrice: 0.1 })];

    // 2. Act
    const lines = iyzicoBasketLines(items, 18);

    // 3. Assert
    expect(lines.reduce((sum, line) => sum + Math.round(line.price * 100), 0)).toBe(Math.round(orderTotals(items, 18).total * 100));
  });

  it("formats prices for signature checks the way iyzico does (Edge Case 2)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(normalizeSignaturePrice("50.00")).toBe("50");
    expect(normalizeSignaturePrice("10.50")).toBe("10.5");
    expect(normalizeSignaturePrice(1250.5)).toBe("1250.5");
    expect(normalizeSignaturePrice("100")).toBe("100");
    expect(normalizeSignaturePrice(undefined)).toBe("");
  });
});

describe("buyer helpers", () => {
  it("splits names and formats GSM numbers for iyzico (Happy Path)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(splitFullName("Ayşe Nur Yılmaz")).toEqual({ name: "Ayşe Nur", surname: "Yılmaz" });
    expect(toGsmNumber("0532 111 22 33")).toBe("+905321112233");
    expect(toGsmNumber("532 111 22 33")).toBe("+905321112233");
    expect(toGsmNumber("+90 532 111 22 33")).toBe("+905321112233");
  });

  it("validates Turkish ID numbers by checksum (Edge Case 1)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(isValidTckn("10000000146")).toBe(true);
    expect(isValidTckn("10000000147")).toBe(false);
    expect(isValidTckn("01234567890")).toBe(false);
    expect(isValidTckn("123")).toBe(false);
  });

  it("handles single-word names, numbering and expired links (Edge Case 2)", () => {
    // 1. Arrange
    const now = Date.parse("2026-10-22T12:00:00Z");

    // 2. Act & 3. Assert
    expect(splitFullName("Cher")).toEqual({ name: "Cher", surname: "Cher" });
    expect(nextOrderNumber(["SIP-2026-0009", "SIP-2025-0100"], 2026)).toBe("SIP-2026-0010");
    expect(canBePaid({ status: "link_gonderildi", linkExpiresAt: "2026-10-21T00:00:00Z" }, now)).toBe(false);
    expect(canBePaid({ status: "odendi", linkExpiresAt: "2026-12-01T00:00:00Z" }, now)).toBe(false);
    expect(canBePaid({ status: "basarisiz", linkExpiresAt: "2026-12-01T00:00:00Z" }, now)).toBe(true);
  });
});
