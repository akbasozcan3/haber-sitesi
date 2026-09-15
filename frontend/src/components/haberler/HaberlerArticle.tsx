"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  Eye,
  ChevronRight,
  User,
  Share2,
  ArrowRight,
  BookOpen,
} from "lucide-react";

import type { News } from "@/types/uygulama";
import type { Category } from "@/types/uygulama";
import { incrementNewsView } from "@/lib/api/haberler";

import HaberlerContent from "./HaberlerContent";
import PaylasimButonlari from "./PaylasimButonlari";
import YorumlarBolumu from "./YorumlarBolumu";
import KategoriSidebar from "../home/KategoriSidebar";
import FeaturedSidebar from "../home/FeaturedSidebar";
import CategoryBadge from "../common/CategoryBadge";
import AdBanner from "../ads/AdBanner";

function formatDate(value: string | null | undefined): string {
  if (!value) return "";

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function calculateReadingTime(content: string = ""): string {
  const cleanContent = content
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleanContent ? cleanContent.split(" ").length : 0;
  const minutes = Math.max(1, Math.ceil(words / 180));

  return `${minutes} dk okuma`;
}

export default function HaberlerArticle({
  news,
  related = [],
  sidebarGroups = [],
  featuredNews = [],
  nextNews = null,
  shareUrl,
  initialPage = 1,
}: {
  news: News;
  related?: News[];
  sidebarGroups?: { category: Category; news: News[] }[];
  nextNews: News | null;
  shareUrl: string;
  featuredNews?: News[];
  initialPage?: number;
}) {
  const [views, setViews] = useState(news.views);

  useEffect(() => {
    let active = true;

    incrementNewsView(news.id)
      .then((res) => {
        if (active && res && typeof res.views === "number") {
          setViews(res.views);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [news.id]);

  const readTime = calculateReadingTime(news.content);

  return (
    <main className="min-h-screen bg-white">

      {/* =====================================================
          PAGE CONTAINER
      ====================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* =====================================================
            BREADCRUMB
        ====================================================== */}

        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 overflow-hidden text-xs font-medium text-slate-400"
        >
          <Link
            href="/"
            className="shrink-0 transition-colors hover:text-red-600"
          >
            Ana Sayfa
          </Link>

          <ChevronRight className="h-3.5 w-3.5 shrink-0" />

          <Link
            href="/haberler"
            className="shrink-0 transition-colors hover:text-red-600"
          >
            Haberler
          </Link>

          {news.category && (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />

              <Link
                href={`/kategori/${news.category.slug}`}
                className="truncate font-semibold text-rose-600 hover:text-rose-700"
              >
                {news.category.name}
              </Link>
            </>
          )}
        </nav>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="grid items-start gap-10 lg:grid-cols-12 xl:gap-14">

          {/* ===================================================
              ARTICLE
          ==================================================== */}

          <article className="min-w-0 lg:col-span-8">

            {/* =================================================
                ARTICLE HEADER
            ================================================== */}

            <header>

              {/* Category */}
              {news.category && (
                <div>
                  <CategoryBadge category={news.category} size="md" />
                </div>
              )}

              {/* Title */}

              <h1 className="mt-5 max-w-5xl text-[1.85rem] font-black leading-[1.1] tracking-[-0.03em] text-slate-950 sm:text-4xl lg:text-[2.75rem]">
                {news.title}
              </h1>

              {/* Excerpt */}

              {news.excerpt && (
                <p className="mt-6 max-w-4xl text-lg font-medium leading-8 text-slate-500 sm:text-xl">
                  {news.excerpt}
                </p>
              )}

              {/* =================================================
                  AUTHOR / META
              ================================================== */}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-y border-slate-200 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-sm font-black text-white">
                    {news.author?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={news.author.avatar}
                        alt={news.author.name}
                        className="h-full w-full object-cover"
                      />
                    ) : news.author?.name ? (
                      news.author.name.charAt(0).toUpperCase()
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    {news.author ? (
                      <Link
                        href={`/yazar/${news.author.slug}`}
                        className="text-sm font-bold text-slate-900 transition-colors hover:text-red-600"
                      >
                        {news.author.name}
                      </Link>
                    ) : (
                      <span className="text-sm font-bold text-slate-900">
                        Zernews Editörü
                      </span>
                    )}

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">

                      <span>
                        {formatDate(
                          news.published_at || news.created_at
                        )}
                      </span>

                      <span>•</span>

                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {readTime}
                      </span>

                    </div>
                  </div>
                </div>

                {/* Views */}

                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Eye className="h-4 w-4" />

                  <span>
                    {views.toLocaleString("tr-TR")} görüntülenme
                  </span>
                </div>

              </div>
            </header>

            {/* =================================================
                SHARE BAR
            ================================================== */}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">

              <div className="flex items-center gap-2.5">

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                  <Share2 className="h-4 w-4 text-slate-600" />
                </div>

                <span className="text-xs font-bold text-slate-600">
                  Bu haberi paylaş
                </span>

              </div>

              <PaylasimButonlari
                title={news.title}
                shareUrl={shareUrl}
                showLabel={false}
              />

            </div>

            {/* =================================================
                HERO IMAGE
            ================================================== */}

            {news.image && (
              <figure className="mt-8 overflow-hidden rounded-2xl bg-slate-100 shadow-2xs">

                <div className="relative aspect-[16/9] max-h-[380px] w-full overflow-hidden">

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={news.image}
                    alt={news.title}
                    className="h-full w-full object-cover"
                    style={{ imageRendering: "auto" }}
                  />

                </div>

              </figure>
            )}

            {/* =================================================
                ARTICLE CONTENT
            ================================================== */}

            <div className="mt-8 max-w-4xl">

              <div id="haber-metni" className="news-article-content scroll-mt-24">
                <HaberlerContent
                  content={news.content}
                  slug={news.slug}
                  initialPage={initialPage}
                  source="AA"
                />
              </div>

            </div>

            {/* REKLAM ALANI: Google AdSense Yazı İçi Leaderboard */}
            <AdBanner format="leaderboard" position="article-body" />

            {/* SIRADAKİ HABER: İçeriğin doğal devamı olarak */}
            {nextNews && (
              <section className="mt-10 border-l-4 border-neutral-900 pl-5 sm:pl-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                  Sıradaki haber
                </span>

                <Link
                  href={`/haberler/${nextNews.slug}`}
                  className="group mt-2 block"
                >
                  <h2 className="text-xl font-black leading-snug text-neutral-950 transition-colors group-hover:text-red-600 sm:text-2xl">
                    {nextNews.title}
                  </h2>

                  {nextNews.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {nextNews.excerpt}
                    </p>
                  )}

                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-slate-900 transition-colors group-hover:text-red-600">
                    Haberi oku
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </section>
            )}

            {/* =================================================
                ARTICLE FOOTER
            ================================================== */}

            <div className="mt-12 border-t border-slate-200 pt-7">

              <div className="flex flex-wrap items-center justify-between gap-4">

                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <BookOpen className="h-4 w-4" />
                  {readTime}
                </div>

                <PaylasimButonlari
                  title={news.title}
                  shareUrl={shareUrl}
                />

              </div>

            </div>

            {/* =================================================
                AUTHOR CARD
            ================================================== */}

            {news.author && (
              <section className="mt-12 border-t border-slate-200/80 pt-8">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

                  <Link
                    href={`/yazar/${news.author.slug}`}
                    className="group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-slate-100 transition-transform hover:scale-105"
                  >
                    {news.author.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={news.author.avatar}
                        alt={news.author.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-900 text-xl font-black text-white">
                        {news.author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>

                  <div className="flex-1">

                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
                      Yazar
                    </span>

                    <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                      <Link
                        href={`/yazar/${news.author.slug}`}
                        className="transition-colors hover:text-red-600"
                      >
                        {news.author.name}
                      </Link>
                    </h2>

                    {news.author.bio && (
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                        {news.author.bio}
                      </p>
                    )}

                    <Link
                      href={`/yazar/${news.author.slug}`}
                      className="group mt-3.5 inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 transition-colors hover:text-red-600"
                    >
                      <span>Tüm yazılarını ve biyografisini gör</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>

                  </div>

                </div>

              </section>
            )}

            {/* =================================================
                RELATED NEWS (İLGİLİ HABERLER)
            ================================================== */}
            {related.length > 0 && (
              <section className="mt-12 border-t border-slate-200/80 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    İlgili Haberler
                  </h3>
                  {news.category && (
                    <Link
                      href={`/kategori/${news.category.slug}`}
                      className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
                    >
                      Daha Fazla
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      href={`/haberler/${item.slug}`}
                      className="group flex gap-3.5 p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all duration-200"
                    >
                      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-200 text-xs font-medium text-slate-500">
                            Haber
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <h4 className="line-clamp-2 text-xs sm:text-sm font-bold leading-snug text-slate-900 group-hover:text-red-600 transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(item.published_at)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* =================================================
                COMMENTS (YORUMLAR)
            ================================================== */}
            <YorumlarBolumu newsId={news.id} newsTitle={news.title} />

          </article>

          {/* ===================================================
              SIDEBAR
          ==================================================== */}

          <aside className="space-y-7 lg:col-span-4">

            <FeaturedSidebar news={featuredNews ?? []} />

            {/* REKLAM ALANI: Google AdSense 300x250 Kare Reklam */}
            <AdBanner format="rectangle" position="article-sidebar" />

            {/* KATEGORİLERE GÖRE HABERLER */}
            {sidebarGroups.length > 0 && (
              <section className="w-full py-1">
                <KategoriSidebar groups={sidebarGroups} />
              </section>
            )}



          </aside>

        </div>

      </div>

    </main>
  );
}
