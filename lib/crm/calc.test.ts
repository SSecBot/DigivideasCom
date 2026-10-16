import { describe, expect, it } from "vitest";
import {
  addOneMonth,
  buildMonthGrid,
  computeProposalTotals,
  nextProposalNumber,
  paymentState,
  summarizePayments,
} from "@/lib/crm/calc";
import { Payment, ProposalItem } from "@/lib/crm/types";

const item = (partial: Partial<ProposalItem>): ProposalItem => ({
  id: "i",
  service: "Hizmet",
  description: "",
  quantity: 1,
  unitPrice: 0,
  optional: false,
  selected: true,
  ...partial,
});

describe("computeProposalTotals", () => {
  it("adds included items, applies discount then VAT (Happy Path)", () => {
    // 1. Arrange
    const items = [item({ quantity: 1, unitPrice: 10_000 }), item({ quantity: 2, unitPrice: 2_500 })];

    // 2. Act
    const totals = computeProposalTotals(items, 10, 20);

    // 3. Assert
    expect(totals).toEqual({ subtotal: 15_000, excludedOptional: 0, discount: 1_500, taxable: 13_500, vat: 2_700, total: 16_200 });
  });

  it("excludes unselected optional items but reports them separately (Edge Case 1)", () => {
    // 1. Arrange
    const items = [
      item({ unitPrice: 8_000 }),
      item({ unitPrice: 3_000, optional: true, selected: false }),
      item({ unitPrice: 1_000, optional: true, selected: true }),
    ];

    // 2. Act
    const totals = computeProposalTotals(items, 0, 0);

    // 3. Assert
    expect(totals.subtotal).toBe(9_000);
    expect(totals.excludedOptional).toBe(3_000);
    expect(totals.total).toBe(9_000);
  });

  it("clamps invalid rates and negative numbers, rounds to kuruş (Edge Case 2)", () => {
    // 1. Arrange
    const items = [item({ quantity: 3, unitPrice: 33.333 }), item({ quantity: -5, unitPrice: 100 })];

    // 2. Act
    const totals = computeProposalTotals(items, 150, NaN);

    // 3. Assert
    expect(totals.subtotal).toBe(100);
    expect(totals.discount).toBe(100);
    expect(totals.vat).toBe(0);
    expect(totals.total).toBe(0);
  });
});

describe("nextProposalNumber / addOneMonth", () => {
  it("continues the yearly sequence (Happy Path)", () => {
    // 1. Arrange
    const existing = ["TKL-2026-001", "TKL-2026-009", "TKL-2025-044"];

    // 2. Act & 3. Assert
    expect(nextProposalNumber(existing, 2026)).toBe("TKL-2026-010");
    expect(nextProposalNumber(existing, 2027)).toBe("TKL-2027-001");
  });

  it("clamps month-end dates and rolls over the year (Edge Case 1)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(addOneMonth("2026-01-31")).toBe("2026-02-28");
    expect(addOneMonth("2028-01-31")).toBe("2028-02-29");
    expect(addOneMonth("2026-12-15")).toBe("2027-01-15");
  });

  it("ignores malformed numbers (Edge Case 2)", () => {
    // 1. Arrange
    const existing = ["TKL-2026-abc", "foo"];

    // 2. Act & 3. Assert
    expect(nextProposalNumber(existing, 2026)).toBe("TKL-2026-001");
  });
});

describe("payments", () => {
  const payment = (partial: Partial<Payment>): Payment => ({
    id: "p",
    clientName: "X",
    description: "d",
    amount: 1_000,
    dueDate: "2026-10-20",
    recurring: false,
    notes: "",
    createdAt: "",
    updatedAt: "",
    ...partial,
  });

  it("summarises collected, pending and overdue amounts (Happy Path)", () => {
    // 1. Arrange
    const payments = [
      payment({ amount: 5_000, paidDate: "2026-10-03", dueDate: "2026-10-01" }),
      payment({ amount: 2_000, dueDate: "2026-10-30" }),
      payment({ amount: 1_500, dueDate: "2026-09-15" }),
    ];

    // 2. Act
    const summary = summarizePayments(payments, "2026-10-16", "2026-10");

    // 3. Assert
    expect(summary).toEqual({ collected: 5_000, pending: 2_000, overdue: 1_500, overdueCount: 1 });
  });

  it("treats a payment due today as pending, not overdue (Edge Case 1)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(paymentState(payment({ dueDate: "2026-10-16" }), "2026-10-16")).toBe("bekliyor");
    expect(paymentState(payment({ dueDate: "2026-10-15" }), "2026-10-16")).toBe("gecikti");
  });

  it("counts a paid payment as paid even when its due date passed (Edge Case 2)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(paymentState(payment({ dueDate: "2026-01-01", paidDate: "2026-02-01" }), "2026-10-16")).toBe("odendi");
  });
});

describe("buildMonthGrid", () => {
  it("starts weeks on Monday and covers the whole month (Happy Path)", () => {
    // 1. Arrange: October 2026 starts on a Thursday
    // 2. Act
    const grid = buildMonthGrid(2026, 10);

    // 3. Assert
    expect(grid[0][0]).toEqual({ date: "2026-09-28", inMonth: false });
    expect(grid[0][3]).toEqual({ date: "2026-10-01", inMonth: true });
    expect(grid.flat().filter((day) => day.inMonth)).toHaveLength(31);
    expect(grid.every((week) => week.length === 7)).toBe(true);
  });

  it("needs only 4 weeks for a February starting on Monday (Edge Case 1)", () => {
    // 1. Arrange & 2. Act: February 2027 starts on Monday and has 28 days
    const grid = buildMonthGrid(2027, 2);

    // 3. Assert
    expect(grid).toHaveLength(4);
    expect(grid[0][0].date).toBe("2027-02-01");
  });

  it("uses 6 weeks when the month spills over (Edge Case 2)", () => {
    // 1. Arrange & 2. Act: August 2027 starts on Sunday with 31 days
    const grid = buildMonthGrid(2027, 8);

    // 3. Assert
    expect(grid).toHaveLength(6);
  });
});
