import { afterEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import {
  IyzicoApiError,
  IyzicoConfigError,
  buildAuthorization,
  getIyzicoConfig,
  initializeCheckoutForm,
  responseSignature,
  retrieveCheckoutForm,
} from "@/lib/server/payments/iyzico";

const config = { apiKey: "sandbox-api", secretKey: "sandbox-secret", baseUrl: "https://sandbox-api.iyzipay.com", mode: "sandbox" as const };

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetch(response: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({ status: 200, json: async () => response });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("IYZWSv2 authorization", () => {
  it("signs randomKey + uri path + body with HMAC-SHA256 as documented (Happy Path)", () => {
    // 1. Arrange
    const body = '{"locale":"tr"}';
    const expectedSignature = createHmac("sha256", "sandbox-secret").update("123/payment/bin/check" + body).digest("hex");

    // 2. Act
    const header = buildAuthorization(config, "/payment/bin/check", body, "123");

    // 3. Assert
    expect(header.startsWith("IYZWSv2 ")).toBe(true);
    expect(Buffer.from(header.slice(8), "base64").toString("utf8")).toBe(`apiKey:sandbox-api&randomKey:123&signature:${expectedSignature}`);
  });

  it("requires keys and defaults to the sandbox (Edge Case 1)", () => {
    // 1. Arrange
    const previous = { ...process.env };
    delete process.env.IYZICO_API_KEY;

    // 2. Act & 3. Assert
    expect(() => getIyzicoConfig()).toThrow(IyzicoConfigError);
    process.env.IYZICO_API_KEY = "k";
    process.env.IYZICO_SECRET_KEY = "s";
    delete process.env.IYZICO_MODE;
    expect(getIyzicoConfig().baseUrl).toBe("https://sandbox-api.iyzipay.com");
    process.env.IYZICO_MODE = "live";
    expect(getIyzicoConfig().baseUrl).toBe("https://api.iyzipay.com");
    process.env = previous;
  });

  it("joins response signature fields with ':' (Edge Case 2)", () => {
    // 1. Arrange & 2. Act
    const signature = responseSignature("s", ["conv-1", "tok-1"]);

    // 3. Assert
    expect(signature).toBe(createHmac("sha256", "s").update("conv-1:tok-1").digest("hex"));
  });
});

describe("Checkout Form calls", () => {
  const initRequest = {
    conversationId: "SIP-2026-0001-1",
    price: "1200.00",
    paidPrice: "1200.00",
    basketId: "ord-1",
    callbackUrl: "https://digivideas.com/api/odeme/iyzico-callback",
    enabledInstallments: [1, 2, 3],
    buyer: {
      id: "ord-1", name: "Ayşe", surname: "Yılmaz", gsmNumber: "+905321112233", email: "a@b.co",
      identityNumber: "11111111111", registrationAddress: "Adres 1", ip: "1.2.3.4", city: "İzmir", country: "Turkey",
    },
    billingAddress: { contactName: "Ayşe Yılmaz", city: "İzmir", country: "Turkey", address: "Adres 1" },
    shippingAddress: { contactName: "Ayşe Yılmaz", city: "İzmir", country: "Turkey", address: "Adres 1" },
    basketItems: [{ id: "a", name: "Hizmet", category1: "Dijital Hizmet", itemType: "VIRTUAL" as const, price: "1200.00" }],
  };

  it("initializes the hosted form with auth headers and checks the signature (Happy Path)", async () => {
    // 1. Arrange
    const signature = responseSignature("sandbox-secret", ["SIP-2026-0001-1", "tok-123"]);
    const fetchMock = mockFetch({ status: "success", conversationId: "SIP-2026-0001-1", token: "tok-123", paymentPageUrl: "https://sandbox-cpp.iyzipay.com?token=tok-123", signature });

    // 2. Act
    const response = await initializeCheckoutForm(initRequest, config);

    // 3. Assert
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://sandbox-api.iyzipay.com/payment/iyzipos/checkoutform/initialize/auth/ecom");
    expect(init.headers.Authorization).toMatch(/^IYZWSv2 /);
    expect(init.headers["x-iyzi-rnd"]).toBeTruthy();
    expect(JSON.parse(init.body)).toMatchObject({ locale: "tr", currency: "TRY", paymentGroup: "PRODUCT", basketId: "ord-1" });
    expect(response).toMatchObject({ token: "tok-123", signatureValid: true });
  });

  it("throws iyzico's error message on failure (Edge Case 1)", async () => {
    // 1. Arrange
    mockFetch({ status: "failure", errorCode: "1000", errorMessage: "Geçersiz imza" });

    // 2. Act & 3. Assert
    await expect(initializeCheckoutForm(initRequest, config)).rejects.toThrow("Geçersiz imza");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNRESET")));
    await expect(initializeCheckoutForm(initRequest, config)).rejects.toThrow(IyzicoApiError);
  });

  it("verifies the payment result signature with normalised prices (Edge Case 2)", async () => {
    // 1. Arrange
    const fields = { paymentStatus: "SUCCESS", paymentId: "99", currency: "TRY", basketId: "ord-1", conversationId: "c", paidPrice: 1250.5, price: 1200, token: "tok" };
    const good = responseSignature("sandbox-secret", ["SUCCESS", "99", "TRY", "ord-1", "c", "1250.5", "1200", "tok"]);
    mockFetch({ status: "success", ...fields, signature: good });

    // 2. Act
    const valid = await retrieveCheckoutForm("tok", "c", config);
    mockFetch({ status: "success", ...fields, signature: "tampered" });
    const invalid = await retrieveCheckoutForm("tok", "c", config);

    // 3. Assert
    expect(valid.signatureValid).toBe(true);
    expect(invalid.signatureValid).toBe(false);
  });
});
