import {
  ServiceItem,
  CustomerItem,
  BlogPost,
  SiteNarrative,
  FAQItem,
  TagItem,
} from "@/lib/types/cms";

export const initialSiteNarrative: SiteNarrative = {
  brandName: "digivideas",
  slogan:
    "Teknoloji ve yaratıcılığı harmanlayarak, markanızın dijital platformlarda öne çıkmasını sağlıyoruz. İhtiyaçlarınıza özel çözümlerle, markanızın dijital yolculuğunu başarıyla yönetiyoruz.",
  etymology:
    "digi (dijital) + ivi (Lazca: iz bırakmak, izi kalmak) + ideas (fikirler) = Dijitalde kalıcı iz bırakan yaratıcı fikirler.",
  location: "İzmir, Türkiye",
  footerLocation: "İzmir, Torbalı, Türkiye",
  whatsappNumber: "+905492115561",
  facebookUrl: "https://facebook.com/digivideas",
  instagramUrl: "https://instagram.com/digivideas",
  linkedinUrl: "https://linkedin.com/company/digivideas",
  logoUrl: "/assets/logo.png",
  sidebarSmallLogoUrl: "/assets/logo.png",
  sidebarWideLogoUrl: "/assets/logo.png",
  bizKimiz:
    "Dijital reklam ajansı olarak yenilikçi, analitik ve etkili pazarlama çözümleri sunuyoruz. Amacımız, markaların dijital dünyada güçlü ve sürdürülebilir bir varlık oluşturmasına yardımcı olmaktır. Uzman ekibimizle birlikte, kreatif stratejiler geliştirerek hedef kitlenize en doğru mesajları ulaştırıyoruz. Teknoloji ve yaratıcılığı harmanlayarak, markanızın dijital platformlarda öne çıkmasını sağlıyoruz. İhtiyaçlarınıza özel çözümlerle, markanızın dijital yolculuğunu başarıyla yönetiyoruz.",
  nasilBasladi:
    "Digivideas, İzmir merkezli olarak kurulan ve başlangıçta freelance projelerle yola çıkan bir dijital reklam ajansıdır. Mühendis olan kurucumuzun vizyonu ve analitik yaklaşımı sayesinde, kısa sürede sistematik ve organize bir ajans yapısına kavuştu. İlk günlerden itibaren teknolojiye ve yeniliklere olan tutkumuz, bizi sektörde öne çıkaran en büyük gücümüz oldu. Bu süreçte, yaratıcı çözümler ve müşteri odaklı ortaklık anlayışımızla büyümeye devam ederek bugünlere geldik.",
  misyonumuz:
    "Digivideas olarak, markaların dijital dünyada etkili ve kalıcı bir varlık oluşturmasını sağlamak için çalışıyoruz. Teknoloji ve yaratıcılığı bir araya getirerek, müşterilerimize özgün ve stratejik çözümler sunuyoruz. Amacımız, her bir müşterimizin hedeflerine ulaşmasına katkıda bulunmak, dijital platformlarda güçlü ve sürdürülebilir bir etkileşim kurmalarını sağlamaktır. Sürekli gelişen dijital ekosistemde, yenilikçi yaklaşımlarımızla fark yaratmayı ve müşterilerimizin beklentilerini aşmayı misyon edindik.",
  vizyonumuz:
    "Dijital reklamcılık alanında yenilikçi ve öncü bir ajans olmayı hedefliyoruz. Vizyonumuz, teknolojik gelişmeleri yakından takip ederek müşterilerimize en ileri düzeyde çözümler sunmak ve sektörümüzde öncü bir rol oynamaktır. Küresel ölçekte tanınan ve güvenilen bir marka olma yolunda, yaratıcılığımızı ve profesyonelliğimizi sürekli geliştiriyoruz. Müşterilerimizin başarısına katkıda bulunarak, dijital dünyada sürdürülebilir büyüme ve etki yaratmayı amaçlıyoruz.",
};

export const initialTags: TagItem[] = [
  { id: "tag-1", name: "Meta Ads", slug: "meta-ads", moduleType: "all", createdAt: "2026-08-25T10:00:00Z" },
  { id: "tag-2", name: "Google Ads", slug: "google-ads", moduleType: "all", createdAt: "2026-08-25T10:00:00Z" },
  { id: "tag-3", name: "Reels & Video", slug: "reels-video", moduleType: "all", createdAt: "2026-08-25T10:00:00Z" },
  { id: "tag-4", name: "Sosyal Medya", slug: "sosyal-medya", moduleType: "all", createdAt: "2026-08-25T10:00:00Z" },
  { id: "tag-5", name: "Web & UI/UX", slug: "web-ui-ux", moduleType: "all", createdAt: "2026-08-25T10:00:00Z" },
  { id: "tag-6", name: "SEO & İçerik", slug: "seo-icerik", moduleType: "all", createdAt: "2026-08-25T10:00:00Z" },
  { id: "tag-7", name: "Marka Kimliği", slug: "marka-kimligi", moduleType: "all", createdAt: "2026-08-25T10:00:00Z" },
  { id: "tag-8", name: "İzmir Ajans", slug: "izmir-ajans", moduleType: "all", createdAt: "2026-08-25T10:00:00Z" },
];

