"use client";

import Link from "next/link";
import { Clock, Eye, User } from "lucide-react";
import type { News } from "@/types/uygulama";

interface SearchResultCardProps {
  news: News;
}

function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "Bugün";
  const date = new Date(dateString);
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

export default function SearchResultCard({ news }: SearchResultCardProps) {
  const categoryName = news.category?.name || "Teknoloji";
  const categorySlug = news.category?.slug || "teknoloji";
  const authorName = news.author?.name || "Zernews Editörü";

  return (
    <article className="group flex flex-col sm:flex-row items-stretch gap-4 sm:gap-5 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-2xs transition-all duration-300 hover:border-gray-200 hover:shadow-md">
      {/* Görsel */}
      <Link
        href={`/haberler/${news.slug}`}
        className="relative aspect-[16/10] sm:aspect-[4/3] w-full sm:w-56 shrink-0 overflow-hidden rounded-xl bg-neutral-100 block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={news.image || "/placeholder.jpg"}
          alt={news.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80";
          }}
        />
      </Link>

      {/* İçerik */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          {/* Üst Kategori & Tarih */}
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/kategori/${categorySlug}`}
              className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600 border border-red-100/60 hover:bg-red-600 hover:text-white transition-colors"
            >
              {categoryName}
            </Link>
            <span className="text-neutral-300">•</span>
            <div className="flex items-center gap-1 text-[11px] text-neutral-400">
              <Clock className="h-3 w-3" />
              <span>{formatRelativeTime(news.published_at)}</span>
            </div>
          </div>

          {/* Başlık */}
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
            <Link href={`/haberler/${news.slug}`}>
              {news.title}
            </Link>
          </h3>

          {/* Özet */}
          {news.excerpt && (
            <p className="mt-2 text-xs sm:text-sm text-neutral-500 line-clamp-2 leading-relaxed">
              {news.excerpt}
            </p>
          )}
        </div>

        {/* Alt Meta Bilgisi */}
        <div className="mt-4 pt-3 flex items-center justify-between border-t border-gray-50 text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5 font-medium text-neutral-600">
            <User className="h-3 w-3 text-neutral-400" />
            <span>{authorName}</span>
          </div>

          <div className="flex items-center gap-1 text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded-md border border-gray-100">
            <Eye className="h-3 w-3 text-red-600" />
            <span className="font-semibold text-neutral-700">
              {formatViews(news.views)} okuma
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
