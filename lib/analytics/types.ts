/** First-party analytics: event shape stored on disk and report shapes served to the admin. */

export type AnalyticsEventType = "pageview" | "engagement" | "event";

export type TrafficChannel =
  | "Doğrudan"
  | "Organik Arama"
  | "Sosyal Medya"
  | "Ücretli Reklam"
  | "Yönlendirme"
  | "E-posta";

export type DeviceType = "Mobil" | "Tablet" | "Masaüstü";

/** One stored analytics hit. No IP address or other directly identifying data is kept. */
export interface StoredAnalyticsEvent {
  type: AnalyticsEventType;
  ts: number; // epoch ms (server time)
  visitorId: string; // random id kept in the visitor's localStorage
  sessionId: string; // rotates after 30 minutes of inactivity
  path: string;
  title?: string;
  referrerHost?: string;
  channel: TrafficChannel;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  device: DeviceType;
  browser: string;
  os: string;
  country?: string;
  language?: string;
  screenWidth?: number;
  durationMs?: number; // engagement events: visible time on the page
  name?: string; // custom events (e.g. whatsapp_click)
  label?: string;
}

/** Payload accepted from the browser tracker. */
export interface CollectPayload {
  type: AnalyticsEventType;
  visitorId: string;
  sessionId: string;
  path: string;
  title?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  clickId?: "gclid" | "fbclid" | "ttclid" | "msclkid";
  language?: string;
  screenWidth?: number;
  durationMs?: number;
  name?: string;
  label?: string;
}

export interface CountRow {
  key: string;
  value: number;
}

export interface KpiSet {
  visitors: number;
  newVisitors: number;
  sessions: number;
  pageviews: number;
  avgSessionSeconds: number;
  bounceRate: number; // 0..1, share of non-engaged sessions
  pagesPerSession: number;
  conversions: number;
  conversionRate: number; // 0..1, sessions with at least one conversion
}

export interface DailyPoint {
  date: string; // YYYY-MM-DD (Europe/Istanbul)
  visitors: number;
  sessions: number;
  pageviews: number;
}

export interface PageRow {
  path: string;
  title?: string;
  pageviews: number;
  visitors: number;
  avgSeconds: number;
}

export interface CampaignRow {
  campaign: string;
  source: string;
  medium: string;
  sessions: number;
  conversions: number;
}

export interface AnalyticsReport {
  range: { from: string; to: string; days: number };
  kpis: KpiSet;
  previousKpis: KpiSet;
  daily: DailyPoint[];
  topPages: PageRow[];
  landingPages: CountRow[];
  channels: CountRow[];
  referrers: CountRow[];
  campaigns: CampaignRow[];
  devices: CountRow[];
  browsers: CountRow[];
  operatingSystems: CountRow[];
  countries: CountRow[];
  languages: CountRow[];
  hours: number[]; // 24 buckets of pageviews, Europe/Istanbul time
  events: CountRow[];
}

export interface RealtimeReport {
  activeVisitors: number;
  pageviewsLast30Min: number;
  pages: CountRow[];
  minutes: number[]; // pageviews per minute, oldest first (30 buckets)
}

/** Custom event names that count as conversions. */
export const CONVERSION_EVENTS = [
  "contact_submit",
  "whatsapp_click",
  "phone_click",
  "email_click",
  "promo_click",
] as const;

export const EVENT_LABELS: Record<string, string> = {
  contact_submit: "İletişim formu gönderimi",
  whatsapp_click: "WhatsApp tıklaması",
  phone_click: "Telefon tıklaması",
  email_click: "E-posta tıklaması",
  promo_click: "Reklam (promo) tıklaması",
  outbound_click: "Dış bağlantı tıklaması",
  cta_click: "CTA butonu tıklaması",
};