export const initialFAQs: FAQItem[] = [
  {
    id: "faq-1",
    question: "Digivideas ile bir projeye nasıl başlarız?",
    answer:
      "İletişim formumuz veya WhatsApp hattımız (+905492115561) üzerinden bize ulaştığınızda, öncelikle markanızın mevcut dijital durumunu ve hedeflerini analiz ederiz. Ardından sektörünüze ve bütçenize özel bir yol haritası ve strateji teklifi sunarak süreci başlatırız.",
    category: "Çalışma Süreci",
    order: 1,
    status: "published",
    updatedAt: "2026-08-25T10:00:00Z",
  },
  {
    id: "faq-2",
    question: "Reklam bütçemi nasıl yönetiyorsunuz?",
    answer:
      "Mühendislik temelli analitik yaklaşımımız sayesinde her yatırımın dönüşümünü ölçümlüyoruz. Meta Ads ve Google Ads panellerinde testler, kitle segmentasyonu ve Server-Side dönüşüm takibi (CAPI) kurarak bütçenizi en verimli kanallara dinamik olarak dağıtıyoruz.",
    category: "Reklam & Meta Ads",
    order: 2,
    status: "published",
    updatedAt: "2026-08-25T10:05:00Z",
  },
  {
    id: "faq-3",
    question: "Web siteleriniz hangi teknolojilerle geliştiriliyor?",
    answer:
      "Modern web dünyasının en hızlı ve güvenli altyapısı olan Next.js (React), TypeScript ve Tailwind CSS kullanıyoruz. Sitelerimiz mobil öncelikli, SEO uyumlu, yüksek hızda açılan ve kolay yönetilebilir içerik paneline sahip olarak teslim edilir.",
    category: "Web & Teknoloji",
    order: 3,
    status: "published",
    updatedAt: "2026-08-25T10:10:00Z",
  },
  {
    id: "faq-4",
    question: "Aylık raporlama ve performans takibi nasıl yapılıyor?",
    answer:
      "Müşterilerimize şeffaf ve canlı Looker Studio gösterge panelleri sunuyoruz. Düzenli optimizasyon toplantıları ve detaylı performans raporlarıyla erişim, etkileşim, harcama ve getiri metriklerini düzenli olarak paylaşıyoruz.",
    category: "Çalışma Süreci",
    order: 4,
    status: "published",
    updatedAt: "2026-08-25T10:15:00Z",
  },
  {
    id: "faq-5",
    question: "Ofisiniz nerede ve yüz yüze görüşebilir miyiz?",
    answer:
      "Merkezimiz İzmir'de yer almaktadır. Randevu alarak ofisimizde bir kahve eşliğinde yüz yüze görüşebilir ya da dilediğiniz zaman Google Meet / Zoom üzerinden online toplantı planlayabiliriz.",
    category: "Genel",
    order: 5,
    status: "published",
    updatedAt: "2026-08-25T10:20:00Z",
  },
  {
    id: "faq-6",
    question: "Sosyal medya içerik prodüksiyonunu kim hazırlıyor?",
    answer:
      "Profesyonel prodüksiyon ekibimiz; 4K video çekimleri, drone görüntüleri, ses miksajı ve yaratıcı metin yazarlığı dahil olmak üzere tüm içerik süreçlerini uçtan uca ajans bünyesinde hazırlar.",
    category: "Kreatif & İçerik",
    order: 6,
    status: "published",
    updatedAt: "2026-08-25T10:25:00Z",
  },
];

