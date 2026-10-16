import { Client, Payment, Proposal } from "@/lib/crm/types";
import { addOneMonth, computeProposalTotals, isItemIncluded, nextProposalNumber } from "@/lib/crm/calc";
import { crmRepositories } from "@/lib/server/repositories/crm-repository";
import { CrmValidationError, normalizePayment, normalizeProposal } from "@/lib/server/validation/crm";

/** CRM business rules: proposal numbering/history, approval → client, recurring payments. */

const today = () => new Date().toISOString().slice(0, 10);

export async function createProposal(input: unknown): Promise<Proposal> {
  const { sent, ...data } = normalizeProposal(input);
  const existing = await crmRepositories.proposals.list();
  const now = new Date().toISOString();
  return crmRepositories.proposals.create({
    ...data,
    number: nextProposalNumber(existing.map((proposal) => proposal.number), new Date().getFullYear()),
    status: sent ? "gonderildi" : "taslak",
    history: [
      { at: now, action: "olusturuldu" },
      ...(sent ? [{ at: now, action: "gonderildi" as const }] : []),
    ],
  });
}

export async function updateProposal(id: string, input: unknown): Promise<Proposal | null> {
  const { sent, ...data } = normalizeProposal(input);
  const current = await crmRepositories.proposals.findById(id);
  if (!current) return null;
  if (current.status === "onaylandi" || current.status === "reddedildi") {
    throw new CrmValidationError("Onaylanmış veya reddedilmiş teklif düzenlenemez. Yeni bir teklif oluşturun.");
  }
  return crmRepositories.proposals.update(id, (proposal) => {
    const now = new Date().toISOString();
    const becameSent = sent && proposal.status === "taslak";
    return {
      ...data,
      status: becameSent ? "gonderildi" : proposal.status,
      history: [
        ...proposal.history,
        { at: now, action: "duzenlendi" },
        ...(becameSent ? [{ at: now, action: "gonderildi" as const }] : []),
      ],
    };
  });
}

export interface DecisionOptions {
  decision: "approve" | "reject";
  note?: string;
  createPayment?: boolean;
  paymentDueDate?: string;
  monthlyFee?: number;
  endDate?: string; // sözleşme bitiş tarihi (YYYY-MM-DD)
}

export interface DecisionResult {
  proposal: Proposal;
  client?: Client;
  payment?: Payment;
}

/** Approves (→ creates or activates the client, optionally a payment) or rejects a proposal. */
export async function decideProposal(id: string, options: DecisionOptions): Promise<DecisionResult | null> {
  const proposal = await crmRepositories.proposals.findById(id);
  if (!proposal) return null;
  if (proposal.status === "onaylandi" || proposal.status === "reddedildi") {
    throw new CrmValidationError("Bu teklif için zaten karar verilmiş");
  }
  const note = (options.note || "").slice(0, 1000).trim() || undefined;
  const now = new Date().toISOString();

  if (options.decision === "reject") {
    const updated = await crmRepositories.proposals.update(id, (current) => ({
      status: "reddedildi",
      decidedAt: now,
      decisionNote: note,
      history: [...current.history, { at: now, action: "reddedildi", note }],
    }));
    return { proposal: updated as Proposal };
  }

  const services = proposal.items.filter(isItemIncluded).map((item) => item.service);
  const totals = computeProposalTotals(proposal.items, proposal.discountRate, proposal.vatRate);
  const monthlyFee = options.monthlyFee !== undefined && Number.isFinite(options.monthlyFee) && options.monthlyFee >= 0
    ? options.monthlyFee
    : undefined;

  // Link to the existing client when the proposal was made for one, otherwise create a new client.
  const existing = proposal.clientId ? await crmRepositories.clients.findById(proposal.clientId) : null;
  const client = existing
    ? await crmRepositories.clients.update(existing.id, (current) => ({
        status: "aktif",
        services: Array.from(new Set([...current.services, ...services])),
        monthlyFee: monthlyFee ?? current.monthlyFee,
        endDate: options.endDate ?? current.endDate,
        proposalId: proposal.id,
      }))
    : await crmRepositories.clients.create({
        name: proposal.clientName,
        contactName: proposal.contactName,
        phone: proposal.phone,
        email: proposal.email,
        sector: "",
        address: "",
        instagram: "",
        website: "",
        status: "aktif",
        services,
        monthlyFee,
        startDate: today(),
        endDate: options.endDate,
        notes: `${proposal.number} numaralı teklif onayıyla eklendi.${note ? `\n${note}` : ""}`,
        source: "teklif",
        proposalId: proposal.id,
      });

  let payment: Payment | undefined;
  if (options.createPayment) {
    payment = await crmRepositories.payments.create(
      normalizePayment({
        clientId: client?.id,
        clientName: proposal.clientName,
        description: `${proposal.number} – ${proposal.title}`,
        amount: monthlyFee ?? totals.total,
        dueDate: options.paymentDueDate || today(),
        recurring: monthlyFee !== undefined,
        proposalId: proposal.id,
        notes: "",
      })
    );
  }

  const updated = await crmRepositories.proposals.update(id, (current) => ({
    status: "onaylandi",
    decidedAt: now,
    decisionNote: note,
    clientId: client?.id,
    history: [...current.history, { at: now, action: "onaylandi", note }],
  }));
  return { proposal: updated as Proposal, client: client ?? undefined, payment };
}

/**
 * Updates a payment. When a recurring payment is marked as paid for the first time,
 * next month's payment is created automatically (once).
 */
export async function updatePayment(id: string, input: unknown): Promise<{ payment: Payment; next?: Payment } | null> {
  const data = normalizePayment(input);
  const current = await crmRepositories.payments.findById(id);
  if (!current) return null;

  let next: Payment | undefined;
  let nextPaymentId = current.nextPaymentId;
  if (data.recurring && data.paidDate && !current.nextPaymentId) {
    next = await crmRepositories.payments.create({
      ...data,
      dueDate: addOneMonth(data.dueDate),
      paidDate: undefined,
      method: undefined,
      notes: "",
      nextPaymentId: undefined,
    });
    nextPaymentId = next.id;
  }
  const payment = await crmRepositories.payments.update(id, () => ({ ...data, nextPaymentId }));
  return payment ? { payment, next } : null;
}
