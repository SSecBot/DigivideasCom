"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Layers,
  Star,
  BookOpen,
  HelpCircle,
  Settings,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle,
  Eye,
  LogOut,
  LayoutDashboard,
  Sparkles,
  ArrowUpRight,
  Save,
  X,
  Mail,
  RotateCcw,
  Video,
  Globe,
  Tag,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  FileText,
  User,
  Phone,
  MapPin,
  Share2,
  Target,
  Code2,
  Search,
  Quote,
  Link as LinkIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { clearAdminSession } from "@/lib/auth/admin-auth";
import { useCMSStore } from "@/lib/store/cms-store";
import {
  ServiceItem,
  CustomerItem,
  BlogPost,
  FAQItem,
  SiteNarrative,
  TagItem,
} from "@/lib/types/cms";
import { slugify } from "@/lib/utils/slugify";

type ActiveTab =
  | "overview"
  | "services"
  | "customers"
  | "blog"
  | "tags"
  | "faqs"
  | "inquiries"
  | "settings";

export default function AdminDashboardPage() {
  const {
    services,
    customers,
    blogPosts,
    tags,
    faqs,
    narrative,
    inquiries,
    saveService,
    deleteService,
    saveCustomer,
    deleteCustomer,
    saveBlogPost,
    deleteBlogPost,
    saveTag,
    deleteTag,
    saveFAQ,
    deleteFAQ,
    saveNarrative,
    resetToFactoryDefaults,
  } = useCMSStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [successToast, setSuccessToast] = useState("");

  // Modal States
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);

  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<CustomerItem> | null>(null);
  const [newGalleryInput, setNewGalleryInput] = useState("");

  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);

  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Partial<TagItem> | null>(null);

  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<Partial<FAQItem> | null>(null);

  // Settings State
  const [settingsState, setSettingsState] = useState<SiteNarrative>(narrative);

  // Keep settingsState in sync when narrative loads
  useEffect(() => {
    setSettingsState(narrative);
  }, [narrative]);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 3500);
  };

  const handleLogout = () => {
    clearAdminSession();
    window.location.href = "/";
  };

  // Helper to handle local file upload as Data URL
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onSuccess(reader.result);
        triggerToast("Görsel başarıyla yüklendi ve bağlandı!");
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to handle multiple local file uploads as Data URLs
  const handleMultiFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrls: string[]) => void
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const results: string[] = [];
    let processed = 0;

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          results.push(reader.result);
        }
        processed++;
        if (processed === fileList.length) {
          onSuccess(results);
          triggerToast(`${results.length} görsel başarıyla yüklendi ve eklendi!`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // --- SERVICE MODAL HANDLERS ---
  const openNewService = () => {
    setEditingService({
      title: "",
      slug: "",
      category: "Dijital Pazarlama",
      iconName: "Sparkles",
      shortDesc: "",
      fullContent: "### Hizmet Kapsamı\n\nBu hizmet hakkında detaylı açıklamalar, stratejik adımlar ve metodoloji...",
      features: ["Kapsamlı Sektör Analizi", "Özel Reklam Stratejisi", "Haftalık Raporlama Paneli"],
      deliverables: ["Canlı Raporlama Paneli", "Kreatif İçerik Paketi", "Trend Uyumlu Prodüksiyon"],
      heroImage: "/assets/services/service-sosyal-medya.webp",
      videoUrl: "",
      tags: ["Dijital Reklam", "İzmir"],
      metaTitle: "",
      metaDescription: "",
      status: "published",
    });
    setServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.title) return;
    const generatedSlug = saveService(editingService as any);
    setServiceModalOpen(false);
    setEditingService(null);
    triggerToast(`Hizmet kaydedildi! Canlı rota: /services/${generatedSlug}`);
  };

  // --- CUSTOMER MODAL HANDLERS ---
  const openNewCustomer = () => {
    setEditingCustomer({
      name: "",
      slug: "",
      sector: "Gastronomi / E-Ticaret",
      logoText: "",
      heroImage: "/assets/customers/laoscafe-hero.webp",
      videoUrl: "",
      summary: "Müşteri büyüme hikayesi ve dijital pazarlama stratejisi özeti...",
      story: "Müşteri arka planı, stratejik uygulama ve niteliksel başarı içgörülerini içeren kapsamlı müşteri hikayesi...",
      challenge: "Karşılaşılan pazarlama zorlukları ve pazar dinamikleri...",
      solution: "Digivideas tarafından geliştirilen analitik ve kreatif çözüm adımları...",
      testimonial: {
        author: "Marka Yöneticisi Adı",
        role: "Kurucu Ortak & Marka Yöneticisi",
        quote: "Digivideas ekibiyle çalışmak markamızın dijitaldeki görünürlüğünü tamamen değiştirdi.",
        avatarUrl: "/assets/team/muaz-avatar.webp",
      },
      galleryImages: [],
      liveUrl: "https://instagram.com/digivideas",
      tags: ["Meta Ads", "Büyüme"],
      metaTitle: "",
      metaDescription: "",
      status: "published",
      featured: true,
    });
    setCustomerModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer?.name) return;
    const generatedSlug = saveCustomer(editingCustomer as any);
    setCustomerModalOpen(false);
    setEditingCustomer(null);
    triggerToast(`Müşteri vaka analizi kaydedildi! Canlı rota: /customers/${generatedSlug}`);
  };

  // --- BLOG MODAL HANDLERS ---
  const openNewBlog = () => {
    setEditingBlog({
      title: "",
      slug: "",
      excerpt: "",
      content: "## Giriş\n\nDijital pazarlama dünyasındaki son trendler ve stratejiler...\n\n### Temel Bulgular\n\n- Birinci stratejik adım\n- İkinci stratejik adım",
      coverImage: "/assets/blog/blog-ai-trends.webp",
      category: "Pazarlama & Teknoloji",
      author: {
        name: "Muaz",
        role: "Kurucu & Baş Mühendis",
        avatar: "/assets/team/muaz-avatar.webp",
      },
      readTimeMinutes: 5,
      tags: ["Dijital Reklam", "Trendler", "İzmir"],
      metaTitle: "",
      metaDescription: "",
      status: "published",
      featured: false,
    });
    setBlogModalOpen(true);
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog?.title) return;
    const generatedSlug = saveBlogPost(editingBlog as any);
    setBlogModalOpen(false);
    setEditingBlog(null);
    triggerToast(`Makale yayınlandı! Canlı rota: /blog/${generatedSlug}`);
  };

  // --- TAG MODAL HANDLERS ---
  const openNewTag = () => {
    setEditingTag({
      name: "",
      slug: "",
      moduleType: "all",
    });
    setTagModalOpen(true);
  };

  const handleSaveTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag?.name) return;
    const generatedSlug = saveTag(editingTag as any);
    setTagModalOpen(false);
    setEditingTag(null);
    triggerToast(`Etiket kaydedildi: #${generatedSlug}`);
  };

  // --- FAQ MODAL HANDLERS ---
  const openNewFAQ = () => {
    setEditingFAQ({
      question: "",
      answer: "",
      category: "Genel",
      order: faqs.length + 1,
      status: "published",
    });
    setFaqModalOpen(true);
  };

  const handleSaveFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFAQ?.question || !editingFAQ?.answer) return;
    saveFAQ(editingFAQ as any);
    setFaqModalOpen(false);
    setEditingFAQ(null);
    triggerToast("SSS sorusu kaydedildi!");
  };

  // --- SETTINGS HANDLER ---
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveNarrative(settingsState);
    triggerToast("Site ayarları, kurumsal kimlik ve logolar güncellendi!");
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-[#09090B] text-foreground flex flex-col antialiased selection:bg-brand-500 selection:text-slate-950 font-sans">
        {/* Toast Notification Alert */}
        {successToast && (
          <div className="fixed top-6 right-6 z-50 bg-slate-900 border border-brand-500/60 shadow-glow-orange rounded-2xl p-4 flex items-center gap-3 text-sm text-white animate-slideIn">
            <CheckCircle className="w-5 h-5 text-brand-400 flex-shrink-0" />
            <span className="font-medium">{successToast}</span>
          </div>
        )}

        {/* Top Navigation Bar */}
        <header className="h-16 bg-slate-950/90 border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-400 p-0.5 shadow-glow-orange flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
                <span className="font-mono font-black text-sm text-brand-500">di</span>
              </div>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>digivideas CMS</span>
                <span className="text-[10px] font-mono bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-md border border-brand-500/30">
                  Yönetim Paneli
                </span>
              </h1>
              <p className="text-[10px] text-zinc-400 font-mono">İzmir, Türkiye Dijital Reklam Ajansı</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 transition-colors font-mono"
            >
              <span>Siteyi Gör</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 transition-colors font-mono"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </header>

        {/* Main Dashboard Layout */}
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Left Admin Navigation Sidebar */}
          <aside className="w-full md:w-64 bg-slate-950/60 border-b md:border-b-0 md:border-r border-white/10 p-4 space-y-2 flex-shrink-0">
            <div className="px-3 py-2 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              Yönetim Menüsü
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${activeTab === "overview"
                    ? "bg-brand-500 text-slate-950 font-bold shadow-glow-orange"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                <span>Genel Bakış</span>
              </button>

              <button
                onClick={() => setActiveTab("services")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${activeTab === "services"
                    ? "bg-brand-500 text-slate-950 font-bold shadow-glow-orange"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 flex-shrink-0" />
                  <span>Hizmetlerimiz</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/30">
                  {services.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("customers")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${activeTab === "customers"
                    ? "bg-brand-500 text-slate-950 font-bold shadow-glow-orange"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 flex-shrink-0" />
                  <span>Müşterilerimiz</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/30">
                  {customers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("blog")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${activeTab === "blog"
                    ? "bg-brand-500 text-slate-950 font-bold shadow-glow-orange"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 flex-shrink-0" />
                  <span>Blog & Makaleler</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/30">
                  {blogPosts.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("tags")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${activeTab === "tags"
                    ? "bg-brand-500 text-slate-950 font-bold shadow-glow-orange"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 flex-shrink-0" />
                  <span>Etiket Yönetimi</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/30">
                  {tags.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("faqs")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${activeTab === "faqs"
                    ? "bg-brand-500 text-slate-950 font-bold shadow-glow-orange"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 flex-shrink-0" />
                  <span>SSS (Sorular)</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/30">
                  {faqs.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("inquiries")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${activeTab === "inquiries"
                    ? "bg-brand-500 text-slate-950 font-bold shadow-glow-orange"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>Gelen Talepler</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-brand-500/20 text-brand-400">
                  {inquiries.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${activeTab === "settings"
                    ? "bg-brand-500 text-slate-950 font-bold shadow-glow-orange"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                <span>Site Ayarları & Logolar</span>
              </button>
            </nav>

            <div className="pt-6 mt-6 border-t border-white/10">
              <button
                onClick={() => {
                  if (confirm("Tüm değişiklikler sıfırlanıp fabrika varsayılanlarına dönecek. Emin misiniz?")) {
                    resetToFactoryDefaults();
                    triggerToast("Veritabanı başlangıç ayarlarına sıfırlandı!");
                  }
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-mono text-zinc-400 hover:text-brand-400 bg-white/[0.02] hover:bg-white/5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Verileri Sıfırla</span>
              </button>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-7xl">
            {/* 1. TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Genel Bakış & Kokpit</h2>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    digivideas dijital reklam ajansı içerik yönetim sistemi canlı durumu.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
                      <span>Yayındaki Hizmetler</span>
                      <Layers className="w-4 h-4 text-brand-400" />
                    </div>
                    <p className="text-3xl font-bold text-white font-mono">{services.length}</p>
                    <button
                      onClick={() => setActiveTab("services")}
                      className="text-[11px] font-mono text-brand-400 hover:underline"
                    >
                      Hizmetleri Yönet →
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
                      <span>Müşteri Vakaları</span>
                      <Star className="w-4 h-4 text-brand-400" />
                    </div>
                    <p className="text-3xl font-bold text-white font-mono">{customers.length}</p>
                    <button
                      onClick={() => setActiveTab("customers")}
                      className="text-[11px] font-mono text-brand-400 hover:underline"
                    >
                      Vakaları Yönet →
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
                      <span>Blog Makaleleri</span>
                      <BookOpen className="w-4 h-4 text-brand-400" />
                    </div>
                    <p className="text-3xl font-bold text-white font-mono">{blogPosts.length}</p>
                    <button
                      onClick={() => setActiveTab("blog")}
                      className="text-[11px] font-mono text-brand-400 hover:underline"
                    >
                      Makaleleri Yönet →
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
                      <span>İçerik Etiketleri</span>
                      <Tag className="w-4 h-4 text-brand-400" />
                    </div>
                    <p className="text-3xl font-bold text-white font-mono">{tags.length}</p>
                    <button
                      onClick={() => setActiveTab("tags")}
                      className="text-[11px] font-mono text-brand-400 hover:underline"
                    >
                      Etiketleri Yönet →
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
                  <h3 className="text-sm font-mono font-bold text-brand-400 uppercase tracking-wider">
                    Hızlı Aksiyonlar & Sayfa Bağlantıları
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={openNewService}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-xs font-medium text-white flex items-center justify-between transition-colors"
                    >
                      <span>+ Yeni Hizmet Ekle</span>
                      <ArrowUpRight className="w-4 h-4 text-brand-400" />
                    </button>
                    <button
                      onClick={openNewCustomer}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-xs font-medium text-white flex items-center justify-between transition-colors"
                    >
                      <span>+ Yeni Müşteri Vakası Ekle</span>
                      <ArrowUpRight className="w-4 h-4 text-brand-400" />
                    </button>
                    <button
                      onClick={openNewBlog}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-xs font-medium text-white flex items-center justify-between transition-colors"
                    >
                      <span>+ Yeni Blog Makalesi Yaz</span>
                      <ArrowUpRight className="w-4 h-4 text-brand-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TAB: SERVICES */}
            {activeTab === "services" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Hizmetlerimiz Yönetimi</h2>
                    <p className="text-xs text-zinc-400 font-mono mt-1">
                      Hizmet ekleyin, düzenleyin ve anasayfa macOS kokpitiyle canlı senkronize edin.
                    </p>
                  </div>

                  <button
                    onClick={openNewService}
                    className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-glow-orange flex items-center gap-1.5 self-start transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Hizmet Ekle</span>
                  </button>
                </div>

                <div className="bg-slate-950/80 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 border-b border-white/10 text-zinc-400 font-mono">
                        <tr>
                          <th className="p-3.5">Hizmet Adı</th>
                          <th className="p-3.5">Kategori</th>
                          <th className="p-3.5">Rota</th>
                          <th className="p-3.5">Durum</th>
                          <th className="p-3.5 text-right">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-zinc-300">
                        {services.map((srv) => (
                          <tr key={srv.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-3.5 font-medium text-white">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-brand-500" />
                                <span>{srv.title}</span>
                              </div>
                            </td>
                            <td className="p-3.5 font-mono text-zinc-400">{srv.category}</td>
                            <td className="p-3.5 font-mono text-brand-400">/services/{srv.slug}</td>
                            <td className="p-3.5">
                              <button
                                onClick={() => {
                                  const newStatus = srv.status === "published" ? "draft" : "published";
                                  saveService({ ...srv, status: newStatus });
                                  triggerToast(`Durum güncellendi: ${newStatus}`);
                                }}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium ${srv.status === "published"
                                    ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                                    : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                                  }`}
                              >
                                {srv.status === "published" ? "Yayında" : "Taslak"}
                              </button>
                            </td>
                            <td className="p-3.5 text-right space-x-2">
                              <Link
                                href={`/services/${srv.slug}`}
                                target="_blank"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white inline-block transition-colors"
                                title="Sayfayı Gör"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => {
                                  setEditingService(srv);
                                  setServiceModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                                title="Düzenle"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`"${srv.title}" hizmetini silmek istediğinize emin misiniz?`)) {
                                    deleteService(srv.id);
                                    triggerToast("Hizmet silindi!");
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                title="Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. TAB: CUSTOMERS */}
            {activeTab === "customers" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Müşterilerimiz & Vaka Analizleri</h2>
                    <p className="text-xs text-zinc-400 font-mono mt-1">
                      Müşteri vaka analizlerini, Marka Yöneticisi yorumlarını ve canlı kampanya bağlantılarını yönetin.
                    </p>
                  </div>

                  <button
                    onClick={openNewCustomer}
                    className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-glow-orange flex items-center gap-1.5 self-start transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Müşteri Vakası Ekle</span>
                  </button>
                </div>

                <div className="bg-slate-950/80 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 border-b border-white/10 text-zinc-400 font-mono">
                        <tr>
                          <th className="p-3.5">Marka Adı</th>
                          <th className="p-3.5">Sektör</th>
                          <th className="p-3.5">Rota</th>
                          <th className="p-3.5">Marka Yöneticisi</th>
                          <th className="p-3.5">Durum</th>
                          <th className="p-3.5 text-right">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-zinc-300">
                        {customers.map((cust) => (
                          <tr key={cust.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-3.5 font-medium text-white">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-brand-500" />
                                <span>{cust.name}</span>
                              </div>
                            </td>
                            <td className="p-3.5 font-mono text-zinc-400">{cust.sector}</td>
                            <td className="p-3.5 font-mono text-brand-400">/customers/{cust.slug}</td>
                            <td className="p-3.5 text-xs text-zinc-300">
                              {cust.testimonial?.author ? (
                                <span className="font-mono text-zinc-300">{cust.testimonial.author}</span>
                              ) : (
                                <span className="text-zinc-500 font-mono italic">Belirtilmedi</span>
                              )}
                            </td>
                            <td className="p-3.5">
                              <button
                                onClick={() => {
                                  const newStatus = cust.status === "published" ? "draft" : "published";
                                  saveCustomer({ ...cust, status: newStatus });
                                  triggerToast(`Vaka durumu güncellendi: ${newStatus}`);
                                }}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium ${cust.status === "published"
                                    ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                                    : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                                  }`}
                              >
                                {cust.status === "published" ? "Yayında" : "Taslak"}
                              </button>
                            </td>
                            <td className="p-3.5 text-right space-x-2">
                              <Link
                                href={`/customers/${cust.slug}`}
                                target="_blank"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white inline-block transition-colors"
                                title="Sayfayı Gör"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => {
                                  setEditingCustomer(cust);
                                  setCustomerModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                                title="Düzenle"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`"${cust.name}" vaka analizini silmek istediğinize emin misiniz?`)) {
                                    deleteCustomer(cust.id);
                                    triggerToast("Müşteri vakası silindi!");
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                title="Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 4. TAB: BLOG */}
            {activeTab === "blog" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Blog & Makaleler</h2>
                    <p className="text-xs text-zinc-400 font-mono mt-1">
                      Dijital reklamcılık ve 2026 pazarlama trendleri yazılarını yönetin.
                    </p>
                  </div>

                  <button
                    onClick={openNewBlog}
                    className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-glow-orange flex items-center gap-1.5 self-start transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Makale Yaz</span>
                  </button>
                </div>

                <div className="bg-slate-950/80 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 border-b border-white/10 text-zinc-400 font-mono">
                        <tr>
                          <th className="p-3.5">Başlık</th>
                          <th className="p-3.5">Kategori</th>
                          <th className="p-3.5">Yazar</th>
                          <th className="p-3.5">Tarih</th>
                          <th className="p-3.5">Durum</th>
                          <th className="p-3.5 text-right">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-zinc-300">
                        {blogPosts.map((post) => (
                          <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-3.5 font-medium text-white max-w-xs truncate">
                              {post.title}
                            </td>
                            <td className="p-3.5 font-mono text-zinc-400">{post.category}</td>
                            <td className="p-3.5 text-zinc-300">{post.author?.name}</td>
                            <td className="p-3.5 font-mono text-zinc-400">{post.publishedAt}</td>
                            <td className="p-3.5">
                              <button
                                onClick={() => {
                                  const newStatus = post.status === "published" ? "draft" : "published";
                                  saveBlogPost({ ...post, status: newStatus });
                                  triggerToast(`Makale durumu güncellendi: ${newStatus}`);
                                }}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium ${post.status === "published"
                                    ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                                    : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                                  }`}
                              >
                                {post.status === "published" ? "Yayında" : "Taslak"}
                              </button>
                            </td>
                            <td className="p-3.5 text-right space-x-2">
                              <Link
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white inline-block transition-colors"
                                title="Makaleyi Gör"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => {
                                  setEditingBlog(post);
                                  setBlogModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                                title="Düzenle"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`"${post.title}" makalesini silmek istediğinize emin misiniz?`)) {
                                    deleteBlogPost(post.id);
                                    triggerToast("Makale silindi!");
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                title="Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 5. TAB: TAGS MANAGEMENT */}
            {activeTab === "tags" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Etiket Yönetimi (Tag Manager)</h2>
                    <p className="text-xs text-zinc-400 font-mono mt-1">
                      Hizmetler, portföy müşteri vakaları ve blog yazıları için etiketleri merkezi olarak yönetin.
                    </p>
                  </div>

                  <button
                    onClick={openNewTag}
                    className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-glow-orange flex items-center gap-1.5 self-start transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Etiket Ekle</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-brand-500/30 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-brand-400" />
                          <span className="font-bold text-white text-sm">{tag.name}</span>
                        </div>
                        <p className="text-[11px] font-mono text-zinc-400">Slug: #{tag.slug}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingTag(tag);
                            setTagModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`"${tag.name}" etiketini silmek istediğinize emin misiniz?`)) {
                              deleteTag(tag.id);
                              triggerToast("Etiket silindi!");
                            }
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. TAB: FAQS */}
            {activeTab === "faqs" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Sıkça Sorulan Sorular (SSS)</h2>
                    <p className="text-xs text-zinc-400 font-mono mt-1">
                      Hem anasayfadaki akordeon alanını hem de /faq sayfasındaki soruları yönetin.
                    </p>
                  </div>

                  <button
                    onClick={openNewFAQ}
                    className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-glow-orange flex items-center gap-1.5 self-start transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Soru Ekle</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-brand-500/30 flex items-start justify-between gap-4 transition-all"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-brand-500/15 text-brand-400 px-2 py-0.5 rounded-full border border-brand-500/30 font-medium">
                            {faq.category}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono">Sıra: {faq.order}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{faq.question}</h4>
                        <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">{faq.answer}</p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditingFAQ(faq);
                            setFaqModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Bu soruyu silmek istediğinize emin misiniz?")) {
                              deleteFAQ(faq.id);
                              triggerToast("SSS sorusu silindi!");
                            }
                          }}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. TAB: INQUIRIES */}
            {activeTab === "inquiries" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Gelen Müşteri Talepleri</h2>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    İletişim formu üzerinden gönderilen teklif ve bilgi talepleri.
                  </p>
                </div>

                {inquiries.length === 0 ? (
                  <div className="p-12 rounded-3xl bg-slate-950/60 border border-white/10 text-center space-y-3">
                    <Mail className="w-8 h-8 text-zinc-500 mx-auto" />
                    <p className="text-sm text-zinc-300 font-medium">Henüz gelen bir talep bulunmuyor.</p>
                    <p className="text-xs text-zinc-500">İletişim formundan gönderilen mesajlar burada listelenecektir.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inquiries.map((inq) => (
                      <div
                        key={inq.id}
                        className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                          <div>
                            <span className="text-sm font-bold text-white">{inq.name}</span>
                            {inq.company && (
                              <span className="text-xs text-zinc-400 ml-2">({inq.company})</span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500">
                            {new Date(inq.createdAt).toLocaleString("tr-TR")}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                          <div className="text-brand-400">Hizmet: {inq.service}</div>
                          <div className="text-zinc-300">E-posta: {inq.email}</div>
                          <div className="text-zinc-300">Tel: {inq.phone}</div>
                        </div>

                        <p className="text-xs text-zinc-200 bg-white/5 p-3 rounded-xl leading-relaxed">
                          {inq.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 8. TAB: SETTINGS */}
            {activeTab === "settings" && (
              <div className="space-y-8 max-w-4xl">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Site Ayarları & Kurumsal Kimlik</h2>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    Logoları, sloganı, etimolojiyi, lokasyonları ve sosyal medya bağlantılarını düzenleyin.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* Branding & Logos Card */}
                  <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-5">
                    <h3 className="text-sm font-mono font-bold text-brand-400 uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>Logo Varlıkları & Medya Yönetimi</span>
                    </h3>

                    {/* Top Center Logo */}
                    <div className="space-y-2">
                      <label className="block text-xs font-mono text-zinc-300">
                        Üst Menü / Navbar Ana Logo URL veya Yerel Dosya
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={settingsState.logoUrl || ""}
                          onChange={(e) => setSettingsState({ ...settingsState, logoUrl: e.target.value })}
                          placeholder="/assets/logo.png veya https://..."
                          className="flex-1 bg-slate-950 border border-white/15 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                        />
                        <label className="bg-white/10 hover:bg-white/20 text-white text-xs font-mono px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Yükle</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, (url) => setSettingsState({ ...settingsState, logoUrl: url }))}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Dual Sidebar Logos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <label className="block text-xs font-mono text-zinc-300">
                          Sol Kenar Çubuğu Küçük İkon Logo
                        </label>
                        <input
                          type="text"
                          value={settingsState.sidebarSmallLogoUrl || ""}
                          onChange={(e) => setSettingsState({ ...settingsState, sidebarSmallLogoUrl: e.target.value })}
                          placeholder="/assets/logo.png"
                          className="w-full bg-slate-950 border border-white/15 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-mono text-zinc-300">
                          Sol Kenar Çubuğu Geniş Logo Grafik
                        </label>
                        <input
                          type="text"
                          value={settingsState.sidebarWideLogoUrl || ""}
                          onChange={(e) => setSettingsState({ ...settingsState, sidebarWideLogoUrl: e.target.value })}
                          placeholder="/assets/logo.png"
                          className="w-full bg-slate-950 border border-white/15 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Slogan, Locations & Identity Card */}
                  <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
                    <h3 className="text-sm font-mono font-bold text-brand-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Kurumsal Metinler & Lokasyon Standartları</span>
                    </h3>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-zinc-300">
                        Şirket Sloganı *
                      </label>
                      <textarea
                        rows={2}
                        value={settingsState.slogan}
                        onChange={(e) => setSettingsState({ ...settingsState, slogan: e.target.value })}
                        className="w-full bg-slate-950 border border-white/15 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-zinc-300">
                          Standart Lokasyon (Header, Hero, Kartlar)
                        </label>
                        <input
                          type="text"
                          value={settingsState.location}
                          onChange={(e) => setSettingsState({ ...settingsState, location: e.target.value })}
                          placeholder="İzmir, Türkiye"
                          className="w-full bg-slate-950 border border-white/15 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-zinc-300">
                          Footer Özel Lokasyon
                        </label>
                        <input
                          type="text"
                          value={settingsState.footerLocation}
                          onChange={(e) => setSettingsState({ ...settingsState, footerLocation: e.target.value })}
                          placeholder="İzmir, Torbalı, Türkiye"
                          className="w-full bg-slate-950 border border-white/15 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-zinc-300">
                          WhatsApp Hattı
                        </label>
                        <input
                          type="text"
                          value={settingsState.whatsappNumber}
                          onChange={(e) => setSettingsState({ ...settingsState, whatsappNumber: e.target.value })}
                          placeholder="+905492115561"
                          className="w-full bg-slate-950 border border-white/15 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-zinc-300">
                          Facebook URL
                        </label>
                        <input
                          type="text"
                          value={settingsState.facebookUrl || ""}
                          onChange={(e) => setSettingsState({ ...settingsState, facebookUrl: e.target.value })}
                          placeholder="https://facebook.com/..."
                          className="w-full bg-slate-950 border border-white/15 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-zinc-300">
                          Instagram URL
                        </label>
                        <input
                          type="text"
                          value={settingsState.instagramUrl || ""}
                          onChange={(e) => setSettingsState({ ...settingsState, instagramUrl: e.target.value })}
                          placeholder="https://instagram.com/..."
                          className="w-full bg-slate-950 border border-white/15 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold px-8 py-3.5 rounded-2xl shadow-glow-orange flex items-center gap-2 text-sm transition-all active:scale-98"
                  >
                    <Save className="w-4 h-4" />
                    <span>Tüm Ayarları Kaydet</span>
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>

        {/* --- MODAL 1: SERVICE EDIT / CREATE --- */}
        {serviceModalOpen && editingService && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white">
                  {editingService.id ? "Hizmeti Düzenle" : "Yeni Hizmet Ekle"}
                </h3>
                <button
                  onClick={() => setServiceModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-zinc-300">Hizmet Başlığı *</label>
                    <input
                      type="text"
                      required
                      value={editingService.title || ""}
                      onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                      placeholder="Örn: Sosyal Medya Yönetimi"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-zinc-300">URL Slug (Otomatik)</label>
                    <input
                      type="text"
                      value={editingService.slug || ""}
                      onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                      placeholder="sosyal-medya"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-zinc-300">Kategori</label>
                    <input
                      type="text"
                      value={editingService.category || ""}
                      onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                      placeholder="Organik & İçerik"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-zinc-300">İkon Adı</label>
                    <select
                      value={editingService.iconName || "Sparkles"}
                      onChange={(e) => setEditingService({ ...editingService, iconName: e.target.value })}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Share2">Share2 (Sosyal Medya)</option>
                      <option value="Target">Target (Performans Reklam)</option>
                      <option value="Code2">Code2 (Web Tasarım)</option>
                      <option value="Video">Video (Kreatif Prodüksiyon)</option>
                      <option value="Search">Search (SEO & Arama)</option>
                      <option value="Sparkles">Sparkles (Yapay Zeka & Diğer)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-zinc-300">Yayın Durumu</label>
                    <select
                      value={editingService.status || "published"}
                      onChange={(e) => setEditingService({ ...editingService, status: e.target.value as any })}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="published">Yayında</option>
                      <option value="draft">Taslak</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300">Kısa Açıklama (Özet) *</label>
                  <textarea
                    rows={2}
                    required
                    value={editingService.shortDesc || ""}
                    onChange={(e) => setEditingService({ ...editingService, shortDesc: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300">Kapak Görseli URL & Dosya Yükleyici</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingService.heroImage || ""}
                      onChange={(e) => setEditingService({ ...editingService, heroImage: e.target.value })}
                      placeholder="/assets/services/service-sosyal-medya.webp"
                      className="flex-1 bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                    <label className="bg-white/10 hover:bg-white/20 text-white text-xs font-mono px-3 py-2 rounded-xl cursor-pointer flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Yükle</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (url) => setEditingService({ ...editingService, heroImage: url }))}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300">İçerik Etiketleri (Virgülle ayırın)</label>
                  <input
                    type="text"
                    value={editingService.tags?.join(", ") || ""}
                    onChange={(e) => setEditingService({ ...editingService, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                    placeholder="Meta Ads, Reels, İzmir Ajans"
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300">Öne Çıkan Özellikler (Virgülle ayırın)</label>
                  <input
                    type="text"
                    value={editingService.features?.join(", ") || ""}
                    onChange={(e) => setEditingService({ ...editingService, features: e.target.value.split(",").map(s => s.trim()) })}
                    placeholder="4K Video Kurgusu, Aylık Planlama, DM Moderasyonu"
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300">Paket Çıktıları (Virgülle ayırın)</label>
                  <input
                    type="text"
                    value={editingService.deliverables?.join(", ") || ""}
                    onChange={(e) => setEditingService({ ...editingService, deliverables: e.target.value.split(",").map(s => s.trim()) })}
                    placeholder="Özgün Grafik Arşivi, Canlı Rapor Paneli, Trend Çekimleri"
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300">Detaylı Sayfa İçeriği (Markdown)</label>
                  <textarea
                    rows={4}
                    value={editingService.fullContent || ""}
                    onChange={(e) => setEditingService({ ...editingService, fullContent: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setServiceModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow-glow-orange"
                  >
                    Kaydet & Yayınla
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL 2: CUSTOMER EDIT / CREATE --- */}
        {customerModalOpen && editingCustomer && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white">
                  {editingCustomer.id ? "Müşteri Vakasını Düzenle" : "Yeni Müşteri Vakası Ekle"}
                </h3>
                <button
                  onClick={() => setCustomerModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCustomer} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-zinc-300">Müşteri / Marka Adı *</label>
                    <input
                      type="text"
                      required
                      value={editingCustomer.name || ""}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                      placeholder="Örn: Laos Cafe"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-zinc-300">URL Slug</label>
                    <input
                      type="text"
                      value={editingCustomer.slug || ""}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, slug: e.target.value })}
                      placeholder="laoscafe"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-zinc-300">Sektör</label>
                    <input
                      type="text"
                      value={editingCustomer.sector || ""}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, sector: e.target.value })}
                      placeholder="Gastronomi & Kahve"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-zinc-300">Durum</label>
                    <select
                      value={editingCustomer.status || "published"}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, status: e.target.value as any })}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="published">Yayında</option>
                      <option value="draft">Taslak</option>
                    </select>
                  </div>
                </div>

                {/* Live Campaign Link URL Editor */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-brand-400" />
                    <span>Müşteri Sayfası / Kampanyayı Canlı Gör URL (Live Campaign Link)</span>
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.liveUrl || ""}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, liveUrl: e.target.value })}
                    placeholder="https://instagram.com/... veya https://..."
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                {/* Hero Image */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300">Kapak Görseli URL & Yükleyici</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingCustomer.heroImage || ""}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, heroImage: e.target.value })}
                      placeholder="/assets/customers/laoscafe-hero.webp"
                      className="flex-1 bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                    <label className="bg-white/10 hover:bg-white/20 text-white text-xs font-mono px-3 py-2 rounded-xl cursor-pointer flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Yükle</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (url) => setEditingCustomer({ ...editingCustomer, heroImage: url }))}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300">İçerik Etiketleri (Virgülle ayırın)</label>
                  <input
                    type="text"
                    value={editingCustomer.tags?.join(", ") || ""}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                    placeholder="Gastronomi, Meta Ads, Reels"
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300">Kısa Vaka Özeti *</label>
                  <textarea
                    rows={2}
                    required
                    value={editingCustomer.summary || ""}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, summary: e.target.value })}
                    placeholder="Kartlarda ve özet alanlarında görüntülenecek kısa tanıtım..."
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                    <span>Müşteri Hikayesi (Client Story - Detaylı Anlatı & Stratejik Başarı) *</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={editingCustomer.story || editingCustomer.summary || ""}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, story: e.target.value })}
                    placeholder="Müşteri arka planı, stratejik uygulama ve niteliksel başarı içgörülerini içeren kapsamlı müşteri hikayesi..."
                    className="w-full bg-slate-950 border border-white/15 focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none leading-relaxed font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-zinc-300">Pazar Zorluğu (The Challenge)</label>
                    <textarea
                      rows={3}
                      value={editingCustomer.challenge || ""}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, challenge: e.target.value })}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-zinc-300">Digivideas Çözümü (The Solution)</label>
                    <textarea
                      rows={3}
                      value={editingCustomer.solution || ""}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, solution: e.target.value })}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Marka Yöneticisi Yorumu (Brand Manager Review/Quote Editor) */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-brand-500/30 space-y-3">
                  <h4 className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5" />
                    <span>Marka Yöneticisi Yorumu (Brand Manager Review/Quote)</span>
                  </h4>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-300">Yorum Metni (Quote)</label>
                    <textarea
                      rows={2}
                      value={editingCustomer.testimonial?.quote || ""}
                      onChange={(e) =>
                        setEditingCustomer({
                          ...editingCustomer,
                          testimonial: {
                            author: editingCustomer.testimonial?.author || "",
                            role: editingCustomer.testimonial?.role || "",
                            quote: e.target.value,
                            avatarUrl: editingCustomer.testimonial?.avatarUrl || "",
                          },
                        })
                      }
                      placeholder="Müşterinin ajansımız hakkındaki yorumu..."
                      className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-zinc-300">Yetkili Adı Soyadı</label>
                      <input
                        type="text"
                        value={editingCustomer.testimonial?.author || ""}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            testimonial: {
                              quote: editingCustomer.testimonial?.quote || "",
                              author: e.target.value,
                              role: editingCustomer.testimonial?.role || "",
                              avatarUrl: editingCustomer.testimonial?.avatarUrl || "",
                            },
                          })
                        }
                        placeholder="Örn: Eren Karaca"
                        className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-zinc-300">Unvan & Pozisyon</label>
                      <input
                        type="text"
                        value={editingCustomer.testimonial?.role || ""}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            testimonial: {
                              quote: editingCustomer.testimonial?.quote || "",
                              author: editingCustomer.testimonial?.author || "",
                              role: e.target.value,
                              avatarUrl: editingCustomer.testimonial?.avatarUrl || "",
                            },
                          })
                        }
                        placeholder="Örn: Kurucu Ortak & Marka Yöneticisi"
                        className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Dynamic Campaign Image Gallery Management (Kampanya Görsel Galerisi) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-brand-500/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-brand-400" />
                        <span>Kampanya Görsel Galerisi (Campaign Media Gallery)</span>
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                        Müşteri detay sayfasındaki yavaş kayan kesintisiz karusel galerisinde sergilenecek görsel varlıklarını ekleyin, sıralayın ve yönetin.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className="text-[11px] font-mono text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
                        {editingCustomer.galleryImages?.length || 0} Görsel
                      </div>
                      {(editingCustomer.galleryImages?.length || 0) > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Tüm galeri görsellerini kaldırmak istediğinize emin misiniz?")) {
                              setEditingCustomer({ ...editingCustomer, galleryImages: [] });
                              triggerToast("Tüm galeri görselleri temizlendi.");
                            }
                          }}
                          className="text-[10px] font-mono text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-lg border border-red-500/30 transition-colors"
                        >
                          Temizle
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Current Gallery List */}
                  <div className="space-y-3">
                    {(!editingCustomer.galleryImages || editingCustomer.galleryImages.length === 0) ? (
                      <div className="p-6 rounded-xl bg-slate-900/60 border border-dashed border-white/15 text-center space-y-2">
                        <p className="text-xs text-zinc-400">Henüz kampanya galerisi görseli eklenmedi.</p>
                        <p className="text-[11px] text-zinc-500">
                          Aşağıdaki çoklu dosya yükleyiciyi veya URL kutusunu kullanarak sınırsız sayıda görsel ekleyebilirsiniz.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {editingCustomer.galleryImages.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-900 border border-white/10 flex flex-col sm:flex-row sm:items-center gap-3 group hover:border-brand-500/40 transition-colors"
                          >
                            {/* Thumbnail Preview */}
                            <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-slate-950 border border-white/10 flex-shrink-0 flex items-center justify-center">
                              <img
                                src={imgUrl}
                                alt={`Galeri ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-mono px-1 rounded text-zinc-300">
                                #{idx + 1}
                              </span>
                            </div>

                            {/* URL Input */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <input
                                type="text"
                                value={imgUrl}
                                onChange={(e) => {
                                  const updatedGallery = [...(editingCustomer.galleryImages || [])];
                                  updatedGallery[idx] = e.target.value;
                                  setEditingCustomer({ ...editingCustomer, galleryImages: updatedGallery });
                                }}
                                placeholder="/assets/customers/... veya https://..."
                                className="w-full bg-slate-950 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                              />
                            </div>

                            {/* Actions: Replace, Move Up, Move Down, Delete */}
                            <div className="flex items-center gap-1.5 self-end sm:self-center">
                              {/* Replace upload trigger */}
                              <label
                                title="Görseli Değiştir / Yükle"
                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-mono"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Değiştir</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleFileUpload(e, (url) => {
                                      const updatedGallery = [...(editingCustomer.galleryImages || [])];
                                      updatedGallery[idx] = url;
                                      setEditingCustomer({ ...editingCustomer, galleryImages: updatedGallery });
                                    })
                                  }
                                />
                              </label>

                              {/* Move Up */}
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  if (idx === 0) return;
                                  const updatedGallery = [...(editingCustomer.galleryImages || [])];
                                  const temp = updatedGallery[idx - 1];
                                  updatedGallery[idx - 1] = updatedGallery[idx];
                                  updatedGallery[idx] = temp;
                                  setEditingCustomer({ ...editingCustomer, galleryImages: updatedGallery });
                                }}
                                title="Yukarı / Öne Taşı"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>

                              {/* Move Down */}
                              <button
                                type="button"
                                disabled={idx === (editingCustomer.galleryImages?.length || 0) - 1}
                                onClick={() => {
                                  if (!editingCustomer.galleryImages || idx >= editingCustomer.galleryImages.length - 1) return;
                                  const updatedGallery = [...editingCustomer.galleryImages];
                                  const temp = updatedGallery[idx + 1];
                                  updatedGallery[idx + 1] = updatedGallery[idx];
                                  updatedGallery[idx] = temp;
                                  setEditingCustomer({ ...editingCustomer, galleryImages: updatedGallery });
                                }}
                                title="Aşağı / Arkaya Taşı"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete item */}
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedGallery = (editingCustomer.galleryImages || []).filter((_, i) => i !== idx);
                                  setEditingCustomer({ ...editingCustomer, galleryImages: updatedGallery });
                                  triggerToast("Görsel galeriden kaldırıldı.");
                                }}
                                title="Görseli Sil"
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add New Gallery Image Toolbar */}
                  <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newGalleryInput}
                      onChange={(e) => setNewGalleryInput(e.target.value)}
                      placeholder="Yeni görsel URL'si girin (örn: /assets/customers/...)"
                      className="flex-1 bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newGalleryInput.trim()) return;
                        const updatedGallery = [...(editingCustomer.galleryImages || []), newGalleryInput.trim()];
                        setEditingCustomer({ ...editingCustomer, galleryImages: updatedGallery });
                        setNewGalleryInput("");
                        triggerToast("Yeni görsel galeriye eklendi!");
                      }}
                      className="bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 border border-brand-500/40 text-xs font-mono font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>URL ile Ekle</span>
                    </button>
                    <label className="bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs font-mono font-bold px-4 py-2 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-glow-orange transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Çoklu Dosya Yükle</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) =>
                          handleMultiFileUpload(e, (urls) => {
                            const updatedGallery = [...(editingCustomer.galleryImages || []), ...urls];
                            setEditingCustomer({ ...editingCustomer, galleryImages: updatedGallery });
                          })
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setCustomerModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow-glow-orange"
                  >
                    Kaydet & Yayınla
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL 3: BLOG EDIT / CREATE --- */}
        {blogModalOpen && editingBlog && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white">
                  {editingBlog.id ? "Makaleyi Düzenle" : "Yeni Makale Yaz"}
                </h3>
                <button
                  onClick={() => setBlogModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBlog} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-zinc-300">Makale Başlığı *</label>
                    <input
                      type="text"
                      required
                      value={editingBlog.title || ""}
                      onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                      placeholder="Örn: 2026'da Yapay Zeka ile Reklamcılık"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-zinc-300">Kategori</label>
                    <input
                      type="text"
                      value={editingBlog.category || ""}
                      onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                      placeholder="Pazarlama & Teknoloji"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300">Kapak Görseli URL & Yükleyici</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingBlog.coverImage || ""}
                      onChange={(e) => setEditingBlog({ ...editingBlog, coverImage: e.target.value })}
                      placeholder="/assets/blog/blog-ai-trends.webp"
                      className="flex-1 bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                    <label className="bg-white/10 hover:bg-white/20 text-white text-xs font-mono px-3 py-2 rounded-xl cursor-pointer flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Yükle</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (url) => setEditingBlog({ ...editingBlog, coverImage: url }))}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300">İçerik Etiketleri (Virgülle ayırın)</label>
                  <input
                    type="text"
                    value={editingBlog.tags?.join(", ") || ""}
                    onChange={(e) => setEditingBlog({ ...editingBlog, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                    placeholder="Yapay Zeka, Meta Ads, 2026 Trendleri"
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300">Kısa Özet *</label>
                  <textarea
                    rows={2}
                    required
                    value={editingBlog.excerpt || ""}
                    onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300">Makale İçeriği (Markdown) *</label>
                  <textarea
                    rows={6}
                    required
                    value={editingBlog.content || ""}
                    onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setBlogModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow-glow-orange"
                  >
                    Kaydet & Yayınla
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL 4: TAG EDIT / CREATE --- */}
        {tagModalOpen && editingTag && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white">
                  {editingTag.id ? "Etiketi Düzenle" : "Yeni Etiket Oluştur"}
                </h3>
                <button
                  onClick={() => setTagModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTag} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300">Etiket Adı *</label>
                  <input
                    type="text"
                    required
                    value={editingTag.name || ""}
                    onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                    placeholder="Örn: Meta Ads"
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300">URL Slug (İsteğe Bağlı)</label>
                  <input
                    type="text"
                    value={editingTag.slug || ""}
                    onChange={(e) => setEditingTag({ ...editingTag, slug: e.target.value })}
                    placeholder="meta-ads"
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300">Geçerli Modül</label>
                  <select
                    value={editingTag.moduleType || "all"}
                    onChange={(e) => setEditingTag({ ...editingTag, moduleType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="all">Tüm Modüller (Genel)</option>
                    <option value="services">Sadece Hizmetler</option>
                    <option value="customers">Sadece Müşteriler</option>
                    <option value="blog">Sadece Blog</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setTagModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow-glow-orange"
                  >
                    Etiketi Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL 5: FAQ EDIT / CREATE --- */}
        {faqModalOpen && editingFAQ && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white">
                  {editingFAQ.id ? "SSS Sorusunu Düzenle" : "Yeni SSS Sorusu"}
                </h3>
                <button
                  onClick={() => setFaqModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveFAQ} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300">Soru Başlığı *</label>
                  <input
                    type="text"
                    required
                    value={editingFAQ.question || ""}
                    onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                    placeholder="Örn: Proje süreci nasıl işler?"
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-zinc-300">Kategori</label>
                    <input
                      type="text"
                      value={editingFAQ.category || ""}
                      onChange={(e) => setEditingFAQ({ ...editingFAQ, category: e.target.value })}
                      placeholder="Genel"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-zinc-300">Görüntülenme Sırası</label>
                    <input
                      type="number"
                      value={editingFAQ.order || 1}
                      onChange={(e) => setEditingFAQ({ ...editingFAQ, order: parseInt(e.target.value) || 1 })}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300">Cevap Metni *</label>
                  <textarea
                    rows={4}
                    required
                    value={editingFAQ.answer || ""}
                    onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setFaqModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow-glow-orange"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminAuthGuard>
  );
}
