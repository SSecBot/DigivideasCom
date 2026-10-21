import { Order, OrderEmailLog, OrderItem, OrderSource, OrderView } from "@/lib/orders/types";
import {
  canBePaid,
  iyzicoBasketLines,
  isValidTckn,
  nextOrderNumber,
  orderTotals,
  splitFullName,
  toGsmNumber,
  toIyzicoPrice,
} from "@/lib/orders/calc";
import { orderRepository } from "@/lib/server/repositories/order-repository";
import { crmRepositories } from "@/lib/server/repositories/crm-repository";
import { contentRepository } from "@/lib/server/repositories/content-repository";
import { hashToken, newToken, openSecret, sealSecret } from "@/lib/server/security/secret-box";
import { initializeCheckoutForm, retrieveCheckoutForm } from "@/lib/server/payments/iyzico";
import { sendMail } from "@/lib/server/mail/mailer";
import { readMailSettings } from "@/lib/server/mail/mail-settings";
import { adminPaidNotification, paymentLinkEmail, paymentReceiptEmail } from "@/lib/server/mail/order-emails";
import { companyVariables, renderTemplate } from "@/lib/legal/templates";
import { getSiteUrl } from "@/lib/seo/site";
import { clampString } from "@/lib/utils/sanitize";

/** Business rules for orders and their iyzico payment links. */

export class OrderError extends Error {}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DEFAULT_LINK_DAYS = 7;
const ADMIN_PATH = process.env.NEXT_PUBLIC_ADMIN_ROUTE || "/dashboard/admin/digivideas";
type Raw = Record<string, unknown>;

const text = (value: unknown, max: number) => clampString(value, max).trim();
const formatTL = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value);

function expiryFromDays(days: unknown): string {
  const value = Math.round(Number(days));
  const safe = Number.isFinite(value) && value >= 1 && value <= 60 ? value : DEFAULT_LINK_DAYS;
  return new Date(Date.now() + safe * 24 * 60 * 60 * 1000).toISOString();
}

function normalizeItems(input: unknown): OrderItem[] {
  if (!Array.isArray(input) || input.length === 0) throw new OrderError("En az bir kalem ekleyin");
  if (input.length > 50) throw new OrderError("En fazla 50 kalem eklenebilir");
  return input.map((rawItem, index) => {
    const raw = (rawItem ?? {}) as Raw;
    const name = text(raw.name, 150);
    const quantity = Math.round(Number(raw.quantity));
    const unitPrice = Math.round(Number(raw.unitPrice) * 100) / 100;
    if (!name) throw new OrderError(`${index + 1}. kalemin adı zorunlu`);
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 1000) throw new OrderError(`${index + 1}. kalemin adedi geçersiz`);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0 || unitPrice > 10_000_000) throw new OrderError(`${index + 1}. kalemin fiyatı geçersiz`);
    return {
      id: text(raw.id, 60).replace(/[^a-zA-Z0-9_-]/g, "") || `kalem-${index + 1}`,
      name,
      description: text(raw.description, 500),
      quantity,
      unitPrice,
    };
  });
}

function normalizeOrderInput(input: unknown) {
  const raw = (input ?? {}) as Raw;
  const customer = (raw.customer ?? {}) as Raw;
  const fullName = text(customer.fullName, 120);
  const email = text(customer.email, 200).toLowerCase();
  const phone = text(customer.phone, 30);
  if (fullName.length < 3) throw new OrderError("Müşterinin adı soyadı zorunlu");
  if (!EMAIL.test(email)) throw new OrderError("Müşterinin e-posta adresi geçersiz");
  if (phone.replace(/[^0-9]/g, "").length < 10) throw new OrderError("Müşterinin telefon numarası geçersiz");
  const sourceRaw = (raw.source ?? {}) as Raw;
  const sourceType = ["manuel", "talep", "teklif", "musteri", "odeme"].includes(sourceRaw.type as string)
    ? (sourceRaw.type as OrderSource["type"])
    : "manuel";
  const items = normalizeItems(raw.items);
  const vatRate = Math.min(100, Math.max(0, Number(raw.vatRate ?? 20) || 0));
  if (orderTotals(items, vatRate).total < 1) throw new OrderError("Toplam tutar en az 1 TL olmalı");
  return {
    title: text(raw.title, 200) || "Hizmet bedeli",
    customer: { fullName, email, phone, company: text(customer.company, 160) || undefined },
    items,
    vatRate,
    note: text(raw.note, 2000),
    internalNote: text(raw.internalNote, 2000),
    source: { type: sourceType, id: text(sourceRaw.id, 80) || undefined, label: text(sourceRaw.label, 160) || undefined },
    clientId: text(raw.clientId, 80) || undefined,
    crmPaymentId: text(raw.crmPaymentId, 80) || undefined,
  };
}