export const initialServices: ServiceItem[] = [
  {
    id: "srv-1",
    title: "Sosyal Medya Yönetimi",
    slug: "sosyal-medya",
    category: "Organik & İçerik",
    iconName: "Share2",
    shortDesc:
      "Markanızın Instagram, TikTok ve LinkedIn hesaplarını veri odaklı kreatif stratejilerle yönetiyor, organik etkileşiminizi artırıyoruz.",
    fullContent: `
### Dijital Dünyada Güçlü ve Kalıcı Bir Topluluk İnşa Edin

Sosyal medya sadece görsel paylaşımı yapılan bir alan değil; markanızın müşterileriyle kurduğu canlı, interaktif ve güven veren bir bağdır. **Digivideas** olarak, markanızın ses tonuna uygun içerik takvimleri, yüksek prodüksiyonlu video kurguları ve düzenli topluluk yönetimi gerçekleştiriyoruz.

#### Neler Yapıyoruz?
- **Stratejik İçerik Planlaması:** Aylık kreatif takvimler, trend analizi ve viral potansiyeli yüksek video konseptleri.
- **Prodüksiyon & Kurgu:** 4K video çekimleri, dinamik Reels/Shorts kurguları ve estetik görsel tasarımlar.
- **Topluluk & İtibar Yönetimi:** Yorum ve DM moderasyonu, kriz yönetimi ve takipçi etkileşim artırımı.
- **Aylık Veri Raporlaması:** Erişim, etkileşim oranı, kitle büyümesi ve dönüşüm metriklerinin detaylı sunumu.
    `,
    features: [
      "Aylık Planlı Özel Reels & Carousel İçerikleri",
      "Kreatif Konsept ve Metin Yazarlığı",
      "Topluluk & Mesaj Moderasyonu",
      "Düzenli Performans Analizleri",
    ],
    deliverables: [
      "Aylık Sosyal Medya Raporu",
      "Özgün Grafik & Video Arşivi",
      "Reels Çekim & Prodüksiyon Desteği",
    ],
    heroImage: "/assets/services/service-sosyal-medya.webp",
    tags: ["Sosyal Medya", "Reels", "İçerik Stratejisi"],
    status: "published",
    order: 1,
    updatedAt: "2026-08-25T10:00:00Z",
  },
  {
    id: "srv-2",
    title: "Performans Pazarlaması & Ads",
    slug: "performans-pazarlamasi",
    category: "Ücretli Reklam",
    iconName: "Target",
    shortDesc:
      "Meta Ads, Google Ads ve TikTok reklamlarında yapay zeka destekli optimizasyonlarla yüksek getiri ve optimize edilmiş edinim maliyeti sunuyoruz.",
    fullContent: `
### Reklam Bütçenizi Veri Odaklı Bir Büyüme Aracına Dönüştürün

Reklam bütçenizi test edilmemiş varsayımlarla harcamak yerine, her bir yatırımın dönüşümünü ölçümleyen veri odaklı huni (funnel) stratejileri uyguluyoruz. Mühendislik temelli analitik yaklaşımımız sayesinde en doğru kitle segmentlerini yakalıyoruz.

#### Neler Sunuyoruz?
- **Meta (Instagram & Facebook) Ads:** Katalog reklamları, CBO bütçe dağılımları ve dinamik yeniden hedefleme (retargeting).
- **Google Search & Performance Max:** Arama niyetine göre optimize edilmiş reklam metinleri ve akıllı teklif stratejileri.
- **TikTok & LinkedIn Ads:** B2C ve B2B markalar için niş kitle segmentasyonu.
- **Dönüşüm Takibi (Server-Side CAPI):** Gizlilik standartlarına tam uyumlu hassas piksel ve CAPI kurulumları.
    `,
    features: [
      "Server-Side Meta CAPI & Pixel Kurulumu",
      "A/B Kreatif & Kitle Testleri",
      "Google Ads & Performance Max Optimizasyonu",
      "Düzenli Kampanya Takibi ve Bütçe Skalalama",
    ],
    deliverables: [
      "Canlı Looker Studio Dashboard",
      "Haftalık Performans Raporları",
      "Kreatif Reklam Varyasyonları",
    ],
    heroImage: "/assets/services/service-performans.webp",
    tags: ["Meta Ads", "Google Ads", "Performans"],
    status: "published",
    order: 2,
    updatedAt: "2026-08-25T10:30:00Z",
  },
  {
    id: "srv-3",
    title: "Web Tasarım & UI/UX",
    slug: "web-tasarim",
    category: "Teknoloji & Tasarım",
    iconName: "Code2",
    shortDesc:
      "Dönüşüm odaklı, ultra hızlı, mobil uyumlu ve modern Next.js tabanlı kurumsal web siteleri ve e-ticaret platformları geliştiriyoruz.",
    fullContent: `
### Ziyaretçilerinizi Müşteriye Dönüştüren Dijital Deneyimler

Bir web sitesi markanızın dijital dünyadaki ana merkezidir. Sadece güzel görünmekle kalmayan, yüksek hızda açılan, SEO dostu ve ziyaretçiyi aksiyona yönlendiren modern web deneyimleri inşa ediyoruz.

#### Mimari ve Süreç
- **Modern Teknolojiler:** Next.js, React, Tailwind CSS ve TypeScript ile yüksek performans ve güvenlik.
- **Kullanıcı Deneyimi (UX):** Kullanıcı yolculuğu analizleriyle tasarlanan sezgisel arayüzler.
- **Yönetim Paneli Kolaylığı:** Kodlama bilmeden tüm içerikleri kolayca güncelleyebileceğiniz modern yönetim panelleri.
- **Mobil Öncelikli Tasarım:** Tüm cihaz ve ekran boyutlarında kusursuz görüntüleme.
    `,
    features: [
      "Next.js ile Ultra Hızlı Sayfa Yüklemeleri",
      "Özelleştirilmiş Yönetim Paneli (CMS)",
      "Mobil ve Tablet %100 Responsive Uyum",
      "Google PageSpeed Standartlarına Uyum",
    ],
    deliverables: [
      "Tam Kaynak Kod ve Dokümantasyon",
      "SEO Altyapısı ve Site Haritası",
      "Özel Yönetim Paneli Eğitimi",
    ],
    heroImage: "/assets/services/service-web-tasarim.webp",
    tags: ["Web Tasarım", "UI/UX", "Next.js"],
    status: "published",
    order: 3,
    updatedAt: "2026-08-25T11:00:00Z",
  },
  {
    id: "srv-4",
    title: "Kreatif Prodüksiyon & Video",
    slug: "kreatif-produksiyon",
    category: "Kreatif & Medya",
    iconName: "Video",
    shortDesc:
      "Markanızın hikayesini sinematik çekimler, drone görüntüleri ve dinamik Reels formatlarıyla görsel bir şölene dönüştürüyoruz.",
    fullContent: `
### Göz Alıcı Görsellerle Dikkatleri Üzerinize Çekin

Dijital dünyada ilk saniyeler çok değerlidir. Kullanıcıların akışta gezinirken durup izleyeceği, dinamik kurgulu ve yüksek kaliteli prodüksiyon çözümleri sunuyoruz.
    `,
    features: [
      "4K Sinematik Kamera & Gimbal Ekipmanı",
      "Profesyonel Stüdyo & Dış Mekan Işıklandırma",
      "Drone Çekimi & Lisanslı Pilot",
      "Ses Tasarımı & Renk Düzeltme (Color Grading)",
    ],
    deliverables: [
      "Yüksek Çözünürlüklü Master Video Dosyaları",
      "Sosyal Medyaya Özel Dikey (9:16) Kurgular",
      "Ham Fotoğraf & Video Arşivi",
    ],
    heroImage: "/assets/services/service-produksiyon.webp",
    tags: ["Prodüksiyon", "Video", "4K"],
    status: "published",
    order: 4,
    updatedAt: "2026-08-25T11:30:00Z",
  },
  {
    id: "srv-5",
    title: "SEO & İçerik Stratejisi",
    slug: "seo-ve-icerik",
    category: "Arama Motoru",
    iconName: "Search",
    shortDesc:
      "Google'da üst sıralara çıkarak organik müşteri trafiğinizi artırın; sürdürülebilir ve kalıcı dijital varlık oluşturun.",
    fullContent: `
### Arama Motorlarında Görünür Olun, Organik Müşteri Kazanın

Arama motoru optimizasyonu (SEO), reklam bütçesine ek olarak düzenli müşteri kazanmanın en güçlü yoludur. Teknik SEO, semantik içerik üretimi ve yerel optimizasyonla sitenizi güçlendiriyoruz.
    `,
    features: [
      "Kapsamlı Anahtar Kelime & Rakip Analizi",
      "Teknik SEO & Core Web Vitals İyileştirmesi",
      "Kullanıcı Niyetine Uygun Blog İçerikleri",
      "Lokal SEO & Google Harita Optimizasyonu",
    ],
    deliverables: [
      "Düzenli Sıralama & Trafik Raporu",
      "Teknik İyileştirme Tablosu",
      "Özgün ve Optimize Edilmiş Makaleler",
    ],
    heroImage: "/assets/services/service-seo.webp",
    tags: ["SEO", "İçerik", "Google"],
    status: "published",
    order: 5,
    updatedAt: "2026-08-25T12:00:00Z",
  },
  {
    id: "srv-6",
    title: "Marka Kimliği & Strateji",
    slug: "marka-kimligi",
    category: "Marka & Tasarım",
    iconName: "Sparkles",
    shortDesc:
      "Logodan kurumsal renklere, marka ses tonundan ambalaj tasarımına kadar akılda kalıcı ve prestijli bir marka kimliği yaratıyoruz.",
    fullContent: `
### Rakiplerinizden Ayrışan, Prestijli ve Zamansız Bir Marka Kimliği

Bir marka sadece bir logodan ibaret değildir; müşterilerinizle kurduğunuz duygusal bağın temelidir. Kurumsal duruşunuzu, değerlerinizi ve vizyonunuzu profesyonel bir tasarım diliyle yansıtıyoruz.
    `,
    features: [
      "Logo Tasarımı & Vektörel Kurumsal Kimlik",
      "Tipografi & Renk Paleti Rehberi",
      "Sosyal Medya Şablonları & Banner Tasarımları",
      "Basılı & Dijital Kurumsal Kimlik Kiti",
    ],
    deliverables: [
      "Kapsamlı Marka Rehberi (Brandbook)",
      "Vektörel Logo & İkon Ailesi",
      "Kartvizit & Kurumsal Materyal Tasarımları",
    ],
    heroImage: "/assets/services/service-marka.webp",
    tags: ["Marka Kimliği", "Logo", "Branding"],
    status: "published",
    order: 6,
    updatedAt: "2026-08-25T12:30:00Z",
  },
];

