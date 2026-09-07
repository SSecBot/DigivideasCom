# Digivideas Web Sitesi ve CMS İçerik Yapısı Rehberi

Bu belge, **digivideas** ("İzmir, Türkiye" merkezli dijital reklam ajansı) web sitesinin içerik mimarisini, veri yapısını, WordPress tarzı gizli yönetim panelini ve içerik güncelleme standartlarını açıklamaktadır.

---

## 1. Kurumsal Kimlik, Lokasyon ve Metin Kuralları

- **Ajans Tanımı:** Digivideas, tüm sayfalarda ve meta etiketlerde kesinlikle **"dijital reklam ajansı"** olarak tanımlanır.
- **Şirket Sloganı:** 
  > *"Teknoloji ve yaratıcılığı harmanlayarak, markanızın dijital platformlarda öne çıkmasını sağlıyoruz. İhtiyaçlarınıza özel çözümlerle, markanızın dijital yolculuğunu başarıyla yönetiyoruz."*
- **Lokasyon Kuralları:**
  - **Genel Web Sitesi Alanları (Header, Hero, Hakkımızda, İletişim):** Kesinlikle `İzmir, Türkiye`.
  - **Footer (Alt Bilgi Bölümü):** Kesinlikle `İzmir, Torbalı, Türkiye`.
- **Global WhatsApp Entegrasyonu:** Tüm butonlar ve kayan sohbet balonu `+905492115561` numarasına ve `https://wa.me/905492115561` bağlantısına yönlendirilir.
- **Niteliksel / Kalitatif Standart:** Sitede hiçbir yerde kesin ve abartılı sayısal vaatler (örn. "%250 kesin ciro artışı", "garantili %300 büyüme") bulunmaz. Bunun yerine *"Sürdürülebilir Büyüme"*, *"Özel Çekimler"*, *"Yüksek Etki"*, *"Analitik Karar Modelleri"* gibi mühendislik temelli kurumsal ifadeler kullanılır.

---

## 2. Tasarım Sistemi ve Katı 3-Renk Token Kuralı

Sistem genelinde katı bir **3-Renk Token Mimarisi (Sıfır Lacivert / Koyu Mavi)** uygulanmaktadır:

1. **Canlı Sıcak Turuncu (Vibrant Warm Orange):** `#F97316` / `#EA580C` — Vurgular, CTA butonları, aktif sekmeler, ışık parlamaları ve etkileşimli alanlar.
2. **Derin Antrasit (Deep Anthracite Dark Slate):** `#1E293B` / `#0F172A` / `#09090B` — Kartlar, pencereler, arka planlar ve kenar çubukları.
3. **Kırık Beyaz / Sıcak Arduvaz (Off-White Warm Slate):** `#FAFAFA` / `#F8FAFC` — Okunabilir ana metinler, başlıklar ve açık vurgular.

> **Önemli Kural:** Sitede mavi, lacivert, camgöbeği, yeşil ve kırmızı renk tonları kesinlikle kullanılmaz. WhatsApp butonu dahi marka renk uyumu gereği turuncu ve antrasit paletinde tasarlanmıştır.

**Tipografi:** Tüm başlıklarda, gövde metinlerinde, kartlarda ve CMS ekranlarında **Poppins** yazı tipi ailesi (300, 400, 500, 600, 700, 800) kullanılmaktadır.

---

## 3. Sol Kenar Çubuğu (Sidebar) Tipografi ve Logo Standardı

- **Logo İkonu:** Sol dikey kenar çubuğunun tepe kısmında resmi `logo.png` görsel varlığı kurumsal Antrasit ikon kapsayıcısı içerisinde yer alır.
- **Poppins Tipografi Standardı:** Logo simgesinin hemen yanında yer alan marka başlığı ve **"Dijital Reklam Ajansı"** metni kesin olarak **Poppins** (Poppins Bold / Poppins SemiBold) yazı tipinde ve tema renk token'ları (Beyaz & Sıcak Turuncu) ile gösterilir.

---

## 4. Müşteri Vaka Analizleri ve "Müşteri Hikayesi" Bölümü

- **Metrik Sütunlarının Temizliği:** Müşteri vaka sayfalarındaki (`/customers` ve `/customers/[slug]`) yapay veya sayısal sütun blokları ("stratejik büyüme", "dönüşüm oranı", "ROAS" vb.) tamamen kaldırılmıştır.
- **Müşteri Hikayesi (Client Story):** Kaldırılan sütunların yerine, müşterinin geçmişini, sektörel dinamiklerini, stratejik uygulama adımlarını ve niteliksel başarı içgörülerini anlatan geniş ve prestijli **"Müşteri Hikayesi"** (`story`) alanı entegre edilmiştir.
- **Dinamik Kampanya Galerisi (Media Gallery):** Müşteri detay sayfasında sergilenen kampanya fotoğrafları ve 4K çekimler dinamik galeri modülü üzerinden yönetilir.

---

## 5. Gizli WordPress-Tarzı Yönetim Paneli (Admin CMS)

Yönetim paneline erişim tamamen gizlidir; sitede herhangi bir "Giriş" butonu veya bağlantısı yer almaz.

