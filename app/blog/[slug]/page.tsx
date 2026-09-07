"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Bookmark,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";
import { useCMSStore } from "@/lib/store/cms-store";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

export default function DynamicBlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { blogPosts } = useCMSStore();

  const post = blogPosts.find((b) => b.slug === slug);

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-bold text-white">Makale Bulunamadı</h1>
          <p className="text-sm text-zinc-400">
            Aradığınız &ldquo;<span className="font-mono text-brand-400">{slug}</span>&rdquo; makalesi mevcut değil veya silinmiş olabilir.
          </p>
        </div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 bg-brand-500 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm shadow-glow-orange"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tüm Blog Yazılarına Göz Atın</span>
        </Link>
      </div>
    );
  }

  const otherPosts = blogPosts.filter((b) => b.id !== post.id).slice(0, 2);

  return (
    <article className="space-y-12 py-12 pb-24">
      {/* Back Link */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tüm Blog Yazılarına Geri Dön</span>
        </Link>
      </div>

      {/* Article Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-brand-500/15 border border-brand-500/40 text-brand-400 px-3.5 py-1 rounded-full text-xs font-mono font-medium">
            {post.category}
          </span>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{post.publishedAt}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.readTimeMinutes} dk okuma</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          {post.title}
        </h1>

        <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-medium">
          {post.excerpt}
        </p>

        {/* Author Details Bar */}
        <div className="flex items-center justify-between py-4 border-y border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden relative border border-brand-500/40">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{post.author.name}</p>
              <p className="text-xs text-zinc-400">{post.author.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-brand-500/20 text-zinc-400 hover:text-brand-400 transition-colors"
              title="X'te Paylaş"
            >
              <Share2 className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Featured Cover Image */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative h-72 sm:h-[420px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Article Body Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/70 border border-white/10 space-y-6">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <span className="text-xs font-mono text-zinc-400 mr-2">Etiketler:</span>
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-brand-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Related Posts */}
      {otherPosts.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 border-t border-white/10 space-y-6">
          <h3 className="text-2xl font-bold text-white">İlginizi Çekebilecek Diğer Yazılar</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {otherPosts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-brand-500/40 transition-all group"
              >
                <span className="text-[11px] font-mono text-brand-400">{p.category}</span>
                <h4 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors mt-1 line-clamp-2">
                  {p.title}
                </h4>
                <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
