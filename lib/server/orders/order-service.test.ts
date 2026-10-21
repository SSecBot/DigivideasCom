import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// iyzico and SMTP are replaced by fakes: no network calls in tests
const iyzico = vi.hoisted(() => ({
  initializeCheckoutForm: vi.fn(),
  retrieveCheckoutForm: vi.fn(),
}));
vi.mock("@/lib/server/payments/iyzico", async (original) => ({
  ...(await original<typeof import("@/lib/server/payments/iyzico")>()),
  initializeCheckoutForm: iyzico.initializeCheckoutForm,
  retrieveCheckoutForm: iyzico.retrieveCheckoutForm,
}));
const mailer = vi.hoisted(() => ({ sendMail: vi.fn() }));
vi.mock("@/lib/server/mail/mailer", () => mailer);

import { OrderError, cancelOrder, completeCheckout, createOrder, paymentUrlFor, sendPaymentLink, startCheckout } from "@/lib/server/orders/order-service";
import { orderRepository } from "@/lib/server/repositories/order-repository";
import { crmRepositories } from "@/lib/server/repositories/crm-repository";
import { saveMailSettings } from "@/lib/server/mail/mail-settings";

const previousEnv = { ...process.env };
let dataDir = "";

beforeEach(() => {
  if (dataDir) rmSync(dataDir, { recursive: true, force: true });
  dataDir = mkdtempSync(path.join(tmpdir(), "dv-orders-"));
  process.env.DATA_DIR = dataDir;
  process.env.ADMIN_SESSION_SECRET = "test-secret-that-is-definitely-longer-than-32-chars";
  process.env.NEXT_PUBLIC_SITE_URL = "https://digivideas.test";
  iyzico.initializeCheckoutForm.mockReset();
  iyzico.retrieveCheckoutForm.mockReset();
  mailer.sendMail.mockReset();
});

afterAll(() => {
  if (dataDir) rmSync(dataDir, { recursive: true, force: true });
  process.env = previousEnv;
});

const orderInput = {
  title: "Ekim sosyal medya yönetimi",
  customer: { fullName: "Ayşe Yılmaz", email: "ayse@ornek.com", phone: "0532 111 22 33" },
  items: [{ name: "Sosyal Medya Yönetimi", quantity: 1, unitPrice: 10_000 }],
  vatRate: 20,
};
const buyer = { fullName: "Ayşe Yılmaz", phone: "0532 111 22 33", address: "Atatürk Cd. No:1 Torbalı", city: "İzmir", acceptedAgreements: true };

function tokenOf(url: string | undefined): string {
  return (url ?? "").split("/odeme/")[1];
}

async function startedOrder() {
  const order = await createOrder(orderInput);
  iyzico.initializeCheckoutForm.mockResolvedValue({ status: "success", token: "cf-token-1", paymentPageUrl: "https://sandbox-cpp.iyzipay.com/?token=cf-token-1", signatureValid: true });
  await startCheckout(tokenOf(paymentUrlFor(order)), buyer, "1.2.3.4");
  return order;
}

describe("payment links", () => {
  it("creates a private hashed link that resolves to the order (Happy Path)", async () => {
    // 1. Arrange & 2. Act
    const order = await createOrder(orderInput);
    const url = paymentUrlFor(order);

    // 3. Assert
    expect(order.number).toMatch(/^SIP-\d{4}-0001$/);
    expect(url).toMatch(/^https:\/\/digivideas\.test\/odeme\/[A-Za-z0-9_-]{43}$/);
    expect(JSON.stringify(order)).not.toContain(tokenOf(url)); // the raw token is never stored
    const { hashToken } = await import("@/lib/server/security/secret-box");
    expect((await orderRepository.findByTokenHash(hashToken(tokenOf(url))))?.id).toBe(order.id);
  });

  it("e-mails the link and records it (Edge Case 1: not configured → clear error)", async () => {
    // 1. Arrange
    const order = await createOrder(orderInput);
    mailer.sendMail.mockRejectedValueOnce(new Error("E-posta ayarları yapılmamış"));

    // 2. Act & 3. Assert
    await expect(sendPaymentLink(order.id)).rejects.toThrow(OrderError);
    mailer.sendMail.mockResolvedValueOnce(undefined);
    const sent = await sendPaymentLink(order.id);
    expect(sent.status).toBe("link_gonderildi");
    expect(sent.emailLog.map((entry) => entry.ok)).toEqual([false, true]);
    expect(mailer.sendMail.mock.calls[1][0]).toMatchObject({ to: "ayse@ornek.com" });
    expect(mailer.sendMail.mock.calls[1][0].html).toContain(paymentUrlFor(order));
  });

  it("refuses cancelled links, missing consent and invalid input (Edge Case 2)", async () => {
    // 1. Arrange
    const order = await createOrder(orderInput);
    const token = tokenOf(paymentUrlFor(order));

    // 2. Act & 3. Assert
    await expect(startCheckout(token, { ...buyer, acceptedAgreements: false }, "1.2.3.4")).rejects.toThrow("sözleşmeleri onaylamanız");
    await expect(startCheckout(token, { ...buyer, identityNumber: "12345678901" }, "1.2.3.4")).rejects.toThrow("kimlik");
    await cancelOrder(order.id);
    await expect(startCheckout(token, buyer, "1.2.3.4")).rejects.toThrow("geçerli değil");
    await expect(createOrder({ ...orderInput, customer: { ...orderInput.customer, email: "x" } })).rejects.toThrow(OrderError);
    expect(iyzico.initializeCheckoutForm).not.toHaveBeenCalled();
  });
});

