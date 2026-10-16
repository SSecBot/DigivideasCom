import { LeadAnalysis, LeadReason, LeadTier, PlaceLead, WebsiteAudit } from "@/lib/leads/types";
import { hostOf, isSocialUrl, ownWebsite } from "@/lib/leads/social";

/**
 * Scores how promising a business is as a social-media advertising client.
 * Pure function (unit-tested): the score is a sum of explainable reasons so the
 * team can see *why* a lead is hot, not just a number.
 */

/** Sectors that sell visually / locally and typically buy Instagram & Meta ads. */
const HIGH_FIT_TYPES = new Set([
  "restaurant", "cafe", "coffee_shop", "bakery", "bar", "pub", "meal_takeaway", "meal_delivery",
  "ice_cream_shop", "dessert_shop", "confectionery", "breakfast_restaurant", "brunch_restaurant",
  "fast_food_restaurant", "pizza_restaurant", "steak_house", "seafood_restaurant", "turkish_restaurant",
  "beauty_salon", "hair_salon", "hair_care", "nail_salon", "barber_shop", "spa", "massage",
  "skin_care_clinic", "beautician", "makeup_artist", "tattoo_shop",
  "gym", "fitness_center", "yoga_studio", "pilates_studio",
  "dentist", "dental_clinic", "physiotherapist", "medical_clinic", "veterinary_care", "aesthetic_clinic",
  "clothing_store", "shoe_store", "jewelry_store", "furniture_store", "home_goods_store", "florist",
  "boutique", "gift_shop", "cosmetics_store", "pet_store", "optician",
  "real_estate_agency", "lodging", "hotel", "guest_house", "bed_and_breakfast", "resort_hotel",
  "car_dealer", "car_rental", "car_wash", "wedding_venue", "event_venue", "banquet_hall",
  "photographer", "driving_school", "preschool", "language_school", "tutoring",
]);

const MEDIUM_FIT_TYPES = new Set([
  "store", "electronics_store", "hardware_store", "book_store", "sporting_goods_store",
  "supermarket", "grocery_store", "school", "university", "travel_agency", "insurance_agency",
  "lawyer", "accounting", "doctor", "hospital", "pharmacy", "car_repair", "moving_company",
  "plumber", "electrician", "general_contractor", "roofing_contractor", "painter", "locksmith",
]);

/**
 * Turkish category labels as shown on Google Maps (used when places come from the
 * browser scrape, which has no API type codes). Matched case-insensitively.
 */
const HIGH_FIT_LABEL =
  /kafe|cafe|kahve|restoran|lokanta|pastane|fırın|tatlı|dondurma|börek|döner|kebap|pide|pizza|burger|bar|meyhane|kahvaltı|güzellik|kuaför|berber|tırnak|manikür|spa|masaj|cilt|estetik|güzellik merkezi|epilasyon|dövme|spor salonu|fitness|pilates|yoga|diş|klinik|fizik tedavi|veteriner|pet shop|evcil hayvan|butik|giyim|ayakkabı|kuyumcu|mücevher|mobilya|ev tekstili|çiçek|hediyelik|kozmetik|optik|gözlük|emlak|otel|pansiyon|apart|tatil|oto galeri|araç kiralama|oto yıkama|düğün|nikah|organizasyon|fotoğraf|sürücü kursu|anaokulu|kreş|dil okulu|etüt|kurs/i;
const MEDIUM_FIT_LABEL =
  /mağaza|market|elektronik|hırdavat|kitap|okul|seyahat|sigorta|avukat|hukuk|muhasebe|mali müşavir|doktor|hastane|eczane|oto servis|tamir|nakliyat|tesisat|elektrikçi|inşaat|tadilat|boya|çilingir/i;

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  x: "X",
};

function tierFor(score: number): LeadTier {
  if (score >= 65) return "Sıcak";
  if (score >= 40) return "Ilık";
  return "Soğuk";
}

