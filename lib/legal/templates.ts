import { LegalPage, LegalPageSlug, SiteNarrative } from "@/lib/types/cms";

/**
 * Legal page templates. Text is Markdown; {{placeholders}} are filled from the company
 * info in the admin panel (and, for the distance sales contract, from the order).
 * These are starting drafts: they should be reviewed by a lawyer before going live.
 */

export const LEGAL_PAGE_PATHS: Record<LegalPageSlug, string> = {
  "teslimat-ve-iade": "/teslimat-ve-iade",
  "gizlilik-sozlesmesi": "/gizlilik-sozlesmesi",
  "mesafeli-satis-sozlesmesi": "/mesafeli-satis-sozlesmesi",
};

export const COMPANY_PLACEHOLDERS: Record<string, string> = {
  firma_unvani: "Şirket unvanı",
  firma_adresi: "Şirket adresi",
  firma_telefon: "Telefon",
  firma_eposta: "E-posta",
  vergi_dairesi: "Vergi dairesi",
  vergi_no: "Vergi numarası",
  mersis_no: "MERSİS numarası",
  kep_adresi: "KEP adresi",
  site_adresi: "Site adresi",
};

export const ORDER_PLACEHOLDERS: Record<string, string> = {
  alici_adi: "Alıcının adı soyadı",
  alici_eposta: "Alıcının e-postası",
  alici_telefon: "Alıcının telefonu",
  alici_adres: "Alıcının adresi",
  siparis_no: "Sipariş numarası",
  hizmet_listesi: "Hizmet / ürün listesi",
  siparis_tutari: "Toplam tutar (KDV dahil)",
  tarih: "Sipariş tarihi",
};

export function companyVariables(narrative: SiteNarrative, siteUrl: string): Record<string, string> {
  return {
    firma_unvani: narrative.companyTitle || "",
    firma_adresi: narrative.companyAddress || "",
    firma_telefon: narrative.companyPhone || "",
    firma_eposta: narrative.companyEmail || "",
    vergi_dairesi: narrative.taxOffice || "",
    vergi_no: narrative.taxNumber || "",
    mersis_no: narrative.mersisNumber || "",
    kep_adresi: narrative.kepAddress || "",
    site_adresi: siteUrl,
  };
}

/**
 * Replaces {{name}} placeholders. Known but empty values become a visible "[Şirket unvanı]"
 * style marker, so missing company info is noticed instead of silently disappearing.
 */
const OPTIONAL_KEYS = new Set(["mersis_no", "kep_adresi"]);

export function renderTemplate(template: string, variables: Record<string, string>): string {
  const labels: Record<string, string> = { ...COMPANY_PLACEHOLDERS, ...ORDER_PLACEHOLDERS };
  return template.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (match, key: string) => {
    const value = variables[key];
    if (value) return value;
    // Optional company fields (sole proprietors have no MERSİS/KEP): show a dash, not a warning
    if (OPTIONAL_KEYS.has(key)) return "-";
    return labels[key] ? `[${labels[key]}]` : match;
  });
}

const DELIVERY = `## Hizmetin Teslimi

{{firma_unvani}} ("digivideas") dijital reklam, sosyal medya yönetimi, kreatif prodüksiyon, web tasarım ve danışmanlık hizmetleri sunar. Satılan hizmetler fiziksel ürün değildir; kargo ile gönderim yapılmaz.

- Hizmet, ödemenin onaylanmasının ardından en geç **3 iş günü** içinde başlatılır ve başlangıç bilgisi alıcının e-posta adresine gönderilir.
- Dijital çıktılar (tasarım dosyaları, raporlar, video ve görseller) e-posta, bulut paylaşım bağlantısı veya müşteri paneli üzerinden teslim edilir.
- Hizmet takvimi, teklif veya sipariş açıklamasında belirtilen süre ve kapsamla sınırlıdır.

## İptal ve İade Koşulları

- Hizmetin ifasına **başlanmadan önce** yapılan iptal taleplerinde ödenen tutarın tamamı iade edilir.
- Alıcının onayı ile ifasına başlanan hizmetlerde, 6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi gereğince cayma hakkı kullanılamaz. Bu durumda yalnızca henüz başlanmamış dönemlere ait (ör. ilerideki aylık paketler) bedeller iade edilir.
- Reklam platformlarına (Meta, Google vb.) aktarılmış ve harcanmış reklam bütçeleri iade edilemez.
- Hizmet kusurlu veya eksik ifa edilirse, alıcı **14 gün** içinde {{firma_eposta}} adresine bildirimde bulunabilir; kusur giderilir veya bedel indirimi/iade yapılır.

## İade Süreci

1. İade talebinizi sipariş numaranızla birlikte {{firma_eposta}} adresine veya {{firma_telefon}} numarasına iletin.
2. Talebiniz en geç **3 iş günü** içinde değerlendirilir ve size bilgi verilir.
3. Onaylanan iadeler, ödemenin yapıldığı kart hesabına **iyzico** aracılığıyla en geç **14 gün** içinde yapılır. İadenin kart ekstresine yansıma süresi bankanıza bağlıdır.

## İletişim

**{{firma_unvani}}**
Adres: {{firma_adresi}}
Telefon: {{firma_telefon}} · E-posta: {{firma_eposta}}
`;

