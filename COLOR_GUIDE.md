# Digivideas Renk Sistemi ve Özelleştirme Rehberi (COLOR_GUIDE.md)

Bu kılavuz, **digivideas** ("İzmir, Türkiye" merkezli dijital reklam ajansı) platformunun kurumsal görsel kimliğini oluşturan **Katı 3-Renk Paleti Mimarisi**'ni, CSS değişkenlerini, Tailwind yapılandırmasını ve renklerin adım adım nasıl özelleştirileceğini detaylandırmaktadır.

---

## 1. Katı 3-Renk Paleti Mimarisi (Strict 3-Color Token System)

Sistem genelinde rastgele renk kullanımını önlemek ve üst düzey kurumsal estetiği korumak amacıyla platform yalnızca 3 ana renk ailesi ve bunların ton varyasyonları üzerine inşa edilmiştir:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. CANLI SICAK TURUNCU (Primary Accent):  #F97316 / #EA580C                 │
│ 2. DERİN ANTRASİT / FÜME (Dark Base):     #1F1F1F / #282828 / #333333       │
│ 3. KIRIK BEYAZ (Text & Light Accent):     #FAFAFA / #F8FAFC / #E2E8F0       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### A. Canlı Sıcak Turuncu (Warm Vibrant Orange)
- **Hex Kodları:** `#F97316` (Brand 500 - Ana Vurgu) / `#EA580C` (Brand 600 - Hover & Koyu Ton)
- **RGB / CSS Değişkeni:** `249 115 22` (`--brand-orange`) / `234 88 12` (`--brand-orange-dark`)
- **Kullanım Alanları:**
  - Ana CTA ve teklif butonları (`bg-brand-500`, `hover:bg-brand-600`)
  - Aktif menü öğeleri, sekme hapları ve ikon vurguları
  - Neon ışık parlamaları (`shadow-glow-orange`, `shadow-glow-orange-lg`)
  - Seçili metin arka planı (`::selection`)

### B. Derin Antrasit / Füme Gri Tonları (Deep Charcoal / Grey)
- **Hex Kodları:**
  - **Zemin Koyu Yüzey (Base Dark):** `#1F1F1F` (Sayfa genel arka planı & zemin)
  - **Kart & Yükseltilmiş Panel (Card & Elevation):** `#282828` (Kartlar, pencereler, modal gövdeleri)
  - **Kenarlık & Giriş Yüzeyi (Border & Input):** `#333333` (İnce kenarlıklar, form input zeminleri, kaydırma çubuğu)
- **RGB / CSS Değişkeni:** `31 31 31` (`--background`), `40 40 40` (`--anthracite-dark` / `--dark-card`), `51 51 51` (`--anthracite-base` / `--dark-border`)
- **Kullanım Alanları:**
  - Genel sayfa zemini (`bg-background` / `#1F1F1F`)
  - macOS servis penceresi ve cam kartlar (`bg-slate-900/80`, `glass-panel` / `#282828`)
  - Sol dikey kenar çubuğu (`glass-sidebar` / `#1F1F1F`)
  - Yönetim paneli pencereleri ve tabloları

### C. Kırık Beyaz / Sıcak Arduvaz (Off-White Warm Slate)
- **Hex Kodları:** `#FAFAFA` (Ana Metin / Foreground), `#F8FAFC` (Açık Kart Metinleri), `#D4D4D8` / `#A1A1AA` (Zinc - İkincil Açıklama Metinleri)
- **RGB / CSS Değişkeni:** `250 250 250` (`--foreground`)
- **Kullanım Alanları:**
  - Tüm H1, H2, H3 ana başlıklar
  - Okunabilir gövde metinleri ve liste elemanları
  - İnce cam kenarlık efektleri (`border-white/10`, `border-white/15`)

---

## 2. CSS Değişkenleri ve Tailwind Eşleme Tablosu

| Token Adı | CSS Değişkeni (`globals.css`) | Tailwind Sınıfı (`tailwind.config.ts`) | Hex Karşılığı | Kullanım Amacı |
|---|---|---|---|---|
| **Base Background** | `--background: 31 31 31;` | `bg-background` / `bg-dark-base` | `#1F1F1F` | Ana sayfa zemini |
| **Card / Surface** | `--dark-card: 40 40 40;` | `bg-slate-800` / `bg-dark-card` | `#282828` | Kart ve modal gövdeleri |
| **Border / Input** | `--dark-border: 51 51 51;` | `border-slate-700` / `bg-dark-border` | `#333333` | Kenarlıklar ve inputlar |
| **Foreground** | `--foreground: 250 250 250;` | `text-foreground` / `text-white` | `#FAFAFA` | Ana başlık ve metinler |
| **Brand Orange** | `--brand-orange: 249 115 22;` | `bg-brand-500` / `text-brand-500` | `#F97316` | Ana butonlar ve parlamalar |
| **Brand Orange Dark** | `--brand-orange-dark: 234 88 12;` | `bg-brand-600` / `text-brand-600` | `#EA580C` | Buton hover ve koyu vurgular |
| **Glow Parlama** | — | `shadow-glow-orange` | `rgba(249, 115, 22, 0.35)` | Turuncu ışık halkası |
| **Glow Parlama (Büyük)**| — | `shadow-glow-orange-lg` | `rgba(249, 115, 22, 0.50)` | Büyük CTA parlaması |

