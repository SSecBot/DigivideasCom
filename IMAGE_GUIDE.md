# Digivideas Görsel ve Medya Varlıkları Yönetim Rehberi

Bu kılavuz, **digivideas** web sitesinde yer alan logo, banner, hizmet kapağı, müşteri kampanya görsel galerisi ve blog görsellerinin nasıl yükleneceğini, bağlanacağını, optimize edileceğini ve değiştirileceğini açıklar.

---

## 1. Dizin Yapısı ve Standart Dosya Yolları

Tüm statik görsel varlıkları `public/assets/` dizini altında kategorize edilmiştir:

```text
public/
├── assets/
│   ├── logo.png                       # Ana marka logosu (Navbar ve Sidebar)
│   ├── services/                      # Hizmet kapak görselleri
│   │   ├── service-performans.webp
│   │   ├── service-sosyal-medya.webp
│   │   ├── service-web-tasarim.webp
│   │   ├── service-kreatif-video.webp
│   │   ├── service-seo-icerik.webp
│   │   └── service-marka-kimligi.webp
│   ├── customers/                     # Müşteri portföy ve vaka görselleri
│   │   ├── laoscafe-hero.webp
│   │   ├── laoscafe-gallery-1.webp
│   │   ├── laoscafe-gallery-2.webp
│   │   ├── modalab-hero.webp
│   │   ├── modalab-gallery-1.webp
│   │   └── novatech-hero.webp
│   ├── blog/                          # Blog makale kapak görselleri
│   │   ├── blog-ai-trends.webp
│   │   ├── blog-meta-ads.webp
│   │   └── blog-brand-video.webp
│   └── team/                          # Ekip ve yazar avatarları
│       └── muaz-avatar.webp
```

---

## 2. Önerilen Görsel Boyutları ve Format Standartları

| Alan / Kullanım | Önerilen Format | Önerilen Çözünürlük | En/Boy Oranı |
|---|---|---|---|
| **Ana Logo (Navbar)** | PNG (Şeffaf) veya SVG | 400 × 90 px | ~4:1 |
| **Kenar Çubuğu İkon Logo** | PNG veya SVG | 120 × 120 px | 1:1 |
| **Hizmet Kapak Görselleri** | WebP / JPEG | 1200 × 800 px | 3:2 |
| **Müşteri Vaka Analizi Hero** | WebP / JPEG | 1600 × 900 px | 16:9 |
| **Müşteri Kampanya Görsel Galerisi** | WebP / JPEG | 1000 × 750 px | 4:3 |
| **Blog Kapak Görselleri** | WebP / JPEG | 1200 × 675 px | 16:9 |
| **Yazar / Yönetici Avatarları**| WebP / PNG | 300 × 300 px | 1:1 |

> **Performans İpucu:** Sayfa yükleme hızlarını en üst seviyede tutmak için görsellerin WebP formatında ve dosya boyutlarının 250 KB altında olması önerilir.

---

## 3. Müşteri Kampanya Görsel Galerisi Yönetimi (Admin CMS)

Müşteri vaka sayfalarında (`/customers/[slug]`) yer alan **Kampanya Görsel Galerisi**, CMS yönetim paneli üzerinden tamamen dinamik olarak yönetilir:

1. `/dashboard/admin/digivideas` paneline `MuazDigivideas285561.` şifresi ile giriş yapın.
2. **"Müşterilerimiz"** sekmesine tıklayın ve düzenlemek istediğiniz markanın yanındaki **"Düzenle"** butonuna basın.
3. **Kampanya Görsel Galerisi (Campaign Media Gallery)** bölümünde:
   - **Yeni Görsel Yükle:** "Dosya Yükle" butonuna basarak bilgisayarınızdan doğrudan görsel yükleyin.
   - **URL ile Görsel Ekle:** Dosya yolunu (örn: `/assets/customers/yeni-foto.webp`) kutucuğa yazıp "URL ile Ekle" butonuna basın.
   - **Görsel Değiştir:** Herhangi bir görsel kutusundaki "Değiştir" butonuna basarak o görseli yenisiyle değiştirin.
   - **Sıralamayı Değiştir:** Yukarı / Aşağı ok butonları ile görsellerin sayfada gösterilme sırasını belirleyin.
   - **Görsel Sil:** Çöp kutusu butonuna basarak istemediğiniz görseli galeriden çıkarın.
4. **"Kaydet & Yayınla"** butonuna bastığınız anda değişiklikler anında canlı müşteri detay sayfasında güncellenir.

---

## 4. Logo ve Sol Kenar Çubuğu Tipografi Standardı

- **Sol Kenar Çubuğu (Sidebar):** Üst kısımda `logo.png` görseli Antrasit ikon kutusu içerisinde yer alır. Açık menüde yanında **Poppins** yazı tipinde **"Dijital Reklam Ajansı"** başlığı bulunur.
- **Logo Güncelleme:** Yönetim panelindeki **"Site Ayarları & Logolar"** sekmesinden genel logo varlıkları güncellenebilir.