const PRIVACY = `## Giriş

Bu Gizlilik Sözleşmesi, {{site_adresi}} adresli internet sitesini ziyaret eden ve {{firma_unvani}} ("digivideas") hizmetlerini satın alan kişilerin kişisel verilerinin nasıl işlendiğini açıklar. Ayrıntılı bilgi için KVKK Aydınlatma Metni'ni inceleyebilirsiniz.

## Toplanan Bilgiler

- **İletişim ve sipariş bilgileri:** ad soyad, e-posta, telefon, fatura adresi ve sipariş içeriği.
- **Ödeme bilgileri:** Kart bilgileriniz sitemizde **saklanmaz ve sitemizden geçmez**. Ödemeler, BDDK lisanslı ödeme kuruluşu **iyzico** (iyzi Ödeme ve Elektronik Para Hizmetleri A.Ş.) altyapısında, PCI-DSS standartlarına uygun güvenli ödeme sayfasında alınır.
- **Ziyaret istatistikleri:** çerez kullanılmadan, IP adresi saklanmadan anonim olarak toplanır.

## Bilgilerin Kullanımı

Toplanan bilgiler yalnızca siparişin ve hizmetin yerine getirilmesi, faturalandırma, yasal yükümlülükler ve sizinle iletişim amacıyla kullanılır. Bilgileriniz pazarlama amacıyla üçüncü kişilere satılmaz veya kiralanmaz.

## Bilgilerin Paylaşımı

Bilgileriniz yalnızca ödeme işlemi için iyzico ile, yasal zorunluluk halinde yetkili kamu kurumlarıyla ve hizmetin ifası için gerekli olduğu ölçüde iş ortaklarımızla paylaşılır.

## Güvenlik

Site, SSL ile şifreli bağlantı kullanır. Sipariş ve ödeme bağlantıları kişiye özel, tahmin edilemez adreslerdir ve süreleri sınırlıdır.

## Haklarınız

6698 sayılı KVKK'nın 11. maddesindeki haklarınızı kullanmak için {{firma_eposta}} adresine başvurabilirsiniz.

## İletişim

**{{firma_unvani}}** · {{firma_adresi}} · {{firma_telefon}} · {{firma_eposta}}
`;

const DISTANCE_SALES = `## 1. Taraflar

**SATICI**
Unvan: {{firma_unvani}}
Adres: {{firma_adresi}}
Telefon: {{firma_telefon}} · E-posta: {{firma_eposta}}
Vergi Dairesi / No: {{vergi_dairesi}} / {{vergi_no}} · MERSİS: {{mersis_no}}

**ALICI**
Ad Soyad: {{alici_adi}}
Adres: {{alici_adres}}
Telefon: {{alici_telefon}} · E-posta: {{alici_eposta}}

## 2. Konu

İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait {{site_adresi}} üzerinden kendisine iletilen ödeme bağlantısı ile siparişini verdiği aşağıda nitelikleri ve satış fiyatı belirtilen hizmetin satışı ve ifası ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.

## 3. Sözleşme Konusu Hizmet

Sipariş No: {{siparis_no}}
Sipariş Tarihi: {{tarih}}

{{hizmet_listesi}}

**Toplam (KDV dahil): {{siparis_tutari}}**

## 4. Ödeme

Ödeme, kredi kartı veya banka kartı ile **iyzico** güvenli ödeme altyapısı üzerinden yapılır. Kart bilgileri SATICI tarafından görülmez ve saklanmaz. Taksit seçenekleri ödeme sayfasında gösterilir.

## 5. Hizmetin İfası

Hizmet, ödemenin onaylanmasından itibaren en geç 3 iş günü içinde başlatılır ve Teslimat ve İade Şartları sayfasında belirtilen esaslar çerçevesinde dijital ortamda ifa edilir. Hizmet fiziksel teslimat gerektirmez.

## 6. Cayma Hakkı

ALICI, hizmetin ifasına başlanmadan önce sözleşmenin kurulduğu tarihten itibaren **14 gün** içinde herhangi bir gerekçe göstermeksizin cayma hakkını kullanabilir. Cayma bildirimi {{firma_eposta}} adresine yazılı olarak yapılır; ödenen bedel 14 gün içinde iade edilir.

Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca, **cayma hakkı süresi sona ermeden önce ALICI'nın onayı ile ifasına başlanan hizmetlerde** cayma hakkı kullanılamaz. ALICI, ödeme adımında bu hususu bildiğini onaylar.

## 7. Genel Hükümler

ALICI, ödeme sayfasında sözleşme konusu hizmetin temel nitelikleri, satış fiyatı, ödeme şekli ve ifa koşulları ile cayma hakkına ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini kabul eder.

## 8. Uyuşmazlıkların Çözümü

İşbu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığı'nca ilan edilen değere kadar ALICI'nın yerleşim yerindeki Tüketici Hakem Heyetleri, bu değerin üzerindeki uyuşmazlıklarda Tüketici Mahkemeleri yetkilidir.

## 9. Yürürlük

ALICI'nın ödeme sayfasında sözleşmeyi onaylayıp ödemeyi tamamlamasıyla işbu sözleşme kurulmuş ve yürürlüğe girmiş olur.
`;

export const DEFAULT_LEGAL_PAGES: LegalPage[] = [
  { id: "legal-teslimat", slug: "teslimat-ve-iade", title: "Teslimat ve İade Şartları", content: DELIVERY, updatedAt: "2026-10-22T00:00:00.000Z" },
  { id: "legal-gizlilik", slug: "gizlilik-sozlesmesi", title: "Gizlilik Sözleşmesi", content: PRIVACY, updatedAt: "2026-10-22T00:00:00.000Z" },
  {
    id: "legal-mesafeli",
    slug: "mesafeli-satis-sozlesmesi",
    title: "Mesafeli Satış Sözleşmesi",
    content: DISTANCE_SALES,
    updatedAt: "2026-10-22T00:00:00.000Z",
  },
];
