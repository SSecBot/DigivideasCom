/** Google Maps lead finder: shared types for the server routes and the admin UI. */

export interface PlaceLead {
  placeId: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  rating?: number;
  ratingCount?: number;
  website?: string;
  phone?: string;
  internationalPhone?: string;
  mapsUrl?: string;
  businessStatus?: string; // OPERATIONAL | CLOSED_TEMPORARILY | CLOSED_PERMANENTLY
  types: string[];
  primaryType?: string;
  primaryTypeLabel?: string;
  priceLevel?: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
  x?: string;
}

export interface WebsiteAudit {
  url: string;
  finalUrl?: string;
  reachable: boolean;
  status?: number;
  https: boolean;
  loadMs?: number;
  title?: string;
  metaDescription?: string;
  hasViewport: boolean;
  socials: SocialLinks;
  hasMetaPixel: boolean;
  hasGoogleAnalytics: boolean;
  hasGoogleTagManager: boolean;
  hasGoogleAds: boolean;
  hasWhatsAppLink: boolean;
  error?: string;
  checkedAt: string;
}

export type LeadTier = "Sıcak" | "Ilık" | "Soğuk";

export interface LeadReason {
  text: string;
  points: number;
}

export interface LeadAnalysis {
  score: number; // 0..100 — higher = better fit for social-media advertising services
  tier: LeadTier;
  reasons: LeadReason[];
  opportunities: string[];
  pitch: string;
}

export type LeadStatus = "yeni" | "iletisime-gecildi" | "teklif-verildi" | "kazanildi" | "kaybedildi";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  yeni: "Yeni",
  "iletisime-gecildi": "İletişime geçildi",
  "teklif-verildi": "Teklif verildi",
  kazanildi: "Kazanıldı",
  kaybedildi: "Kaybedildi",
};

export interface SavedLead {
  id: string;
  place: PlaceLead;
  audit?: WebsiteAudit;
  analysis: LeadAnalysis;
  status: LeadStatus;
  notes: string;
  searchQuery?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface LeadSearchResponse {
  leads: (PlaceLead & { analysis: LeadAnalysis })[];
  nextPageToken?: string;
}
