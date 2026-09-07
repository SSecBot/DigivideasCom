"use client";

import { useState, useEffect } from "react";
import {
  ServiceItem,
  CustomerItem,
  BlogPost,
  SiteNarrative,
  ContactInquiry,
  FAQItem,
  TagItem,
} from "@/lib/types/cms";
import {
  initialServices,
  initialCustomers,
  initialBlogPosts,
  initialSiteNarrative,
  initialFAQs,
  initialTags,
} from "@/lib/data/initial-data";
import { slugify } from "@/lib/utils/slugify";

const STORAGE_KEYS = {
  SERVICES: "digivideas_services_v1",
  CUSTOMERS: "digivideas_customers_v1",
  BLOG: "digivideas_blog_v1",
  TAGS: "digivideas_tags_v1",
  NARRATIVE: "digivideas_narrative_v1",
  FAQS: "digivideas_faqs_v1",
  INQUIRIES: "digivideas_inquiries_v1",
  ADMIN_AUTH: "digivideas_admin_session",
};

// Safe helper for localStorage
function getStoredItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch (e) {
    console.error("Error reading localStorage key:", key, e);
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("digivideas_storage_updated"));
  } catch (e) {
    console.error("Error writing localStorage key:", key, e);
  }
}

export function useCMSStore() {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [customers, setCustomers] = useState<CustomerItem[]>(initialCustomers);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [tags, setTags] = useState<TagItem[]>(initialTags);
  const [narrative, setNarrative] = useState<SiteNarrative>(initialSiteNarrative);
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    const loadData = () => {
      setServices(getStoredItem<ServiceItem[]>(STORAGE_KEYS.SERVICES, initialServices));
      setCustomers(getStoredItem<CustomerItem[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers));
      setBlogPosts(getStoredItem<BlogPost[]>(STORAGE_KEYS.BLOG, initialBlogPosts));
      setTags(getStoredItem<TagItem[]>(STORAGE_KEYS.TAGS, initialTags));
      setNarrative(getStoredItem<SiteNarrative>(STORAGE_KEYS.NARRATIVE, initialSiteNarrative));
      setFaqs(getStoredItem<FAQItem[]>(STORAGE_KEYS.FAQS, initialFAQs));
      setInquiries(getStoredItem<ContactInquiry[]>(STORAGE_KEYS.INQUIRIES, []));
      setIsLoaded(true);
    };

    loadData();

    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener("digivideas_storage_updated", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("digivideas_storage_updated", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // --- SERVICE ACTIONS ---
  const saveService = (service: Partial<ServiceItem> & { title: string }) => {
    const slug = service.slug ? slugify(service.slug) : slugify(service.title);
    const existingIndex = services.findIndex(
      (s) => s.id === service.id || s.slug === slug
    );

    let updated: ServiceItem[];
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      updated = [...services];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...service,
        slug,
        tags: service.tags || updated[existingIndex].tags || [],
        updatedAt: now,
      } as ServiceItem;
    } else {
      const newService: ServiceItem = {
        id: service.id || `srv-${Date.now()}`,
        title: service.title,
        slug,
        category: service.category || "Genel Hizmet",
        iconName: service.iconName || "Sparkles",
        shortDesc: service.shortDesc || "",
        fullContent: service.fullContent || "",
        features: service.features || [],
        deliverables: service.deliverables || [],
        heroImage:
          service.heroImage ||
          "/assets/services/service-performans.webp",
        videoUrl: service.videoUrl || "",
        tags: service.tags || ["Dijital Reklam"],
        metaTitle: service.metaTitle || service.title,
        metaDescription: service.metaDescription || service.shortDesc,
        status: service.status || "published",
        order: service.order || services.length + 1,
        updatedAt: now,
      };
      updated = [newService, ...services];
    }

    setServices(updated);
    setStoredItem(STORAGE_KEYS.SERVICES, updated);
    return slug;
  };

  const deleteService = (id: string) => {
    const updated = services.filter((s) => s.id !== id);
    setServices(updated);
    setStoredItem(STORAGE_KEYS.SERVICES, updated);
  };

  // --- CUSTOMER ACTIONS ---
  const saveCustomer = (customer: Partial<CustomerItem> & { name: string }) => {
    const slug = customer.slug ? slugify(customer.slug) : slugify(customer.name);
    const existingIndex = customers.findIndex(
      (c) => c.id === customer.id || c.slug === slug
    );

    let updated: CustomerItem[];
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      updated = [...customers];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...customer,
        slug,
        story: customer.story !== undefined ? customer.story : updated[existingIndex].story,
        galleryImages:
          customer.galleryImages !== undefined
            ? customer.galleryImages
            : updated[existingIndex].galleryImages || [],
        tags: customer.tags || updated[existingIndex].tags || [],
        updatedAt: now,
      } as CustomerItem;
    } else {
      const newCustomer: CustomerItem = {
        id: customer.id || `cust-${Date.now()}`,
        name: customer.name,
        slug,
        sector: customer.sector || "Genel Sektör",
        logoText: customer.logoText || customer.name.toUpperCase(),
        heroImage:
          customer.heroImage ||
          "/assets/customers/laoscafe-hero.webp",
        videoUrl: customer.videoUrl || "",
        summary: customer.summary || "",
        story: customer.story || customer.summary || "",
        challenge: customer.challenge || "",
        solution: customer.solution || "",
        results: customer.results || [
          { label: "Kreatif Prodüksiyon", value: "Özel Çekimler", growth: "Yüksek Etki" },
          { label: "Dönüşüm Oranı", value: "Sürekli Akış", growth: "Artış" },
        ],
        testimonial: customer.testimonial,
        galleryImages: customer.galleryImages || [],
        liveUrl: customer.liveUrl,
        tags: customer.tags || ["Dijital Pazarlama"],
        metaTitle: customer.metaTitle || `${customer.name} Vaka Analizi`,
        metaDescription: customer.metaDescription || customer.summary,
        status: customer.status || "published",
        featured: customer.featured ?? true,
        updatedAt: now,
      };
      updated = [newCustomer, ...customers];
    }

    setCustomers(updated);
    setStoredItem(STORAGE_KEYS.CUSTOMERS, updated);
    return slug;
  };

  const deleteCustomer = (id: string) => {
    const updated = customers.filter((c) => c.id !== id);
    setCustomers(updated);
    setStoredItem(STORAGE_KEYS.CUSTOMERS, updated);
  };

  // --- BLOG POST ACTIONS ---
  const saveBlogPost = (post: Partial<BlogPost> & { title: string }) => {
    const slug = post.slug ? slugify(post.slug) : slugify(post.title);
    const existingIndex = blogPosts.findIndex(
      (b) => b.id === post.id || b.slug === slug
    );

    let updated: BlogPost[];
    const now = new Date().toISOString().split("T")[0];

    if (existingIndex >= 0) {
      updated = [...blogPosts];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...post,
        slug,
        tags: post.tags || updated[existingIndex].tags || [],
      } as BlogPost;
    } else {
      const newPost: BlogPost = {
        id: post.id || `blog-${Date.now()}`,
        title: post.title,
        slug,
        excerpt: post.excerpt || "",
        content: post.content || "",
        coverImage:
          post.coverImage ||
          "/assets/blog/blog-ai-trends.webp",
        videoUrl: post.videoUrl || "",
        category: post.category || "Pazarlama & Teknoloji",
        author: post.author || {
          name: "Muaz",
          role: "Kurucu & Baş Mühendis",
          avatar: "/assets/team/muaz-avatar.webp",
        },
        readTimeMinutes: post.readTimeMinutes || 4,
        tags: post.tags || ["Dijital Reklam", "Trendler"],
        publishedAt: post.publishedAt || now,
        metaTitle: post.metaTitle || post.title,
        metaDescription: post.metaDescription || post.excerpt,
        status: post.status || "published",
        featured: post.featured ?? false,
      };
      updated = [newPost, ...blogPosts];
    }

    setBlogPosts(updated);
    setStoredItem(STORAGE_KEYS.BLOG, updated);
    return slug;
  };

  const deleteBlogPost = (id: string) => {
    const updated = blogPosts.filter((b) => b.id !== id);
    setBlogPosts(updated);
    setStoredItem(STORAGE_KEYS.BLOG, updated);
  };

  // --- TAG MANAGEMENT ACTIONS ---
  const saveTag = (tag: Partial<TagItem> & { name: string }) => {
    const slug = tag.slug ? slugify(tag.slug) : slugify(tag.name);
    const existingIndex = tags.findIndex((t) => t.id === tag.id || t.slug === slug);
    let updated: TagItem[];
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      updated = [...tags];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...tag,
        slug,
      } as TagItem;
    } else {
      const newTag: TagItem = {
        id: tag.id || `tag-${Date.now()}`,
        name: tag.name,
        slug,
        moduleType: tag.moduleType || "all",
        createdAt: now,
      };
      updated = [...tags, newTag];
    }

    setTags(updated);
    setStoredItem(STORAGE_KEYS.TAGS, updated);
    return slug;
  };

  const deleteTag = (id: string) => {
    const updated = tags.filter((t) => t.id !== id);
    setTags(updated);
    setStoredItem(STORAGE_KEYS.TAGS, updated);
  };

  // --- SSS / FAQ ACTIONS ---
  const saveFAQ = (faq: Partial<FAQItem> & { question: string; answer: string }) => {
    const existingIndex = faqs.findIndex((f) => f.id === faq.id);
    let updated: FAQItem[];
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      updated = [...faqs];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...faq,
        updatedAt: now,
      } as FAQItem;
    } else {
      const newFAQ: FAQItem = {
        id: faq.id || `faq-${Date.now()}`,
        question: faq.question,
        answer: faq.answer,
        category: faq.category || "Genel",
        order: faq.order || faqs.length + 1,
        status: faq.status || "published",
        updatedAt: now,
      };
      updated = [...faqs, newFAQ];
    }

    setFaqs(updated);
    setStoredItem(STORAGE_KEYS.FAQS, updated);
    return faq.id;
  };

  const deleteFAQ = (id: string) => {
    const updated = faqs.filter((f) => f.id !== id);
    setFaqs(updated);
    setStoredItem(STORAGE_KEYS.FAQS, updated);
  };

  // --- NARRATIVE / SETTINGS ACTIONS ---
  const saveNarrative = (newNarrative: Partial<SiteNarrative>) => {
    const updated = { ...narrative, ...newNarrative };
    setNarrative(updated);
    setStoredItem(STORAGE_KEYS.NARRATIVE, updated);
  };

  // --- CONTACT INQUIRY ACTION ---
  const submitInquiry = (inquiry: Omit<ContactInquiry, "id" | "createdAt">) => {
    const newInquiry: ContactInquiry = {
      ...inquiry,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newInquiry, ...inquiries];
    setInquiries(updated);
    setStoredItem(STORAGE_KEYS.INQUIRIES, updated);
    return newInquiry;
  };

  // Reset database back to default initial state
  const resetToFactoryDefaults = () => {
    setServices(initialServices);
    setCustomers(initialCustomers);
    setBlogPosts(initialBlogPosts);
    setTags(initialTags);
    setNarrative(initialSiteNarrative);
    setFaqs(initialFAQs);
    setInquiries([]);

    setStoredItem(STORAGE_KEYS.SERVICES, initialServices);
    setStoredItem(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    setStoredItem(STORAGE_KEYS.BLOG, initialBlogPosts);
    setStoredItem(STORAGE_KEYS.TAGS, initialTags);
    setStoredItem(STORAGE_KEYS.NARRATIVE, initialSiteNarrative);
    setStoredItem(STORAGE_KEYS.FAQS, initialFAQs);
    setStoredItem(STORAGE_KEYS.INQUIRIES, []);
  };

  return {
    isLoaded,
    services,
    customers,
    blogPosts,
    tags,
    narrative,
    faqs,
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
    submitInquiry,
    resetToFactoryDefaults,
  };
}

