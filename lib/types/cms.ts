export type ContentStatus = "published" | "draft";

export interface TagItem {
  id: string;
  name: string;
  slug: string;
  moduleType?: "all" | "services" | "customers" | "blog";
  color?: string;
  createdAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  status: ContentStatus;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  iconName: string;
  shortDesc: string;
  fullContent: string;
  features: string[];
  deliverables: string[];
  heroImage: string;
  videoUrl?: string; // Optional embedded video link (YouTube, Vimeo, MP4, Reels)
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  status: ContentStatus;
  order: number;
  updatedAt: string;
}

export interface MetricItem {
  label: string;
  value: string;
  growth?: string;
}

export interface TestimonialItem {
  author: string;
  role: string;
  quote: string;
  avatarUrl?: string;
}

export interface CustomerItem {
  id: string;
  name: string;
  slug: string;
  sector: string;
  logoText: string;
  heroImage: string;
  videoUrl?: string; // Optional campaign video link
  summary: string;
  story?: string; // Müşteri Hikayesi (Comprehensive narrative for background, execution, and qualitative insights)
  challenge: string;
  solution: string;
  results?: MetricItem[];
  testimonial?: TestimonialItem; // Marka Yöneticisi Yorumu (Brand Manager Review/Quote)
  galleryImages: string[];
  liveUrl?: string; // Müşteri Sayfası / Kampanyayı Canlı Gör (Live Campaign Link)
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  status: ContentStatus;
  featured: boolean;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  videoUrl?: string; // Optional embedded article video
  category: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  readTimeMinutes: number;
  tags: string[];
  publishedAt: string;
  metaTitle?: string;
  metaDescription?: string;
  status: ContentStatus;
  featured: boolean;
}

export interface SiteNarrative {
  brandName: string;
  slogan: string;
  etymology: string;
  location: string;
  footerLocation: string;
  whatsappNumber: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  logoUrl?: string;
  sidebarSmallLogoUrl?: string;
  sidebarWideLogoUrl?: string;
  bizKimiz: string;
  nasilBasladi: string;
  misyonumuz: string;
  vizyonumuz: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  service: string;
  message: string;
  createdAt: string;
}

