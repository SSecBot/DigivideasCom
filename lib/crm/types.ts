/** Agency CRM: clients, proposals (teklifler), payments and calendar events. */

export type ClientStatus = "aktif" | "potansiyel" | "pasif";

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  aktif: "Aktif müşteri",
  potansiyel: "Potansiyel",
  pasif: "Pasif / ayrıldı",
};

export interface Client {
  id: string;
  name: string; // firma / marka
  contactName: string;
  phone: string;
  email: string;
  sector: string;
  address: string;
  instagram: string;
  website: string;
  status: ClientStatus;
  services: string[]; // hizmet aldığı kalemler
  monthlyFee?: number; // aylık sabit ücret (TL)
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD, sözleşme / hizmet bitiş tarihi
  notes: string;
  source: "manuel" | "teklif";
  proposalId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ProposalItem {
  id: string;
  service: string;
  description: string;
  quantity: number;
  unitPrice: number; // TL, KDV hariç
  optional: boolean; // müşteriye seçenek olarak sunulan kalem
  selected: boolean; // seçenekli kalem teklife dahil mi
}

export type ProposalStatus = "taslak" | "gonderildi" | "onaylandi" | "reddedildi";

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  taslak: "Taslak",
  gonderildi: "Gönderildi",
  onaylandi: "Onaylandı",
  reddedildi: "Reddedildi",
};

export interface ProposalHistoryEntry {
  at: string; // ISO
  action: "olusturuldu" | "duzenlendi" | "gonderildi" | "onaylandi" | "reddedildi" | "dosya_eklendi" | "dosya_silindi";
  note?: string;
}

/** A PDF uploaded to a proposal (stored privately under DATA_DIR/crm/files). */
export interface ProposalAttachment {
  id: string;
  name: string;
  size: number; // bytes
  uploadedAt: string; // ISO
}

export interface Proposal {
  id: string;
  number: string; // TKL-2026-001
  title: string;
  clientId?: string; // mevcut müşteriye verildiyse
  clientName: string;
  contactName: string;
  phone: string;
  email: string;
  items: ProposalItem[];
  discountRate: number; // %
  vatRate: number; // %
  validUntil?: string; // YYYY-MM-DD
  notes: string;
  status: ProposalStatus;
  decisionNote?: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
  history: ProposalHistoryEntry[];
  attachments?: ProposalAttachment[];
  deletedAt?: string;
}

export type PaymentMethod = "havale" | "nakit" | "kart" | "diger";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  havale: "Havale / EFT",
  nakit: "Nakit",
  kart: "Kredi kartı",
  diger: "Diğer",
};

export interface Payment {
  id: string;
  clientId?: string;
  clientName: string;
  description: string;
  amount: number; // TL
  dueDate: string; // YYYY-MM-DD
  paidDate?: string; // YYYY-MM-DD, set when collected
  method?: PaymentMethod;
  recurring: boolean; // aylık tekrar: ödendi işaretlenince bir sonraki ay otomatik oluşur
  nextPaymentId?: string; // tekrarlayan ödemede oluşturulan bir sonraki kayıt
  proposalId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export type PaymentState = "odendi" | "bekliyor" | "gecikti";

export type EventType = "toplanti" | "cekim" | "paylasim" | "gorev" | "diger";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  toplanti: "Toplantı",
  cekim: "Çekim",
  paylasim: "Paylaşım",
  gorev: "Görev",
  diger: "Diğer",
};

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  type: EventType;
  clientId?: string;
  done: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CrmCollections {
  clients: Client;
  proposals: Proposal;
  payments: Payment;
  events: CalendarEvent;
}

export type CrmCollection = keyof CrmCollections;
