"use client";

import Link from "next/link";
import { TrendingUp, Clock, Eye, ChevronRight } from "lucide-react";
import type { News } from "@/types/uygulama";

interface TrendingNewsGridProps {
  news: News[];
  title?: string;
  subtitle?: string;
}

function formatTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "Yeni";
  const date = new Date(dateStr);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  if (diffHours < 1) return "Az önce";
  if (diffHours < 24) return `${diffHours} saat önce`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Dün";
  if (diffDays < 30) return `${diffDays} gün önce`;
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(date);
}

function formatViews(count: number | undefined): string {
  if (!count) return "0";
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return `${count}`;
}

export default function TrendingNewsGrid({
  news,
  title = "Gündemdeki En Çok Okunanlar",
  subtitle = "Haftanın en çok okunan ve öne çıkan teknoloji gelişmeleri",
}: TrendingNewsGridProps) {
  if (!news || news.length === 0) return null;

  return (
    <div className="w-full">
      {/* Bölüm Başlığı */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1.5 rounded-full bg-red-600" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 flex items-center gap-2">
              <span>{title}</span>
              <TrendingUp className="h-5 w-5 text-red-600" />
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
          </div>
        </div>

        <Link
          href="/haberler"
          className="inline-flex items-center gap-1 text-xs font-bold text-neutral-600 hover:text-red-600 transition-colors group self-start sm:self-auto"
        >
          <span>Tümünü Gör</span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Grid Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        {news.map((item, index) => {
          const categoryName = item.category?.name || "Teknoloji";
          const categorySlug = item.category?.slug || "teknoloji";

          return (
            <article
              key={item.id}
              className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-2xs hover:border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              {/* Görsel Alanı */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || "/placeholder.jpg"}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80";
                  }}
                />

                {/* Sıralama Rozeti */}
                <div className="absolute top-3 left-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-950/85 backdrop-blur-xs text-[11px] font-black text-white shadow-xs">
                  #{index + 1}
                </div>

                {/* Kategori Rozeti */}
                <Link
                  href={`/kategori/${categorySlug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-3 right-3 z-10 rounded-lg bg-white/95 backdrop-blur-xs px-2.5 py-1 text-[11px] font-extrabold text-neutral-900 border border-neutral-200/60 shadow-xs transition-colors hover:bg-red-600 hover:text-white hover:border-red-600"
                >
                  {categoryName}
                </Link>
              </div>

              {/* İçerik Alanı */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-bold text-neutral-900 line-clamp-2 leading-snug tracking-tight group-hover:text-red-600 transition-colors">
                  <Link href={`/haberler/${item.slug}`} className="focus:outline-none">
                    {item.title}
                  </Link>
                </h3>

                {item.excerpt && (
                  <p className="mt-2 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                    {item.excerpt}
                  </p>
                )}

                {/* Alt Meta Bilgisi */}
                <div className="mt-auto pt-4 flex items-center justify-between text-[11px] font-medium text-neutral-400 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-neutral-400" />
                    <span>{formatTime(item.published_at)}</span>
                  </div>

                  <div className="flex items-center gap-1 text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded-md border border-gray-100">
                    <Eye className="h-3 w-3 text-red-600" />
                    <span className="font-semibold text-neutral-700">
                      {formatViews(item.views)}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
