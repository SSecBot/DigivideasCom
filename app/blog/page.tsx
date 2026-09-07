"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Search, ArrowRight, Clock, Tag, Sparkles } from "lucide-react";
import { useCMSStore } from "@/lib/store/cms-store";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default function BlogCatalogPage() {
  const { blogPosts } = useCMSStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    "all",
    ...Array.from(new Set(blogPosts.map((b) => b.category))),
  ];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find((p) => p.featured) || blogPosts[0];

  const cleanExcerpt = (text: string) => text.replace(/[*#_`]/g, "").trim();

  return (
    <div className="space-y-16 py-12 pb-24">
      {/* Header */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-mono">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Bilgi Merkezi & Stratejiler</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Digivideas Blog & Dijital Trendler
          </h1>

          <p className="text-base sm:text-lg text-zinc-300">
            Yapay zeka, Meta Ads hunileri, SEO ve sosyal medya algoritmaları hakkında en güncel içgörüler.
          </p>

          {/* Search & Filter Bar */}
          <div className="pt-4 max-w-md mx-auto space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Makale veya etiket ara..."
                className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-brand-500 text-slate-950 font-bold shadow-glow-orange"
                      : "bg-slate-900 text-zinc-400 hover:text-white border border-white/10"
                  }`}
                >
                  {cat === "all" ? "Tüm Makaleler" : cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post Card */}
      {featuredPost && selectedCategory === "all" && !searchQuery && (
        <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group block rounded-3xl bg-slate-900/80 border border-brand-500/30 hover:border-brand-500/60 overflow-hidden transition-all duration-300 shadow-glow-orange hover:-translate-y-1"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-6 relative h-72 sm:h-96 w-full bg-zinc-900 overflow-hidden">
                <Image
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute top-4 left-4 bg-brand-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-full font-mono">
                  Öne Çıkan Makale
                </div>
              </div>

              <div className="lg:col-span-6 p-6 sm:p-10 space-y-4">
                <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                  <span className="text-brand-400">{featuredPost.category}</span>
                  <span>•</span>
                  <span>{featuredPost.publishedAt}</span>
                  <span>•</span>
                  <span>{featuredPost.readTimeMinutes} dk okuma</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold text-white group-hover:text-brand-400 transition-colors leading-tight">
                  {featuredPost.title}
                </h2>

                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed line-clamp-3">
                  {cleanExcerpt(featuredPost.excerpt)}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden relative">
                    <Image
                      src={featuredPost.author.avatar}
                      alt={featuredPost.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{featuredPost.author.name}</p>
                    <p className="text-[10px] text-zinc-400">{featuredPost.author.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-3xl bg-slate-900/70 border border-white/10 hover:border-brand-500/50 p-6 transition-all duration-300 hover:shadow-glow-orange hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-zinc-900">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-mono text-brand-400 border border-white/10">
                    {post.category}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                  <span>{post.publishedAt}</span>
                  <span>•</span>
                  <span>{post.readTimeMinutes} dk okuma</span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {cleanExcerpt(post.excerpt)}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {post.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono bg-white/5 text-zinc-400 px-2 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-brand-400">
                <span>Devamını Oku</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
