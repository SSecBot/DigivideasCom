import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
const assetsDir = path.join(publicDir, 'assets');
const servicesDir = path.join(assetsDir, 'services');
const customersDir = path.join(assetsDir, 'customers');
const blogDir = path.join(assetsDir, 'blog');
const teamDir = path.join(assetsDir, 'team');

[publicDir, assetsDir, servicesDir, customersDir, blogDir, teamDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper to create high-resolution SVG assets using exact #1F1F1F, #282828, #333333 palette
function createHeroSvg({ title, subtitle, category, badge, iconSvg, gradientFrom = '#F97316', gradientTo = '#EA580C', accentColor = '#F97316' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#181818" />
      <stop offset="50%" stop-color="#282828" />
      <stop offset="100%" stop-color="#1F1F1F" />
    </linearGradient>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${gradientFrom}" />
      <stop offset="100%" stop-color="${gradientTo}" />
    </linearGradient>
    <linearGradient id="accentGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#1F1F1F" stop-opacity="0" />
    </linearGradient>
    <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    </pattern>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="20" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="675" fill="url(#bgGrad)" />
  <rect width="1200" height="675" fill="url(#gridPattern)" />

  <!-- Ambient Glow Spheres -->
  <circle cx="950" cy="220" r="280" fill="url(#accentGlow)" filter="url(#glow)" />
  <circle cx="200" cy="500" r="220" fill="url(#accentGlow)" filter="url(#glow)" />

  <!-- Geometric Abstract Tech Backdrop -->
  <g opacity="0.7" transform="translate(680, 80)">
    <rect x="0" y="0" width="420" height="480" rx="32" fill="#282828" fill-opacity="0.8" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
    <rect x="24" y="24" width="372" height="120" rx="20" fill="#1F1F1F" stroke="rgba(249,115,22,0.3)" stroke-width="1" />
    
    <!-- Abstract Chart / UI Lines -->
    <path d="M 50 110 Q 140 60, 220 90 T 360 50" fill="none" stroke="url(#brandGrad)" stroke-width="4" stroke-linecap="round" />
    <circle cx="360" cy="50" r="6" fill="#F97316" filter="url(#glow)" />
    
    <!-- UI Cards inside Graphic -->
    <rect x="24" y="168" width="174" height="130" rx="16" fill="#1F1F1F" stroke="rgba(255,255,255,0.08)" />
    <rect x="222" y="168" width="174" height="130" rx="16" fill="#1F1F1F" stroke="rgba(255,255,255,0.08)" />
    
    <rect x="44" y="190" width="60" height="10" rx="5" fill="#F97316" fill-opacity="0.8" />
    <rect x="44" y="210" width="120" height="8" rx="4" fill="#94A3B8" fill-opacity="0.4" />
    <rect x="44" y="230" width="90" height="8" rx="4" fill="#94A3B8" fill-opacity="0.2" />

    <rect x="242" y="190" width="60" height="10" rx="5" fill="#EA580C" fill-opacity="0.8" />
    <rect x="242" y="210" width="120" height="8" rx="4" fill="#94A3B8" fill-opacity="0.4" />
    <rect x="242" y="230" width="90" height="8" rx="4" fill="#94A3B8" fill-opacity="0.2" />

    <!-- Terminal/Code Block -->
    <rect x="24" y="322" width="372" height="130" rx="16" fill="#181818" stroke="rgba(255,255,255,0.08)" />
    <circle cx="48" cy="344" r="5" fill="#FF5F56" />
    <circle cx="64" cy="344" r="5" fill="#FFBD2E" />
    <circle cx="80" cy="344" r="5" fill="#27C93F" />
    <rect x="48" y="365" width="200" height="8" rx="4" fill="#F97316" fill-opacity="0.6" />
    <rect x="48" y="385" width="280" height="8" rx="4" fill="#888888" fill-opacity="0.5" />
    <rect x="48" y="405" width="160" height="8" rx="4" fill="#888888" fill-opacity="0.3" />
  </g>

  <!-- Left Content Copy -->
  <g transform="translate(100, 160)">
    <!-- Badge -->
    <rect x="0" y="0" width="220" height="36" rx="18" fill="rgba(249, 115, 22, 0.12)" stroke="rgba(249, 115, 22, 0.4)" stroke-width="1" />
    <text x="20" y="23" font-family="Poppins, sans-serif" font-size="13" font-weight="600" fill="#FB923C" letter-spacing="1">${badge.toUpperCase()}</text>

    <!-- Main Title -->
    <text x="0" y="95" font-family="Poppins, sans-serif" font-size="44" font-weight="800" fill="#FAFAFA" letter-spacing="-0.5">${title}</text>
    
    <!-- Subtitle -->
    <text x="0" y="145" font-family="Poppins, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">${subtitle}</text>

    <!-- Category Pill -->
    <g transform="translate(0, 190)">
      <rect x="0" y="0" width="180" height="42" rx="12" fill="#282828" stroke="rgba(255,255,255,0.12)" />
      <text x="20" y="26" font-family="Poppins, sans-serif" font-size="14" font-weight="600" fill="#FAFAFA">digivideas • ${category}</text>
    </g>
  </g>

  <!-- Brand Signature Corner Watermark -->
  <text x="1100" y="630" text-anchor="end" font-family="Poppins, sans-serif" font-size="14" font-weight="700" fill="rgba(255,255,255,0.2)" letter-spacing="2">DIGIVIDEAS.COM</text>
</svg>`;
}

// 1. Generate Logo Asset
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 80" width="360" height="80">
  <defs>
    <linearGradient id="logoOrange" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FB923C" />
      <stop offset="100%" stop-color="#EA580C" />
    </linearGradient>
    <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Brand Symbol Box -->
  <g transform="translate(10, 10)">
    <rect width="60" height="60" rx="16" fill="#282828" stroke="rgba(249,115,22,0.4)" stroke-width="1.5" />
    <rect x="4" y="4" width="52" height="52" rx="12" fill="#1F1F1F" />
    <!-- Gradient Glow Dot -->
    <circle cx="48" cy="14" r="5" fill="#F97316" filter="url(#logoGlow)" />
    <!-- Stylized D & I -->
    <path d="M 20 20 L 32 20 C 38 20, 42 24, 42 30 C 42 36, 38 40, 32 40 L 20 40 Z" fill="none" stroke="url(#logoOrange)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    <line x1="26" y1="20" x2="26" y2="40" stroke="#FAFAFA" stroke-width="3" stroke-linecap="round" />
    <circle cx="26" cy="48" r="2.5" fill="#F97316" />
    <circle cx="36" cy="48" r="2.5" fill="#FAFAFA" />
  </g>

  <!-- Typography: digi ivi deas -->
  <text x="86" y="52" font-family="Poppins, sans-serif" font-size="34" font-weight="800" fill="#FAFAFA" letter-spacing="-0.5">
    digi<tspan fill="#F97316">ivi</tspan>deas
  </text>
</svg>`;

fs.writeFileSync(path.join(assetsDir, 'logo.svg'), logoSvg);
fs.writeFileSync(path.join(assetsDir, 'logo.png'), logoSvg);

// 2. Generate Services Assets
const services = [
  { file: 'service-sosyal-medya.webp', title: 'Sosyal Medya Yönetimi', subtitle: 'İçerik Stratejisi, Reels Prodüksiyonu ve Topluluk Etkileşimi', category: 'Sosyal Medya', badge: 'Kreatif Yönetim' },
  { file: 'service-performans.webp', title: 'Performans Pazarlaması', subtitle: 'Meta & Google Ads Kampanyaları ve Veri Odaklı Büyüme', category: 'Reklam & Büyüme', badge: 'Meta & Google Ads' },
  { file: 'service-web-tasarim.webp', title: 'Web & UI/UX Tasarım', subtitle: 'Next.js 14, Tailwind CSS ve Yüksek Dönüşümlü Arayüzler', category: 'Teknoloji', badge: 'Modern Web Geliştirme' },
  { file: 'service-produksiyon.webp', title: 'Kreatif Prodüksiyon', subtitle: '4K Reklam Filmi, Havadan Çekim ve Profesyonel Kurgu', category: 'Prodüksiyon', badge: 'Stüdyo & Çekim' },
  { file: 'service-seo.webp', title: 'SEO & İçerik Stratejisi', subtitle: 'Arama Motoru Optimizasyonu ve Organik Trafik Büyümesi', category: 'SEO & İçerik', badge: 'Organik Büyüme' },
  { file: 'service-marka.webp', title: 'Kurumsal Marka Kimliği', subtitle: 'Logo, Kurumsal Kimlik Kılavuzu ve Tipografi Mimarisi', category: 'Branding', badge: 'Görsel Kimlik' }
];

services.forEach(s => {
  const svgContent = createHeroSvg({
    title: s.title,
    subtitle: s.subtitle,
    category: s.category,
    badge: s.badge,
    gradientFrom: '#F97316',
    gradientTo: '#EA580C'
  });
  fs.writeFileSync(path.join(servicesDir, s.file), svgContent);
  fs.writeFileSync(path.join(servicesDir, s.file.replace('.webp', '.svg')), svgContent);
});

// 3. Generate Customers Assets & Galleries
const customers = [
  { file: 'laoscafe-hero.webp', title: 'Laos Cafe & Gastro', subtitle: 'Torbalı Gastronomi & Mekan Çekimleri ve Sosyal Medya', category: 'Gastronomi', badge: 'Başarı Hikayesi' },
  { file: 'modalab-hero.webp', title: 'ModaLab E-Ticaret', subtitle: 'Tekstil & Moda Sektöründe Yüksek Dönüşümlü Reklam Kampanyası', category: 'E-Ticaret', badge: 'Dönüşüm Odaklı' },
  { file: 'novatech-hero.webp', title: 'NovaTech B2B Bilişim', subtitle: 'Kurumsal SaaS Platformu Web Tasarımı ve Lead Oluşturma', category: 'Teknoloji & SaaS', badge: 'B2B Büyüme' },
  { file: 'lezzetkoyu-hero.webp', title: 'Lezzet Köyü Organik', subtitle: 'Ege Organik Gıda ve Doğrudan Tüketiciye Satış Stratejisi', category: 'Organik Gıda', badge: 'D2C Satış' }
];

customers.forEach(c => {
  const svgContent = createHeroSvg({
    title: c.title,
    subtitle: c.subtitle,
    category: c.category,
    badge: c.badge,
    gradientFrom: '#F97316',
    gradientTo: '#EA580C'
  });
  fs.writeFileSync(path.join(customersDir, c.file), svgContent);
  fs.writeFileSync(path.join(customersDir, c.file.replace('.webp', '.svg')), svgContent);
});

// Customer gallery images
for (let i = 1; i <= 3; i++) {
  const galSvg = createHeroSvg({
    title: `Kampanya Çekimi #${i}`,
    subtitle: `Yüksek Çözünürlüklü Kreatif Görsel & Video Materyali`,
    category: 'Vaka Galerisi',
    badge: `Galeri Varlık ${i}`,
    gradientFrom: '#EA580C',
    gradientTo: '#C2410C'
  });
  fs.writeFileSync(path.join(customersDir, `laoscafe-gallery-${i}.webp`), galSvg);
  fs.writeFileSync(path.join(customersDir, `modalab-gallery-${i}.webp`), galSvg);
  fs.writeFileSync(path.join(customersDir, `novatech-gallery-${i}.webp`), galSvg);
  fs.writeFileSync(path.join(customersDir, `lezzetkoyu-gallery-${i}.webp`), galSvg);
}

// 4. Generate Blog Assets
const blogPosts = [
  { file: 'blog-ai-trends.webp', title: '2026 Yapay Zeka Trendleri', subtitle: 'Dijital Reklamcılıkta Algoritma ve Üretici Yapay Zeka Entegrasyonları', category: 'Yapay Zeka & Gelecek', badge: 'Trend Raporu' },
  { file: 'blog-meta-ads.webp', title: 'Meta Ads Huni Mimarisi', subtitle: 'Soğuk Trafikten Satışa: 2026 Güncel Reklam Optimizasyon Kılavuzu', category: 'Performans Reklamı', badge: 'Strateji Rehberi' },
  { file: 'blog-nextjs.webp', title: 'Next.js 14 ile Web Tasarım', subtitle: 'Neden Geleneksel CMS Sistemleri Yerine Modern Web Mimarisi?', category: 'Web & Teknoloji', badge: 'Yazılım & Hız' }
];

blogPosts.forEach(b => {
  const svgContent = createHeroSvg({
    title: b.title,
    subtitle: b.subtitle,
    category: b.category,
    badge: b.badge,
    gradientFrom: '#F97316',
    gradientTo: '#EA580C'
  });
  fs.writeFileSync(path.join(blogDir, b.file), svgContent);
  fs.writeFileSync(path.join(blogDir, b.file.replace('.webp', '.svg')), svgContent);
});

// 5. Generate Author Avatar
const avatarSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#282828" />
      <stop offset="100%" stop-color="#1F1F1F" />
    </linearGradient>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FB923C" />
      <stop offset="100%" stop-color="#EA580C" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#avatarGrad)" />
  <circle cx="100" cy="100" r="90" fill="none" stroke="url(#ringGrad)" stroke-width="4" />
  <circle cx="100" cy="75" r="35" fill="#333333" />
  <path d="M 40 165 C 40 125, 160 125, 160 165" fill="#333333" />
  <text x="100" y="85" text-anchor="middle" font-family="Poppins, sans-serif" font-size="28" font-weight="700" fill="#FAFAFA">MD</text>
</svg>`;

fs.writeFileSync(path.join(teamDir, 'muaz-avatar.webp'), avatarSvg);
fs.writeFileSync(path.join(teamDir, 'muaz-avatar.svg'), avatarSvg);

console.log('✅ Successfully generated all 100% local assets with #1F1F1F, #282828, #333333 dark grey palette in public/assets/...');