function freshLink(days: unknown) {
  const token = newToken();
  return { token, tokenHash: hashToken(token), tokenSealed: sealSecret(token), linkExpiresAt: expiryFromDays(days) };
}

export function paymentUrlFor(order: Order): string | undefined {
  if (!order.tokenSealed) return undefined;
  try {
    return `${getSiteUrl()}/odeme/${openSecret(order.tokenSealed)}`;
  } catch {
    return undefined;
  }
}

export function toOrderView(order: Order): OrderView {
  const { tokenHash, tokenSealed, ...rest } = order;
  void tokenHash;
  void tokenSealed;
  return { ...rest, paymentUrl: paymentUrlFor(order) };
}

export async function createOrder(input: unknown): Promise<Order> {
  const data = normalizeOrderInput(input);
  const existing = await orderRepository.list();
  const { tokenHash, tokenSealed, linkExpiresAt } = freshLink((input as Raw)?.linkValidDays);
  const now = new Date().toISOString();
  return orderRepository.create({
    ...data,
    number: nextOrderNumber(existing.map((order) => order.number), new Date().getFullYear()),
    status: "beklemede",
    tokenHash,
    tokenSealed,
    linkExpiresAt,
    emailLog: [],
    iyzico: {},
    attempts: 0,
    history: [{ at: now, action: "olusturuldu", note: data.source.label }],
  });
}

export async function updateOrder(id: string, input: unknown): Promise<Order | null> {
  const data = normalizeOrderInput(input);
  return orderRepository.update(id, (current) => {
    if (current.status === "odendi" || current.status === "iptal") {
      throw new OrderError("Ödenmiş veya iptal edilmiş sipariş düzenlenemez");
    }
    return { ...data, history: [...current.history, { at: new Date().toISOString(), action: "duzenlendi" }] };
  });
}

export async function regenerateLink(id: string, days: unknown): Promise<Order | null> {
  const link = freshLink(days);
  return orderRepository.update(id, (current) => {
    if (current.status === "odendi" || current.status === "iptal") throw new OrderError("Bu sipariş için yeni link oluşturulamaz");
    return {
      tokenHash: link.tokenHash,
      tokenSealed: link.tokenSealed,
      linkExpiresAt: link.linkExpiresAt,
      history: [...current.history, { at: new Date().toISOString(), action: "link_olusturuldu", note: "Eski link geçersiz kılındı" }],
    };
  });
}

export async function cancelOrder(id: string, note?: string): Promise<Order | null> {
  return orderRepository.update(id, (current) => {
    if (current.status === "odendi") throw new OrderError("Ödenmiş sipariş iptal edilemez (iade için iyzico panelini kullanın)");
    return {
      status: "iptal",
      history: [...current.history, { at: new Date().toISOString(), action: "iptal_edildi", note: note?.slice(0, 300) }],
    };
  });
}

async function companyName(): Promise<string> {
  const { narrative } = await contentRepository.getAll();
  return narrative.companyTitle || "digivideas";
}

/** E-mails the private payment link to the customer from the admin-configured address. */
export async function sendPaymentLink(id: string): Promise<Order> {
  const order = await orderRepository.findById(id);
  if (!order) throw new OrderError("Sipariş bulunamadı");
  if (!canBePaid(order)) throw new OrderError("Bu siparişin linki geçerli değil (ödenmiş, iptal edilmiş ya da süresi dolmuş)");
  const url = paymentUrlFor(order);
  if (!url) throw new OrderError("Ödeme linki okunamadı; yeni link oluşturun");

  const email = paymentLinkEmail(order, url, getSiteUrl(), await companyName());
  const at = new Date().toISOString();
  try {
    await sendMail({ to: order.customer.email, ...email });
  } catch (error) {
    await orderRepository.update(id, (current) => ({
      emailLog: [...current.emailLog, { at, to: order.customer.email, kind: "odeme_linki", ok: false, error: (error as Error).message }],
    }));
    throw new OrderError(`E-posta gönderilemedi: ${(error as Error).message}`);
  }
  return (await orderRepository.update(id, (current) => ({
    status: current.status === "beklemede" || current.status === "basarisiz" ? "link_gonderildi" : current.status,
    emailLog: [...current.emailLog, { at, to: order.customer.email, kind: "odeme_linki", ok: true }],
    history: [...current.history, { at, action: "link_gonderildi", note: order.customer.email }],
  }))) as Order;
}