export function analyzeLead(place: PlaceLead, audit?: WebsiteAudit): LeadAnalysis {
  const reasons: LeadReason[] = [];
  const opportunities = new Set<string>();
  const add = (points: number, text: string) => reasons.push({ points, text });

  if (place.businessStatus && place.businessStatus !== "OPERATIONAL") {
    return {
      score: 0,
      tier: "Soğuk",
      reasons: [{ points: 0, text: "İşletme kalıcı/geçici olarak kapalı görünüyor" }],
      opportunities: [],
      pitch: "",
    };
  }

  // 1) Sector fit
  const types = [place.primaryType, ...place.types].filter(Boolean) as string[];
  const label = place.primaryTypeLabel || "";
  if (types.some((type) => HIGH_FIT_TYPES.has(type)) || HIGH_FIT_LABEL.test(label)) {
    add(25, "Sosyal medya reklamına çok uygun, görsel/yerel bir sektör");
  } else if (types.some((type) => MEDIUM_FIT_TYPES.has(type)) || MEDIUM_FIT_LABEL.test(label)) {
    add(12, "Yerel reklamla müşteri kazanabilecek bir sektör");
  } else {
    add(4, "Sektör sosyal medya reklamı için orta/düşük öncelikli");
  }

  // 2) Demand & budget signals from Google reviews
  const count = place.ratingCount ?? 0;
  if (count >= 300) add(15, `${count} Google yorumu: yüksek müşteri trafiği ve reklam bütçesi potansiyeli`);
  else if (count >= 80) add(12, `${count} Google yorumu: oturmuş, büyüyen bir işletme`);
  else if (count >= 15) add(8, `${count} Google yorumu: büyüme aşamasında`);
  else {
    add(5, count === 0 ? "Hiç Google yorumu yok: bilinirlik çalışmasına ihtiyaç var" : `Sadece ${count} Google yorumu: görünürlük düşük`);
    opportunities.add("Google İşletme Profili optimizasyonu & yorum kampanyası");
  }

  if (place.rating !== undefined) {
    if (place.rating >= 4.5) add(10, `${place.rating.toFixed(1)} puan: memnun müşteriler, içerik için güçlü sosyal kanıt`);
    else if (place.rating >= 4.0) add(7, `${place.rating.toFixed(1)} puan: iyi itibar`);
    else if (place.rating < 3.6) {
      add(4, `${place.rating.toFixed(1)} puan: itibar yönetimi fırsatı`);
      opportunities.add("Online itibar yönetimi");
    }
  }

  // 3) Digital gaps (the bigger the gap, the more we can sell)
  const website = ownWebsite(place.website);
  const socialListing = place.website && isSocialUrl(place.website) ? hostOf(place.website) : "";
  if (!website) {
    add(20, socialListing
      ? `Kendi web sitesi yok, Google'da sadece ${socialListing} bağlantısı var`
      : "Web sitesi yok: dijital varlık sıfırdan kurulabilir");
    opportunities.add("Web sitesi / landing page tasarımı");
    if (socialListing.includes("instagram")) {
      add(5, "Instagram hesabı var: reklam ve içerik yönetimiyle büyütülebilir");
      opportunities.add("Instagram Reels & içerik prodüksiyonu");
    }
  } else if (audit) {
    if (!audit.reachable) {
      add(15, "Web sitesi açılmıyor veya hata veriyor");
      opportunities.add("Web sitesi yenileme");
    } else {
      if (!audit.https) {
        add(5, "Web sitesi güvenli değil (HTTPS yok)");
        opportunities.add("Web sitesi yenileme");
      }
      if (!audit.hasViewport) {
        add(5, "Web sitesi mobil uyumlu görünmüyor");
        opportunities.add("Mobil uyumlu web tasarım");
      }
      if (!audit.hasMetaPixel) {
        add(10, "Meta Pixel yok: Instagram/Facebook reklam dönüşümleri ölçülmüyor");
        opportunities.add("Meta Pixel & dönüşüm takibi kurulumu");
      }
      if (!audit.hasGoogleAnalytics && !audit.hasGoogleTagManager) {
        add(4, "Google Analytics / Tag Manager yok");
        opportunities.add("Analitik & raporlama kurulumu");
      }
      if (audit.hasGoogleAds || audit.hasMetaPixel) {
        add(5, "Zaten reklam altyapısı var: reklama bütçe ayırıyor");
      }
    }
  }

  if (audit?.reachable) {
    const found = Object.keys(audit.socials).filter((key) => audit.socials[key as keyof typeof audit.socials]);
    if (!audit.socials.instagram) {
      add(15, "Web sitesinde Instagram hesabı bulunamadı");
      opportunities.add("Instagram hesabı kurulumu & sosyal medya yönetimi");
    } else {
      add(5, "Instagram hesabı var: reklam ve içerik yönetimiyle büyütülebilir");
      opportunities.add("Instagram Reels & içerik prodüksiyonu");
    }
    if (found.length === 0) add(5, "Hiçbir sosyal medya bağlantısı yok");
    else if (!audit.socials.tiktok) opportunities.add("TikTok içerik stratejisi");
  } else if (!website && !socialListing.includes("instagram")) {
    opportunities.add("Instagram hesabı kurulumu & sosyal medya yönetimi");
  }

  opportunities.add("Meta (Instagram/Facebook) reklam kampanyası");

  const score = Math.max(0, Math.min(100, reasons.reduce((sum, reason) => sum + reason.points, 0)));
  const opportunityList = Array.from(opportunities);
  const socialsFound = audit
    ? Object.keys(audit.socials)
        .filter((key) => audit.socials[key as keyof typeof audit.socials])
        .map((key) => SOCIAL_LABELS[key])
    : [];

  const pitch = [
    `Merhaba, ${place.name} ekibi 👋`,
    `Ben digivideas dijital reklam ajansından yazıyorum. ${place.rating ? `Google'da ${place.rating.toFixed(1)} puanınızı ve müşteri yorumlarınızı gördük; ` : ""}işletmenizin sosyal medyada çok daha fazla kişiye ulaşabileceğini düşünüyoruz.`,
    !website
      ? "Henüz bir web siteniz görünmüyor; Instagram reklamlarıyla birlikte basit bir tanıtım sayfası müşteri kazanımınızı hızla artırabilir."
      : socialsFound.length === 0
        ? "Web sitenizde sosyal medya hesaplarınıza bağlantı göremedik; düzenli içerik ve hedefli reklamlarla bölgenizdeki müşterilere ulaşabilirsiniz."
        : `${socialsFound.join(", ")} hesaplarınızı reklam kampanyaları ve profesyonel içerikle büyütebiliriz.`,
    `Size özel ücretsiz bir dijital analiz ve ${opportunityList[0]?.toLowerCase() || "reklam"} önerisi hazırlayabiliriz. Uygun olduğunuz bir zamanda kısa bir görüşme yapabilir miyiz?`,
  ].join("\n\n");

  return { score, tier: tierFor(score), reasons: reasons.sort((a, b) => b.points - a.points), opportunities: opportunityList, pitch };
}