export const initialCustomers: CustomerItem[] = [
  {
    id: "cust-1",
    name: "Laos Cafe",
    slug: "laoscafe",
    sector: "Gastronomi & 3. Nesil Kahve",
    logoText: "LAOS",
    heroImage: "/assets/customers/laoscafe-hero.webp",
    summary:
      "İzmir'de 3. nesil artisan kahve deneyimi sunan Laos Cafe için kurgulanan 4K Reels video prodüksiyonları, lokal yarıçap hedefli Meta Ads reklamları ve influencer tadım etkinlikleriyle mağaza trafiği ve marka bilinirliği sürekli bir ivme kazandı.",
    story:
      "Laos Cafe, İzmir'in kalbinde artisan kahve kültürünü modern mimari ve sıcak bir sosyal atmosferle buluşturan özel bir marka. Projenin başlangıcında, bölgesel gastronomi pazarındaki yoğun rekabette markanın özgün kahve işleme tekniklerini ve özel tatlı reçetelerini ön plana çıkaracak niteliksel bir dijital dönüşüm planlandı. Digivideas ekibi olarak, stüdyo kalitesinde 4K video çekimleri, dinamik mikro-etkileyici tadım serileri ve İzmir genelinde coğrafi yarıçap optimizasyonlu Meta reklam hunileri tasarladık. Gerçekleştirilen kreatif strateji sonucunda Laos Cafe, sadece bir kahve dükkanı olmanın ötesine geçerek İzmirli genç profesyonellerin ve kahve tutkunlarının vazgeçilmez buluşma noktası haline geldi.",
    challenge:
      "Bölgesel rekabetin yoğun olduğu gastronomi pazarında dinamik genç kitleye ulaşıp şube ziyaretlerini ve yeni menü etkileşimini artırmak.",
    solution:
      "Dinamik 4K Reels video prodüksiyonları, lokal yarıçap hedefli Meta Ads reklamları ve influencer tadım etkinlikleriyle entegre bir dijital lansman kampanyası kurgulandı.",
    results: [
      { label: "Mağaza Trafiği", value: "%45 Artış", growth: "Yerel Erişim" },
      { label: "Marka Bilinirliği", value: "İzmir Odaklı", growth: "Topluluk" },
      { label: "Etkileşim", value: "Yüksek Oran", growth: "İnteraktif" },
    ],
    testimonial: {
      author: "Eren Karaca",
      role: "Kurucu Ortak & Marka Yöneticisi, Laos Cafe",
      quote:
        "Digivideas ile çalışmaya başladıktan sonra kafelerimizdeki etkileşim ve ziyaretçi hareketliliği büyük bir ivme kazandı. Genç, dinamik ve mühendislik titizliğinde çalışan harika bir ekip!",
      avatarUrl: "/assets/team/muaz-avatar.webp",
    },
    galleryImages: [
      "/assets/customers/laoscafe-gallery-1.webp",
      "/assets/customers/laoscafe-gallery-2.webp",
      "/assets/customers/laoscafe-gallery-3.webp",
    ],
    liveUrl: "https://instagram.com/laoscafetr",
    tags: ["Gastronomi", "Meta Ads", "Reels"],
    status: "published",
    featured: true,
    updatedAt: "2026-08-25T14:00:00Z",
  },
  {
    id: "cust-2",
    name: "ModaLab İzmir",
    slug: "modalab",
    sector: "Moda & E-Ticaret",
    logoText: "MODALAB",
    heroImage: "/assets/customers/modalab-hero.webp",
    summary:
      "Sürdürülebilir ve minimalist kadın giyim markası ModaLab için Next.js tabanlı e-ticaret dönüşüm optimizasyonu, dinamik yeniden hedefleme ve kapsül koleksiyon video reklamlarıyla satış hunisi uçtan uca modernize edildi.",
    story:
      "ModaLab, yerel kumaş dokularını çağdaş ve sürdürülebilir tasarım diliyle birleştiren İzmir merkezli bir moda markasıdır. E-ticaret kanalında sepet terk oranlarını düşürmek ve dijital reklam yatırımının kalitesini maksimize etmek amacıyla kapsamlı bir kullanıcı deneyimi (UX) denetimi gerçekleştirdik. Hızlı ve akıcı bir satın alma akışı tasarlarken, Meta ve TikTok platformlarında koleksiyon bazlı video hikayeleri ve dinamik yeniden hedefleme kurguladık. Markanın minimalist duruşunu yansıtan estetik reklam dili, sadık bir müşteri kitlesi ve yüksek geri dönüşlü sipariş döngüsü oluşturdu.",
    challenge:
      "Yüksek sepet terk oranları ve artan dijital reklam maliyetleri nedeniyle e-ticaret dönüşümlerini optimize etmek.",
    solution:
      "Next.js tabanlı e-ticaret dönüşüm optimizasyonu, dinamik yeniden hedefleme (retargeting) ve kapsül koleksiyon video reklamlarıyla huni yeniden tasarlandı.",
    results: [
      { label: "Dönüşüm Oranı", value: "%3.2 Artış", growth: "E-Ticaret" },
      { label: "Sepet Terk", value: "%20 Azalış", growth: "UX" },
      { label: "ROAS", value: "4.5x", growth: "Performans" },
    ],
    testimonial: {
      author: "Selin Yılmaz",
      role: "Pazarlama Direktörü & Marka Yöneticisi, ModaLab",
      quote:
        "Reklam yatırımlarımızı sürdürülebilir bir büyüme modeline dönüştürmek Digivideas'ın veri odaklı yaklaşımı sayesinde gerçekleşti.",
      avatarUrl: "/assets/team/muaz-avatar.webp",
    },
    galleryImages: [
      "/assets/customers/modalab-gallery-1.webp",
      "/assets/customers/modalab-gallery-2.webp",
      "/assets/customers/modalab-gallery-3.webp",
    ],
    liveUrl: "https://instagram.com/modalabizmir",
    tags: ["E-Ticaret", "Moda", "UI/UX"],
    status: "published",
    featured: true,
    updatedAt: "2026-08-25T14:30:00Z",
  },
  {
    id: "cust-3",
    name: "Nova Tech Solutions",
    slug: "nova-tech",
    sector: "Yazılım & B2B SaaS",
    logoText: "NOVATECH",
    heroImage: "/assets/customers/novatech-hero.webp",
    summary:
      "Kurumsal otomasyon yazılımı geliştiren Nova Tech için interaktif web mimarisi, LinkedIn B2B hedefleme stratejisi ve Google Search niyet bazlı reklamlarıyla nitelikli kurumsal müşteri edinim hunisi oluşturuldu.",
    story:
      "Nova Tech Solutions, işletmelerin operasyonel verimliliğini artıran bulut tabanlı yazılımlar üreten öncü bir teknoloji firmasıdır. Teknik altyapılarının karmaşık değer önerisini C-level yöneticilere sade ve etkileyici bir dille anlatmak için özel bir B2B büyüme planı hazırladık. İnteraktif demolarla donatılmış web platformu, niyet odaklı Google Arama reklamları ve karar vericileri hedefleyen LinkedIn kampanyaları ile kurumsal demo taleplerinde istikrarlı ve nitelikli bir akış yakalandı.",
    challenge:
      "Teknik çözümü kurumsal karar vericilere yalın ve etkileyici şekilde aktarıp kaliteli demo talepleri toplamak.",
    solution:
      "İnteraktif web sitesi geliştirildi, LinkedIn B2B kampanyaları ve Google Search niyet bazlı reklamları devreye alındı.",
    results: [
      { label: "Demo Talebi", value: "%60 Artış", growth: "B2B" },
      { label: "Müşteri Edinme", value: "Nitelikli Akış", growth: "LinkedIn" },
      { label: "Web Etkileşimi", value: "Düşük Hemen Çıkma", growth: "UX" },
    ],
    testimonial: {
      author: "Mert Demir",
      role: "CTO & Marka Yöneticisi, Nova Tech",
      quote:
        "Mühendis kökenli bir ajansla çalışmanın farkını ilk günden hissettik. Teknik dilimizi mükemmel anlayıp harika bir pazarlama diline döktüler.",
      avatarUrl: "/assets/team/muaz-avatar.webp",
    },
    galleryImages: [
      "/assets/customers/novatech-gallery-1.webp",
      "/assets/customers/novatech-gallery-2.webp",
      "/assets/customers/novatech-gallery-3.webp",
    ],
    liveUrl: "https://novatech.io",
    tags: ["B2B SaaS", "LinkedIn Ads", "Web Geliştirme"],
    status: "published",
    featured: true,
    updatedAt: "2026-08-25T15:00:00Z",
  },
  {
    id: "cust-4",
    name: "İzmir Gourmet",
    slug: "izmir-gourmet",
    sector: "Organik Gıda & İhracat",
    logoText: "GOURMET",
    heroImage: "/assets/customers/lezzetkoyu-hero.webp",
    summary:
      "Ege'nin organik zeytinyağı ve yöresel lezzetlerini Avrupa'ya taşıyan İzmir Gourmet için çok dilli e-ihracat altyapısı, Avrupa pazar odaklı Meta Ads reklamları ve ambalaj kimliğiyle kalıcı bir marka algısı inşa edildi.",
    story:
      "İzmir Gourmet, Ege Bölgesi'nin asırlık zeytin ağaçlarından elde edilen soğuk sıkım zeytinyağlarını ve gurme lezzetlerini uluslararası pazarlara ulaştırma vizyonuyla yola çıktı. Avrupa pazarında premium bir Türk gıda markası algısı oluşturmak amacıyla Almanca ve İngilizce destekli global web sitesi, sınır ötesi Meta Ads hedefleme hunileri ve prestijli ambalaj tasarım kılavuzları hazırlandı. Bu bütünsel çalışma, markanın Avrupa pazarında güvenilir bir gurme üretici olarak konumlanmasını sağladı.",
    challenge:
      "Avrupa pazarında güvenilir premium Türk gıda markası algısını oluşturmak ve sınır ötesi e-ihracat satışlarını başlatmak.",
    solution:
      "İngilizce & Almanca çok dilli web sitesi, hedef ülke odaklı Meta Ads ve estetik ambalaj tasarımı desteği sağlandı.",
    results: [
      { label: "Global Konumlandırma", value: "Çok Dilli E-İhracat", growth: "Avrupa Pazarı" },
      { label: "Marka İtibarı", value: "Premium Ege Algısı", growth: "Güvenilir Kalite" },
      { label: "Müşteri Sadakati", value: "Sürekli Sipariş", growth: "Sadık Tüketici" },
    ],
    testimonial: {
      author: "Defne Öztürk",
      role: "İhracat Direktörü & Marka Yöneticisi, İzmir Gourmet",
      quote:
        "Ege'nin lezzetlerini Avrupa'ya taşırken Digivideas'ın global vizyonu ve estetik yaklaşımı en büyük güvencemiz oldu.",
      avatarUrl: "/assets/team/muaz-avatar.webp",
    },
    galleryImages: [
      "/assets/customers/lezzetkoyu-gallery-1.webp",
      "/assets/customers/lezzetkoyu-gallery-2.webp",
      "/assets/customers/lezzetkoyu-gallery-3.webp",
    ],
    liveUrl: "https://izmirgourmet.com",
    tags: ["E-İhracat", "Marka Kimliği", "Meta Ads"],
    status: "published",
    featured: false,
    updatedAt: "2026-08-25T15:30:00Z",
  },
];