---

## 3. Kod Dosyaları Referansı

### A. `app/globals.css` Yapılandırması:
```css
@layer base {
  :root {
    --background: 31 31 31;       /* #1F1F1F (Base Dark Surface) */
    --foreground: 250 250 250;    /* #FAFAFA (Off-White Text) */
    --dark-base: 31 31 31;        /* #1F1F1F */
    --dark-card: 40 40 40;        /* #282828 (Card & Elevation) */
    --dark-border: 51 51 51;      /* #333333 (Border & Input) */
    --brand-orange: 249 115 22;   /* #F97316 */
    --brand-orange-dark: 234 88 12; /* #EA580C */
    --anthracite-dark: 40 40 40;  /* #282828 */
    --anthracite-base: 51 51 51;  /* #333333 */
  }

  body {
    background-color: #1f1f1f;
    color: #fafafa;
    font-family: var(--font-poppins), 'Poppins', sans-serif;
  }

  ::selection {
    background: #f97316;
    color: #1f1f1f;
  }
}
```

### B. `tailwind.config.ts` Yapılandırması:
```typescript
colors: {
  background: "#1F1F1F",
  foreground: "#FAFAFA",
  brand: {
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#F97316", // Ana Turuncu
    600: "#EA580C", // Koyu / Hover Turuncu
    700: "#C2410C",
    800: "#9A3412",
    900: "#7C2D12",
    DEFAULT: "#F97316",
    dark: "#EA580C",
  },
  dark: {
    base: "#1F1F1F",
    card: "#282828",
    border: "#333333",
    input: "#333333",
  },
  anthracite: {
    base: "#1F1F1F",
    surface: "#282828",
    700: "#333333",
    800: "#282828",
    850: "#242424",
    900: "#1F1F1F",
    950: "#181818",
    DEFAULT: "#1F1F1F",
  },
  slate: {
    700: "#333333",
    800: "#282828",
    850: "#242424",
    900: "#1F1F1F",
    950: "#181818",
  }
},
boxShadow: {
  "glow-orange": "0 0 40px -10px rgba(249, 115, 22, 0.35)",
  "glow-orange-lg": "0 0 60px -15px rgba(249, 115, 22, 0.5)",
  "glass-anthracite": "0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.08)",
}
```

---

## 4. Adım Adım Renk Özelleştirme Rehberi

### Adım 1: Ana Vurgu Rengini (Turuncu Tonunu) Değiştirmek
Eğer kurumsal turuncu tonunu farklı bir turuncu veya kehribar tonuna çekmek isterseniz:
1. `tailwind.config.ts` dosyasını açın.
2. `theme.extend.colors.brand['500']` ve `theme.extend.colors.brand['600']` değerlerini güncelleyin.
3. `boxShadow['glow-orange']` içindeki RGBA değerini yeni renginize göre revize edin.
4. `app/globals.css` içerisindeki `--brand-orange` ve `--brand-orange-dark` değişkenlerini güncelleyin.

### Adım 2: Zemin Koyu Tonunu (Antrasit / Gri Derinliğini) Ayarlamak
1. `app/globals.css` içinde `body { background-color: #1f1f1f; }` satırını güncelleyin.
2. `tailwind.config.ts` içinde `theme.extend.colors.background`, `slate['900']` (`#1F1F1F`) ve `slate['800']` (`#282828`) değerlerini revize edin.

### Adım 3: Cam Morfizm (Glassmorphism) Şeffaflığını Düzenlemek
- Cam paneller `app/globals.css` içerisindeki `.glass-panel` ve `.glass-sidebar` sınıflarında tanımlıdır.
- Şeffaflığı artırmak için `rgba(40, 40, 40, 0.85)` değerindeki `0.85` katsayısını `0.70` veya `0.90` olarak değiştirebilirsiniz.

---

## 5. Kesin Yasaklar ve Kodlama Kuralları (Strict Anti-Navy & Clean Code Rules)

Sitenin görsel bütünlüğünü korumak için aşağıdaki kurallar zorunludur:

1. **Sıfır Lacivert / Koyu Mavi Kuralı:** Sitede `blue`, `indigo`, `navy`, `cyan` veya `sky` renk ailelerine ait Tailwind sınıfları veya hex kodları kesinlikle kullanılamaz. Tüm koyu alanlar **Füme / Gri / Antrasit** (`#1F1F1F`, `#282828`, `#333333`) olmak zorundadır.
2. **Sıfır Keyfi Inline Hex Kodu:** Bileşenler içerisinde doğrudan rastgele inline hex kodları yazılamaz. Her zaman `bg-slate-900`, `bg-slate-800`, `text-brand-500`, `border-white/10` gibi token sınıfları kullanılmalıdır.
3. **Kontrast ve Okunabilirlik (WCAG AAA):** Koyu zeminler üzerindeki küçük metinler için minimum `text-zinc-300` veya `text-zinc-400` kullanılmalı; `text-zinc-600` gibi okunması zor soluk tonlardan kaçınılmalıdır.
4. **WhatsApp Butonu Kuralı:** WhatsApp yönlendirmesi dahi genel renk uyumu gereği yeşil yerine kurumsal sıcak turuncu ve koyu gri paletiyle stilize edilmiştir.