- **Erişim Adresi:** `/dashboard/admin/digivideas`
- **Yönetici Giriş Şifresi (Passcode):** `MuazDigivideas285561.`

### Yönetim Paneli Yetenekleri:
1. **Genel Bakış (Dashboard Overview):** Sistemdeki hizmet, müşteri, blog ve etiket sayılarını gösteren canlı kokpit.
2. **Hizmetlerimiz (Services CRUD):**
   - Yeni hizmet ekleme, düzenleme, silme.
   - Kategori, ikon seçimi, özet metin, özellik listesi, çıktı paketleri ve detaylı markdown içeriği.
   - Sayfa yayın durumu (Yayında / Taslak) tek tıkla değiştirilebilir.
3. **Müşterilerimiz (Customers / Case Studies CRUD):**
   - Müşteri vaka analizi oluşturma ve düzenleme.
   - **Müşteri Hikayesi (Client Story):** Kapsamlı hikaye ve strateji anlatısını düzenlemek için zengin metin alanı.
   - **Dinamik Kampanya Görsel Galerisi Yönetimi:**
     - Yeni görsel yükleme (bilgisayardan dosya seçimi) veya URL ile ekleme.
     - Mevcut görselleri doğrudan değiştirme.
     - Sıralamayı yukarı/aşağı (öne/arkaya) taşıma.
     - Tekil görsel silme.
     - Panelden yapılan her değişiklik anında `/customers/[slug]` sayfasına yansır.
   - **Marka Yöneticisi Yorumu (Brand Manager Review):** Yorum metni, Yetkili adı soyadı, Unvan/Pozisyon ve Avatar görseli.
   - **Canlı Kampanya Bağlantısı (Live Campaign URL):** Müşteri web sitesine veya sosyal medya kampanyasına yönlendiren dinamik bağlantı (`liveUrl`).
   - Sektörel zorluk (Challenge) ve Digivideas çözüm stratejisi (Solution) alanları.
4. **Blog & Makale Yönetimi (Blog CRUD):**
   - 2026 pazarlama trendleri, yapay zeka ve reklamcılık makaleleri yazma, düzenleme ve silme.
   - Öne çıkan makale belirleme ve etiketleme.
5. **Etiket Yönetimi (Tag Manager):**
   - Hizmetler, müşteri vakaları ve blog yazıları için ortak veya modüle özel etiket havuzu oluşturma, düzenleme ve silme.
6. **Sıkça Sorulan Sorular (FAQ CRUD):**
   - Anasayfa akordeon alanı ve `/faq` sayfası için kategori bazlı soru-cevap ekleme, sıralama ve düzenleme.
7. **Site Ayarları & Kurumsal Kimlik:**
   - Navbar ana logosu, kenar çubuğu küçük ve geniş logolarını güncelleme veya yerel dosya yükleme.
   - Slogan, lokasyon metinleri, WhatsApp numarası ve sosyal medya bağlantılarını dinamik olarak kaydetme.
8. **Gelen Talepler (Inquiries):**
   - İletişim sayfasından gelen teklif ve bilgi formlarının listelendiği gelen kutusu.

---

## 6. Sayfa Yapısı ve Bileşen Mimarisi

| Rota | Açıklama | Ana Bileşenler |
|---|---|---|
| `/` | Ana Sayfa | `HeroSection`, `UnblurText`, `MacOSServiceShowcase`, Hizmet Önizleme, Başarı Hikayeleri, SSS, CTA |
| `/about` | Hakkımızda | Hikayemiz, "digivideas" etimolojisi, Misyon, Vizyon, Temel Değerler |
| `/services` | Hizmetlerimiz Kataloğu | Kategori filtreleri, Hizmet Kartları, Hizmet Detay Butonları |
| `/services/[slug]` | Hizmet Detay Sayfası | Hero Banner, Modül Özellikleri, Paket Çıktıları, Teklif Formu |
| `/customers` | Müşterilerimiz (Portföy) | Vaka Analizleri, Müşteri Hikayeleri, Marka Yöneticisi Yorumları |
| `/customers/[slug]` | Müşteri Vaka Analizi Detay | **Müşteri Hikayesi**, **Dinamik Kampanya Galerisi**, Challenge/Solution kırılımları, Marka Yöneticisi Yorumu, Teklif İsteyin CTA |
| `/blog` | Blog & Dijital Trendler | Öne Çıkan Makale, Kategori ve Arama Filtreleri, Makale Kartları |
| `/blog/[slug]` | Makale Detay Sayfası | Okuma süresi, Yazar kartı, Markdown içerik, İlgili Yazılar |
| `/faq` | Sıkça Sorulan Sorular | Arama motoru, Kategori hapları, Akordeon cevaplar |
| `/contact` | İletişim & Teklif Formu | İnteraktif teklif formu, İzmir merkez ofis bilgileri, WhatsApp hızlı hat |
| `/dashboard/admin/digivideas` | Gizli Yönetim Paneli | Auth Guard, Tam CRUD Yönetim Modülleri, Tag Manager, Kampanya Galerisi Yöneticisi, Müşteri Hikayesi Editörü, Ayarlar |