export const initialBlogPosts: BlogPost[] = [
  {
    id: "blog-1",
    title: "Dijital Pazarlama 2026 Trendleri: Yapay Zeka ve Video Odaklı Dönüşüm",
    slug: "dijital-pazarlama-2026",
    excerpt:
      "2026 yılında markaların büyümesini belirleyen ana unsurlar: Yapay zeka destekli reklam hunileri, dinamik video kurguları ve kişiselleştirilmiş müşteri deneyimleri.",
    content: `
## 2026'da Dijital Reklamcılık Nasıl Evriliyor?

Dijital dünya her zamankinden daha hızlı değişiyor. 2026 yılı itibarıyla statik görseller ve geleneksel hedeflemeler yerini **yapay zeka destekli dinamik içeriklere** ve **kişiselleştirilmiş video deneyimlerine** bıraktı.

### 1. Yapay Zeka Tabanlı Reklam Hunileri (AI Funnels)
Geleneksel A/B testlerinin ötesine geçerek, her kullanıcıya kendi davranış modeline göre optimize edilmiş başlık ve video sekansları sunan akıllı algoritmalar artık standart hale geldi.

### 2. Kısa Video (Reels & Shorts) Hakimiyeti
Kullanıcıların dikkat süresi ilk saniyelerde belirleniyor. Başarılı markalar, ilk 2 saniyede merak uyandıran "hook" kurguları ve yüksek tempolu anlatımla mesajlarını aktarıyor.

### 3. Server-Side Takip ve Veri Güvenliği
Çerezlerin devre dışı kalmasıyla, birinci taraf veri (first-party data) ve Server-Side Conversion API (CAPI) yatırımları markaların rekabette öne geçmesini sağlıyor.

> **Özet:** 2026'da kazanan markalar; teknolojiyi samimi hikaye anlatımıyla harmanlayanlar olacak. Digivideas olarak bu yolculukta yanınızdayız.
    `,
    coverImage: "/assets/blog/blog-ai-trends.webp",
    category: "Strateji & Trendler",
    author: {
      name: "Muaz",
      role: "Kurucu & Baş Mühendis",
      avatar: "/assets/team/muaz-avatar.webp",
    },
    readTimeMinutes: 5,
    tags: ["Yapay Zeka", "2026 Trendleri", "Meta Ads", "Reels"],
    publishedAt: "2026-08-20",
    status: "published",
    featured: true,
  },
  {
    id: "blog-2",
    title: "Instagram Reels Algoritması 2026: Keşfet'e Düşmenin 5 Altın Kuralı",
    slug: "instagram-reels-algoritmasi",
    excerpt:
      "Instagram'ın güncellenen 2026 algoritmasında etkileşimi artıran, tamamlama oranını yükselten ve organik büyümeyi hızlandıran taktikler.",
    content: `
## Reels'ta Etkileşim Şans Değil, Matematiktir

Instagram algoritması artık sadece beğeni ve yorumlara değil; **tamamlama oranı (watch time)** ve **paylaşım (share/save)** metriklerine öncelik veriyor.

### Etkileşimi Artıran 5 Temel Strateji:
1. **İlk 2 Saniye Kuralı:** Görsel veya metin bazlı güçlü bir soru ile akışı durdurun.
2. **Döngü (Loop) Kurgusu:** Videonun sonunu başıyla kusursuz bağlayarak izleyicinin videoyu tekrar izlemesini sağlayın.
3. **Kaydedilebilir Değer Sunun:** İpuçları, kaynak listeleri veya rehber içerikleri paylaşarak 'kaydet' butonuna basılmasını teşvik edin.
4. **Trend Sesleri Doğru Kullanın:** Yükselişte olan sesleri arka plan seviyesinde entegre edin.
5. **Altyazı ve Dinamik Tipografi:** Kullanıcıların büyük kısmı videoları sessiz izliyor. Vurgulu altyazılar şart!
    `,
    coverImage: "/assets/blog/blog-meta-ads.webp",
    category: "Sosyal Medya",
    author: {
      name: "Digivideas Ekibi",
      role: "Kreatif & İçerik Ekibi",
      avatar: "/assets/team/muaz-avatar.webp",
    },
    readTimeMinutes: 4,
    tags: ["Instagram", "Reels", "Algoritma", "Organik Büyüme"],
    publishedAt: "2026-08-15",
    status: "published",
    featured: true,
  },
  {
    id: "blog-3",
    title: "Meta Ads vs Google Ads: 2026'da Markanız İçin Hangi Kanal Daha Verimli?",
    slug: "meta-ads-vs-google-ads",
    excerpt:
      "Hangi aşamada hangi reklam platformuna yatırım yapmalısınız? E-ticaret, B2B ve yerel işletmeler için detaylı bütçe dağıtım rehberi.",
    content: `
## Talep Yaratmak mı, Var Olan Talebi Toplamak mı?

Dijital reklamcılıkta en sık yapılan hata, Meta Ads ve Google Ads'i birbirine rakip olarak görmektir. Aslında bu iki platform birbirini kusursuz tamamlayan bir ikilidir.

### Meta Ads: Talep Yaratma Gücü
Henüz markanızı veya ürününüzü aramayan potansiyel müşterilerin karşısına çıkarak onlarda istek uyandırır. Görsel cazibesi yüksek ürünler için idealdir.

### Google Ads: Arama Niyetini Satışa Çevirme
Halihazırda 'İzmir kahveci' veya 'en iyi kadın ceket' araması yapan, satın almaya hazır kullanıcıları yakalar.

#### Digivideas Tavsiyesi:
Bütçenizi hem talep yaratmaya hem de arama talebini toplamaya dengeli şekilde dağıtarak sürdürülebilir büyüme sağlayabilirsiniz.
    `,
    coverImage: "/assets/blog/blog-nextjs.webp",
    category: "Performans Reklamcılığı",
    author: {
      name: "Muaz",
      role: "Kurucu & Baş Mühendis",
      avatar: "/assets/team/muaz-avatar.webp",
    },
    readTimeMinutes: 6,
    tags: ["Meta Ads", "Google Ads", "Performans", "Bütçe Optimizasyonu"],
    publishedAt: "2026-08-10",
    status: "published",
    featured: false,
  },
];
