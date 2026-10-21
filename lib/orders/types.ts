/** Orders (sipariş talepleri) paid through private, hashed iyzico payment links. */

export type OrderStatus = "beklemede" | "link_gonderildi" | "odendi" | "basarisiz" | "iptal";

export const ORDER_STATUS_LABELS: Record<OrderStatus | "suresi_doldu", string> = {
  beklemede: "Link gönderilmedi",
  link_gonderildi: "Ödeme bekleniyor",
  odendi: "Ödendi",
  basarisiz: "Ödeme başarısız",
  iptal: "İptal edildi",
  suresi_doldu: "Linkin süresi doldu",
};

export interface OrderItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number; // TL, KDV hariç
}

export interface OrderCustomer {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  identityNumber?: string; // TCKN (iyzico zorunlu alan; boşsa 11111111111 gönderilir)
  address?: string;
  city?: string;
}

export interface OrderSource {
  type: "manuel" | "talep" | "teklif" | "musteri" | "odeme";
  id?: string;
  label?: string;
}

export interface OrderEmailLog {
  at: string;
  to: string;
  kind: "odeme_linki" | "odeme_onayi" | "yonetici_bildirimi";
  ok: boolean;
  error?: string;
}

export interface OrderHistoryEntry {
  at: string;
  action:
    | "olusturuldu"
    | "duzenlendi"
    | "link_olusturuldu"
    | "link_gonderildi"
    | "odeme_baslatildi"
    | "odendi"
    | "odeme_basarisiz"
    | "iptal_edildi";
  note?: string;
}

export interface IyzicoPaymentInfo {
  conversationId?: string;
  checkoutToken?: string; // iyzico Checkout Form token of the latest attempt
  paymentId?: string;
  paidPrice?: string;
  installment?: number;
  cardAssociation?: string;
  cardFamily?: string;
  lastFourDigits?: string;
  fraudStatus?: number;
  lastError?: string;
}

export interface Order {
  id: string;
  number: string; // SIP-2026-0001
  title: string;
  status: OrderStatus;
  customer: OrderCustomer;
  items: OrderItem[];
  vatRate: number; // %
  note: string; // shown to the customer on the payment page
  internalNote: string;
  source: OrderSource;
  clientId?: string;
  crmPaymentId?: string; // CRM "Ödemeler" record marked paid automatically
  tokenHash?: string; // SHA-256 of the payment-link token (lookup)
  tokenSealed?: string; // encrypted token, so the admin can copy/resend the same link
  linkExpiresAt?: string; // ISO
  emailLog: OrderEmailLog[];
  iyzico: IyzicoPaymentInfo;
  attempts: number;
  agreementAcceptedAt?: string;
  agreementSnapshot?: string; // distance sales contract text the buyer accepted
  buyerIp?: string;
  paidAt?: string;
  history: OrderHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

/** What the admin UI receives (secrets stripped, link rebuilt server-side). */
export type OrderView = Omit<Order, "tokenHash" | "tokenSealed"> & { paymentUrl?: string };