/** Fills the distance sales contract with the order and buyer details. */
export async function renderDistanceSalesContract(order: Order, buyer?: { address?: string }): Promise<string> {
  const { legalPages, narrative } = await contentRepository.getAll();
  const page = legalPages.find((item) => item.slug === "mesafeli-satis-sozlesmesi");
  const totals = orderTotals(order.items, order.vatRate);
  const list = order.items
    .map((item) => `- ${item.name}${item.description ? ` – ${item.description}` : ""}: ${item.quantity} × ${formatTL(item.unitPrice)} (KDV hariç)`)
    .join("\n");
  return renderTemplate(page?.content ?? "", {
    ...companyVariables(narrative, getSiteUrl()),
    alici_adi: order.customer.fullName,
    alici_eposta: order.customer.email,
    alici_telefon: order.customer.phone,
    alici_adres: buyer?.address || order.customer.address || "",
    siparis_no: order.number,
    hizmet_listesi: `${list}\n- KDV (%${order.vatRate}): ${formatTL(totals.vat)}`,
    siparis_tutari: formatTL(totals.total),
    tarih: new Date(order.createdAt).toLocaleDateString("tr-TR"),
  });
}

export interface CheckoutBuyerInput {
  fullName?: unknown;
  phone?: unknown;
  identityNumber?: unknown;
  address?: unknown;
  city?: unknown;
  acceptedAgreements?: unknown;
}

/** Starts the iyzico Checkout Form for a payment link; returns iyzico's hosted page URL. */
export async function startCheckout(token: string, input: CheckoutBuyerInput, ip: string): Promise<string> {
  const order = await orderRepository.findByTokenHash(hashToken(token));
  if (!order || !canBePaid(order)) throw new OrderError("Bu ödeme bağlantısı geçerli değil veya süresi dolmuş.");
  if (input.acceptedAgreements !== true) throw new OrderError("Devam etmek için sözleşmeleri onaylamanız gerekir.");

  const fullName = text(input.fullName, 120) || order.customer.fullName;
  const phone = text(input.phone, 30) || order.customer.phone;
  const identityNumber = text(input.identityNumber, 11);
  const address = text(input.address, 400);
  const city = text(input.city, 80);
  if (fullName.length < 3) throw new OrderError("Ad soyad zorunlu");
  if (phone.replace(/[^0-9]/g, "").length < 10) throw new OrderError("Geçerli bir telefon numarası girin");
  if (address.length < 10) throw new OrderError("Fatura adresinizi eksiksiz girin");
  if (city.length < 2) throw new OrderError("Şehir zorunlu");
  if (identityNumber && !isValidTckn(identityNumber)) throw new OrderError("T.C. kimlik numarası geçersiz");

  const totals = orderTotals(order.items, order.vatRate);
  const lines = iyzicoBasketLines(order.items, order.vatRate);
  const { name, surname } = splitFullName(fullName);
  const attempt = order.attempts + 1;
  const conversationId = `${order.number}-${attempt}`;
  const contract = await renderDistanceSalesContract({ ...order, customer: { ...order.customer, fullName, phone } }, { address });
  const addressBlock = { contactName: fullName, city, country: "Turkey", address };

  const response = await initializeCheckoutForm({
    conversationId,
    price: toIyzicoPrice(totals.total),
    paidPrice: toIyzicoPrice(totals.total),
    basketId: order.id,
    callbackUrl: `${getSiteUrl()}/api/odeme/iyzico-callback`,
    enabledInstallments: [1, 2, 3, 6, 9],
    buyer: {
      id: order.id,
      name,
      surname,
      gsmNumber: toGsmNumber(phone),
      email: order.customer.email,
      identityNumber: identityNumber || "11111111111",
      registrationAddress: address,
      ip: ip.slice(0, 64),
      city,
      country: "Turkey",
    },
    billingAddress: addressBlock,
    shippingAddress: addressBlock,
    basketItems: lines.map((line) => ({ id: line.id, name: line.name.slice(0, 100), category1: "Dijital Hizmet", itemType: "VIRTUAL", price: toIyzicoPrice(line.price) })),
  });

  const now = new Date().toISOString();
  await orderRepository.update(order.id, (current) => ({
    attempts: attempt,
    customer: { ...current.customer, fullName, phone, identityNumber: identityNumber || undefined, address, city },
    agreementAcceptedAt: now,
    agreementSnapshot: contract,
    buyerIp: ip.slice(0, 64),
    iyzico: { ...current.iyzico, conversationId, checkoutToken: response.token, lastError: undefined },
    history: [
      ...current.history,
      {
        at: now,
        action: "odeme_baslatildi",
        note: `${attempt}. deneme${response.signatureValid === false ? " · iyzico yanıt imzası eşleşmedi" : ""}`,
      },
    ],
  }));
  if (!response.paymentPageUrl) throw new OrderError("iyzico ödeme sayfası adresi alınamadı");
  return response.paymentPageUrl;
}

