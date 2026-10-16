import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { crmRepositories } from "@/lib/server/repositories/crm-repository";
import { createProposal, decideProposal, updatePayment, updateProposal } from "@/lib/server/crm/crm-service";
import { CrmValidationError } from "@/lib/server/validation/crm";

// Each test runs against a fresh, isolated data folder.
const previousDataDir = process.env.DATA_DIR;
let dataDir = "";

beforeEach(() => {
  if (dataDir) rmSync(dataDir, { recursive: true, force: true });
  dataDir = mkdtempSync(path.join(tmpdir(), "dv-crm-"));
  process.env.DATA_DIR = dataDir;
});

afterAll(() => {
  if (dataDir) rmSync(dataDir, { recursive: true, force: true });
  process.env.DATA_DIR = previousDataDir;
});

const proposalInput = {
  title: "Sosyal Medya Paketi",
  clientName: "Kahve Durağı",
  contactName: "Ayşe Yılmaz",
  phone: "0532 111 22 33",
  email: "ayse@kahve.com",
  items: [
    { service: "Sosyal Medya Yönetimi", quantity: 1, unitPrice: 10_000 },
    { service: "Reels Prodüksiyon", quantity: 4, unitPrice: 1_500, optional: true, selected: true },
    { service: "Web Sitesi", quantity: 1, unitPrice: 20_000, optional: true, selected: false },
  ],
  discountRate: 0,
  vatRate: 20,
};

describe("proposal lifecycle", () => {
  it("approving a proposal adds the client and a payment (Happy Path)", async () => {
    // 1. Arrange
    const proposal = await createProposal({ ...proposalInput, sent: true });

    // 2. Act
    const result = await decideProposal(proposal.id, { decision: "approve", createPayment: true, paymentDueDate: "2026-11-01" });

    // 3. Assert
    expect(proposal.number).toMatch(/^TKL-\d{4}-001$/);
    expect(proposal.status).toBe("gonderildi");
    expect(result?.proposal.status).toBe("onaylandi");
    expect(result?.client).toMatchObject({ name: "Kahve Durağı", status: "aktif", source: "teklif" });
    expect(result?.client?.services).toEqual(["Sosyal Medya Yönetimi", "Reels Prodüksiyon"]); // unselected option excluded
    expect(result?.payment).toMatchObject({ amount: 19_200, dueDate: "2026-11-01", recurring: false });
    expect(await crmRepositories.clients.list()).toHaveLength(1);
  });

  it("records edit history and blocks edits after a decision (Edge Case 1)", async () => {
    // 1. Arrange
    const proposal = await createProposal(proposalInput);

    // 2. Act
    const edited = await updateProposal(proposal.id, { ...proposalInput, discountRate: 10 });
    await decideProposal(proposal.id, { decision: "reject", note: "Bütçe yok" });

    // 3. Assert
    expect(edited?.history.map((entry) => entry.action)).toEqual(["olusturuldu", "duzenlendi"]);
    expect((edited?.updatedAt ?? "") >= proposal.updatedAt).toBe(true);
    await expect(updateProposal(proposal.id, proposalInput)).rejects.toThrow(CrmValidationError);
    await expect(decideProposal(proposal.id, { decision: "approve" })).rejects.toThrow(CrmValidationError);
    expect(await crmRepositories.clients.list()).toHaveLength(0); // rejection adds no client
  });

  it("links approval to an existing client instead of duplicating it (Edge Case 2)", async () => {
    // 1. Arrange
    const client = await crmRepositories.clients.create({
      name: "Kahve Durağı", contactName: "", phone: "", email: "", sector: "", address: "", instagram: "",
      website: "", status: "potansiyel", services: ["SEO"], notes: "", source: "manuel",
    });
    const proposal = await createProposal({ ...proposalInput, clientId: client.id });

    // 2. Act
    const result = await decideProposal(proposal.id, { decision: "approve", monthlyFee: 12_000, createPayment: true });

    // 3. Assert
    const clients = await crmRepositories.clients.list();
    expect(clients).toHaveLength(1);
    expect(clients[0]).toMatchObject({ status: "aktif", monthlyFee: 12_000 });
    expect(clients[0].services).toEqual(["SEO", "Sosyal Medya Yönetimi", "Reels Prodüksiyon"]);
    expect(result?.payment).toMatchObject({ amount: 12_000, recurring: true });
  });
});

describe("updatePayment", () => {
  const base = { clientName: "Kahve Durağı", description: "Ekim yönetimi", amount: 12_000, dueDate: "2026-01-31", notes: "" };

  it("creates next month's payment once when a recurring payment is paid (Happy Path)", async () => {
    // 1. Arrange
    const payment = await crmRepositories.payments.create({ ...base, recurring: true });

    // 2. Act
    const first = await updatePayment(payment.id, { ...base, recurring: true, paidDate: "2026-02-01", method: "havale" });
    const second = await updatePayment(payment.id, { ...base, recurring: true, paidDate: "2026-02-02", method: "nakit" });

    // 3. Assert
    expect(first?.next).toMatchObject({ dueDate: "2026-02-28", recurring: true });
    expect(first?.next?.paidDate).toBeUndefined();
    expect(second?.next).toBeUndefined(); // no duplicate on re-save
    expect(await crmRepositories.payments.list()).toHaveLength(2);
  });

  it("does not create a follow-up for one-off payments (Edge Case 1)", async () => {
    // 1. Arrange
    const payment = await crmRepositories.payments.create({ ...base, recurring: false });

    // 2. Act
    const result = await updatePayment(payment.id, { ...base, paidDate: "2026-02-01" });

    // 3. Assert
    expect(result?.next).toBeUndefined();
    expect(await crmRepositories.payments.list()).toHaveLength(1);
  });

  it("rejects invalid amounts and dates (Edge Case 2)", async () => {
    // 1. Arrange
    const payment = await crmRepositories.payments.create({ ...base, recurring: false });

    // 2. Act & 3. Assert
    await expect(updatePayment(payment.id, { ...base, amount: 0 })).rejects.toThrow(CrmValidationError);
    await expect(updatePayment(payment.id, { ...base, dueDate: "31.01.2026" })).rejects.toThrow(CrmValidationError);
    expect(await updatePayment("pay-missing", base)).toBeNull();
  });
});