describe("iyzico checkout", () => {
  it("sends the right amount to iyzico and stores the accepted contract (Happy Path)", async () => {
    // 1. Arrange & 2. Act
    const order = await startedOrder();

    // 3. Assert
    const request = iyzico.initializeCheckoutForm.mock.calls[0][0];
    expect(request).toMatchObject({ price: "12000.00", paidPrice: "12000.00", basketId: order.id, callbackUrl: "https://digivideas.test/api/odeme/iyzico-callback" });
    expect(request.buyer).toMatchObject({ name: "Ayşe", surname: "Yılmaz", gsmNumber: "+905321112233", identityNumber: "11111111111", ip: "1.2.3.4" });
    expect(request.basketItems).toEqual([{ id: "kalem-1", name: "Sosyal Medya Yönetimi", category1: "Dijital Hizmet", itemType: "VIRTUAL", price: "12000.00" }]);
    const stored = await orderRepository.findById(order.id);
    expect(stored?.iyzico.checkoutToken).toBe("cf-token-1");
    expect(stored?.agreementSnapshot).toContain("Ayşe Yılmaz");
    expect(stored?.agreementSnapshot).toContain(order.number);
  });

  it("marks the order paid, syncs Ödemeler and sends e-mails exactly once (Edge Case 1: duplicate callback)", async () => {
    // 1. Arrange
    const order = await startedOrder();
    await saveMailSettings({ host: "smtp.ornek.com", port: 587, fromEmail: "info@digivideas.test", notifyEmail: "muaz@digivideas.test" });
    iyzico.retrieveCheckoutForm.mockResolvedValue({
      status: "success", paymentStatus: "SUCCESS", paymentId: "PAY-1", basketId: order.id, currency: "TRY",
      price: 12000, paidPrice: 12360.5, installment: 3, signatureValid: true,
    });

    // 2. Act
    const first = await completeCheckout("cf-token-1");
    const second = await completeCheckout("cf-token-1");

    // 3. Assert
    expect(first?.outcome).toBe("odendi");
    expect(first?.order).toMatchObject({ status: "odendi", iyzico: { paymentId: "PAY-1", installment: 3 } });
    expect(second?.outcome).toBe("zaten_odendi");
    expect(mailer.sendMail).toHaveBeenCalledTimes(2); // receipt + admin notification, only once
    expect(mailer.sendMail.mock.calls.map((call) => call[0].to).sort()).toEqual(["ayse@ornek.com", "muaz@digivideas.test"]);
    const payments = await crmRepositories.payments.list();
    expect(payments).toHaveLength(1);
    expect(payments[0]).toMatchObject({ amount: 12000, method: "kart" });
    expect(payments[0].paidDate).toBeTruthy();
  });

  it("never marks paid when amount, order or status do not match (Edge Case 2)", async () => {
    // 1. Arrange
    const order = await startedOrder();
    const base = { status: "success", paymentStatus: "SUCCESS", paymentId: "P", basketId: order.id, currency: "TRY", price: 12000 };

    // 2. Act & 3. Assert
    for (const tampered of [{ price: 1 }, { basketId: "ord-other" }, { currency: "USD" }, { paymentStatus: "FAILURE" }, { status: "failure", errorMessage: "Kart reddedildi" }]) {
      iyzico.retrieveCheckoutForm.mockResolvedValueOnce({ ...base, ...tampered });
      const result = await completeCheckout("cf-token-1");
      expect(result?.outcome).toBe("basarisiz");
    }
    const stored = await orderRepository.findById(order.id);
    expect(stored?.status).toBe("basarisiz");
    expect(stored?.iyzico.lastError).toBe("Kart reddedildi");
    expect(await crmRepositories.payments.list()).toHaveLength(0);
    expect(await completeCheckout("unknown-token")).toBeNull();
  });
});