/** Marks the linked (or a new) CRM "Ödemeler" record as paid by card. */
async function syncCrmPayment(order: Order) {
  const total = orderTotals(order.items, order.vatRate).total;
  // Turkish calendar date (UTC+3, no DST), so a payment at 00:30 is not booked on the previous day
  const today = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const note = `iyzico ödeme no: ${order.iyzico.paymentId ?? "-"} (${order.number})`;
  const linked = order.crmPaymentId ? await crmRepositories.payments.findById(order.crmPaymentId) : null;
  if (linked) {
    await crmRepositories.payments.update(linked.id, (current) => ({
      paidDate: current.paidDate ?? today,
      method: "kart",
      notes: [current.notes, note].filter(Boolean).join("\n"),
    }));
    return;
  }
  await crmRepositories.payments.create({
    clientId: order.clientId,
    clientName: order.customer.company || order.customer.fullName,
    description: `${order.number} – ${order.title}`,
    amount: total,
    dueDate: today,
    paidDate: today,
    method: "kart",
    recurring: false,
    notes: note,
  });
}

export type CheckoutOutcome = "odendi" | "basarisiz" | "zaten_odendi";

/**
 * Handles iyzico's callback token: fetches the result from iyzico and only marks the order
 * paid when status, order id, amount and currency all match. Safe to call twice.
 */
export async function completeCheckout(checkoutToken: string): Promise<{ order: Order; outcome: CheckoutOutcome } | null> {
  const order = await orderRepository.findByCheckoutToken(checkoutToken);
  if (!order) return null;
  if (order.status === "odendi") return { order, outcome: "zaten_odendi" };

  const result = await retrieveCheckoutForm(checkoutToken, order.iyzico.conversationId);
  const expectedTotal = orderTotals(order.items, order.vatRate).total;
  const paid =
    result.status === "success" &&
    result.paymentStatus === "SUCCESS" &&
    result.basketId === order.id &&
    (result.currency ?? "TRY") === "TRY" &&
    Math.abs(Number(result.price) - expectedTotal) < 0.01;
  const now = new Date().toISOString();

  if (!paid) {
    const reason = result.errorMessage || (result.paymentStatus ? `Ödeme durumu: ${result.paymentStatus}` : "Ödeme tamamlanmadı");
    const updated = await orderRepository.update(order.id, (current) => ({
      status: current.status === "odendi" ? current.status : "basarisiz",
      iyzico: { ...current.iyzico, lastError: reason },
      history: [...current.history, { at: now, action: "odeme_basarisiz", note: reason }],
    }));
    return { order: updated as Order, outcome: "basarisiz" };
  }

  const updated = (await orderRepository.update(order.id, (current) => {
    if (current.status === "odendi") return null;
    return {
      status: "odendi",
      paidAt: now,
      iyzico: {
        ...current.iyzico,
        paymentId: result.paymentId,
        paidPrice: String(result.paidPrice ?? ""),
        installment: result.installment,
        cardAssociation: result.cardAssociation,
        cardFamily: result.cardFamily,
        lastFourDigits: result.lastFourDigits,
        fraudStatus: result.fraudStatus,
        lastError: undefined,
      },
      history: [
        ...current.history,
        { at: now, action: "odendi", note: `iyzico ödeme no: ${result.paymentId}${result.signatureValid === false ? " · imza eşleşmedi, iyzico panelinden kontrol edin" : ""}` },
      ],
    };
  })) as Order;

  // Side effects must never undo a successful payment
  await syncCrmPayment(updated).catch((error) => console.error("[sipariş] CRM ödeme kaydı güncellenemedi:", error));
  const name = await companyName();
  const settings = await readMailSettings();
  const emails: { to: string; kind: "odeme_onayi" | "yonetici_bildirimi"; message: { subject: string; html: string; text: string } }[] = [
    { to: updated.customer.email, kind: "odeme_onayi", message: paymentReceiptEmail(updated, getSiteUrl(), name) },
  ];
  if (settings.notifyEmail) {
    emails.push({ to: settings.notifyEmail, kind: "yonetici_bildirimi", message: adminPaidNotification(updated, `${getSiteUrl()}${ADMIN_PATH}`) });
  }
  const log: OrderEmailLog[] = [];
  for (const email of emails) {
    try {
      await sendMail({ to: email.to, ...email.message });
      log.push({ at: now, to: email.to, kind: email.kind, ok: true });
    } catch (error) {
      log.push({ at: now, to: email.to, kind: email.kind, ok: false, error: (error as Error).message });
    }
  }
  const final = await orderRepository.update(updated.id, (current) => ({ emailLog: [...current.emailLog, ...log] }));
  return { order: final as Order, outcome: "odendi" };
}
