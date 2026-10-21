import { createHmac, randomBytes } from "node:crypto";
import { normalizeSignaturePrice } from "@/lib/orders/calc";

/**
 * Minimal iyzico client for the hosted Checkout Form (kart bilgisi sitemizden geçmez).
 * Auth: IYZWSv2 / HMAC-SHA256 — signature = hex(HMAC(secret, randomKey + uriPath + body)),
 * header "Authorization: IYZWSv2 base64(apiKey:..&randomKey:..&signature:..)" + "x-iyzi-rnd".
 * Responses are checked with iyzico's response signature (HMAC-SHA256 of ":"-joined fields).
 * Docs: https://docs.iyzico.com (HMACSHA256 Auth, Checkout Form, Response Signature Validation)
 */

export class IyzicoConfigError extends Error {}
export class IyzicoApiError extends Error {}

export const IYZICO_BASE_URLS = {
  sandbox: "https://sandbox-api.iyzipay.com",
  live: "https://api.iyzipay.com",
} as const;

export interface IyzicoConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  mode: "sandbox" | "live";
}

export function getIyzicoConfig(): IyzicoConfig {
  const apiKey = process.env.IYZICO_API_KEY || "";
  const secretKey = process.env.IYZICO_SECRET_KEY || "";
  if (!apiKey || !secretKey) {
    throw new IyzicoConfigError("iyzico anahtarları tanımlı değil (IYZICO_API_KEY, IYZICO_SECRET_KEY).");
  }
  const mode = process.env.IYZICO_MODE === "live" ? "live" : "sandbox";
  return { apiKey, secretKey, mode, baseUrl: process.env.IYZICO_BASE_URL || IYZICO_BASE_URLS[mode] };
}

export function iyzicoStatus(): { configured: boolean; mode: "sandbox" | "live" } {
  try {
    return { configured: true, mode: getIyzicoConfig().mode };
  } catch {
    return { configured: false, mode: process.env.IYZICO_MODE === "live" ? "live" : "sandbox" };
  }
}

/** Builds the IYZWSv2 Authorization header for one request. */
export function buildAuthorization(config: Pick<IyzicoConfig, "apiKey" | "secretKey">, uriPath: string, body: string, randomKey: string): string {
  const signature = createHmac("sha256", config.secretKey).update(randomKey + uriPath + body).digest("hex");
  const authString = `apiKey:${config.apiKey}&randomKey:${randomKey}&signature:${signature}`;
  return `IYZWSv2 ${Buffer.from(authString, "utf8").toString("base64")}`;
}

/** iyzico response signature: hex HMAC-SHA256 of the listed values joined with ":". */
export function responseSignature(secretKey: string, values: (string | number | undefined)[]): string {
  return createHmac("sha256", secretKey).update(values.map((value) => (value === undefined ? "" : String(value))).join(":")).digest("hex");
}

async function post<T>(config: IyzicoConfig, uriPath: string, payload: unknown): Promise<T> {
  const body = JSON.stringify(payload);
  const randomKey = `${Date.now()}${randomBytes(6).toString("hex")}`;
  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}${uriPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: buildAuthorization(config, uriPath, body, randomKey),
        "x-iyzi-rnd": randomKey,
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    throw new IyzicoApiError(`iyzico'ya bağlanılamadı: ${(error as Error).message}`);
  }
  const data = (await response.json().catch(() => null)) as T | null;
  if (!data) throw new IyzicoApiError(`iyzico geçersiz yanıt döndürdü (HTTP ${response.status})`);
  return data;
}

interface IyzicoBase {
  status: "success" | "failure";
  errorCode?: string;
  errorMessage?: string;
  conversationId?: string;
  signature?: string;
}

export interface CheckoutFormInitRequest {
  conversationId: string;
  price: string;
  paidPrice: string;
  basketId: string;
  callbackUrl: string;
  enabledInstallments: number[];
  buyer: {
    id: string;
    name: string;
    surname: string;
    gsmNumber: string;
    email: string;
    identityNumber: string;
    registrationAddress: string;
    ip: string;
    city: string;
    country: string;
  };
  billingAddress: { contactName: string; city: string; country: string; address: string };
  shippingAddress: { contactName: string; city: string; country: string; address: string };
  basketItems: { id: string; name: string; category1: string; itemType: "VIRTUAL"; price: string }[];
}

export interface CheckoutFormInitResponse extends IyzicoBase {
  signatureValid?: boolean; // false = iyzico signature did not match (recorded, not fatal)
  token?: string;
  paymentPageUrl?: string;
  checkoutFormContent?: string;
}

export interface CheckoutFormResult extends IyzicoBase {
  signatureValid?: boolean;
  token?: string;
  paymentStatus?: "SUCCESS" | "FAILURE" | "INIT_THREEDS" | "CALLBACK_THREEDS" | "BKM_POS_SELECTED" | string;
  paymentId?: string;
  basketId?: string;
  currency?: string;
  price?: number | string;
  paidPrice?: number | string;
  installment?: number;
  fraudStatus?: number;
  cardAssociation?: string;
  cardFamily?: string;
  lastFourDigits?: string;
}

export async function initializeCheckoutForm(request: CheckoutFormInitRequest, config = getIyzicoConfig()): Promise<CheckoutFormInitResponse> {
  const uriPath = "/payment/iyzipos/checkoutform/initialize/auth/ecom";
  const response = await post<CheckoutFormInitResponse>(config, uriPath, {
    locale: "tr",
    currency: "TRY",
    paymentGroup: "PRODUCT",
    ...request,
  });
  if (response.status !== "success" || !response.token) {
    throw new IyzicoApiError(response.errorMessage || "iyzico ödeme formu başlatılamadı");
  }
  if (response.signature) {
    response.signatureValid = responseSignature(config.secretKey, [response.conversationId, response.token]) === response.signature;
  }
  return response;
}

/** Fetches and verifies the result of a Checkout Form payment (call this from the callback). */
export async function retrieveCheckoutForm(token: string, conversationId?: string, config = getIyzicoConfig()): Promise<CheckoutFormResult> {
  const uriPath = "/payment/iyzipos/checkoutform/auth/ecom/detail";
  const result = await post<CheckoutFormResult>(config, uriPath, { locale: "tr", token, ...(conversationId ? { conversationId } : {}) });
  if (result.status === "success" && result.signature) {
    const expected = responseSignature(config.secretKey, [
      result.paymentStatus,
      result.paymentId,
      result.currency,
      result.basketId,
      result.conversationId,
      normalizeSignaturePrice(result.paidPrice),
      normalizeSignaturePrice(result.price),
      result.token,
    ]);
    // The data comes straight from iyzico over TLS; a mismatch is recorded for review, while
    // the order checks (basketId, price, currency, status) decide whether the payment counts.
    result.signatureValid = expected === result.signature;
  }
  return result;
}
