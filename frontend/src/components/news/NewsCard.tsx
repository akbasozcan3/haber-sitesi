"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, User } from "lucide-react";
import type { News } from "@/types/uygulama";
import CategoryBadge from "@/components/common/CategoryBadge";

function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "Bugün";

  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    if (diffDays === 1) return "Dün";
    if (diffDays < 30) return `${diffDays} gün önce`;
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "short",
    }).format(date);
  }

  if (diffHours > 0) return `${diffHours} saat önce`;
  if (diffMin > 0) return `${diffMin} dk önce`;
  return "Az önce";
}

const THUMB_IMG = "absolute inset-0 h-full w-full object-cover";

interface NewsCardProps {
  news: News;
  variant?:
    | "standard"
    | "hero"
    | "compact-horizontal"
    | "horizontal"
    | "featured-main"
    | "sidebar"
    | "featured-grid"
    | "list";
  priority?: boolean;
}

function NewsImage({
  src,
  alt,
  className,
  onError,
  priority = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  onError: () => void;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div className={`bg-neutral-100 ${className ?? ""}`}>
        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-neutral-400">
          Zernews
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={onError}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

export default function NewsCard({
  news,
  variant = "standard",
  priority = false,
}: NewsCardProps) {
  const [imgError, setImgError] = useState(false);
  const timeAgo = formatRelativeTime(news.published_at || news.created_at);
  const authorName = news.author?.name || "Editör";
  const imageSrc = imgError ? null : news.image;
  const isHighPriority = priority || variant === "featured-main" || variant === "hero";

  /* ==========================================================================
     FEATURED MAIN (Manşet Slider İç Kartı)
  ========================================================================== */
  if (variant === "featured-main") {
    return (
      <article className="group flex flex-col overflow-hidden rounded-2xl">
        <Link href={`/haberler/${news.slug}`} className="block">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-100">
            <NewsImage
              src={imageSrc}
              alt={news.title}
              onError={() => setImgError(true)}
              className={THUMB_IMG}
              priority={isHighPriority}
            />
          </div>
        </Link>

        <div className="mt-4 flex flex-col">
          {news.category && (
            <div className="mb-2">
              <CategoryBadge category={news.category} />
            </div>
          )}

          <Link href={`/haberler/${news.slug}`}>
            <h2 className="text-xl font-extrabold leading-snug text-neutral-900 transition-colors group-hover:text-red-600 sm:text-2xl lg:text-[1.65rem] lg:leading-tight">
              {news.title}
            </h2>
          </Link>

          {news.excerpt && (
            <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-neutral-500 sm:text-base">
              {news.excerpt}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
            <span className="font-semibold text-neutral-700">{authorName}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </article>
    );
  }

  /* ==========================================================================
     SIDEBAR
  ========================================================================== */
  if (variant === "sidebar") {
    return (
      <article className="group grid grid-cols-[100px_minmax(0,1fr)] gap-3 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-4">
        <Link href={`/haberler/${news.slug}`} className="block">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100">
            <NewsImage
              src={imageSrc}
              alt={news.title}
              onError={() => setImgError(true)}
              className={THUMB_IMG}
              priority={isHighPriority}
            />
          </div>
        </Link>

        <div className="min-w-0 flex flex-col justify-center">
          {news.category && (
            <div className="mb-1">
              <CategoryBadge category={news.category} />
            </div>
          )}

          <Link href={`/haberler/${news.slug}`}>
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-neutral-900 transition-colors group-hover:text-red-600 sm:text-[15px]">
              {news.title}
            </h3>
          </Link>

          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-neutral-400">
            <span className="max-w-[80px] truncate font-medium text-neutral-500">
              {authorName}
            </span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </article>
    );
  }

  /* ==========================================================================
     FEATURED GRID
  ========================================================================== */
  if (variant === "featured-grid") {
    return (
      <article className="group relative w-full overflow-hidden rounded-2xl">
        <div className="relative aspect-[15/10] w-full overflow-hidden rounded-2xl bg-neutral-200">
          <NewsImage
            src={imageSrc}
            alt={news.title}
            onError={() => setImgError(true)}
            className={THUMB_IMG}
            priority={isHighPriority}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-4">
            {news.category && (
              <div className="mb-2">
                <CategoryBadge category={news.category} variant="overlay" />
              </div>
            )}
            <Link href={`/haberler/${news.slug}`}>
              <h3 className="line-clamp-2 text-base font-bold leading-snug text-white transition-colors group-hover:text-rose-300 sm:text-lg">
                {news.title}
              </h3>
            </Link>

            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/70">
              <span>{authorName}</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  /* ==========================================================================
     LIST (Canlı Haber Akışı vb.)
  ========================================================================== */
  if (variant === "list") {
    return (
      <article className="group grid gap-4 sm:grid-cols-[1fr_200px] sm:gap-6 lg:grid-cols-[1fr_240px]">
        <div className="order-2 min-w-0 sm:order-1 flex flex-col justify-center">
          {news.category && (
            <div className="mb-2">
              <CategoryBadge category={news.category} />
            </div>
          )}

          <Link href={`/haberler/${news.slug}`}>
            <h3 className="text-lg font-extrabold leading-snug text-neutral-900 transition-colors group-hover:text-red-600 sm:text-xl">
              {news.title}
            </h3>
          </Link>

          {news.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-500">
              {news.excerpt}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
            <span className="font-semibold text-neutral-700">{authorName}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
        </div>

        <Link
          href={`/haberler/${news.slug}`}
          className="order-1 relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100 sm:order-2 sm:aspect-auto sm:h-[140px] sm:w-[220px] shrink-0 block"
        >
          <NewsImage
            src={imageSrc}
            alt={news.title}
            onError={() => setImgError(true)}
            className={THUMB_IMG}
            priority={isHighPriority}
          />
        </Link>
      </article>
    );
  }

  /* ==========================================================================
     HERO (Büyük Manşet)
  ========================================================================== */
  if (variant === "hero") {
    return (
      <article className="group relative h-[440px] w-full overflow-hidden rounded-[28px] bg-neutral-950 sm:h-[520px]">
        <NewsImage
          src={imageSrc}
          alt={news.title}
          onError={() => setImgError(true)}
          className={THUMB_IMG}
          priority={isHighPriority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent opacity-90" />

        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
          {news.category && (
            <div className="mb-3">
              <CategoryBadge category={news.category} variant="overlay" size="md" />
            </div>
          )}

          <Link href={`/haberler/${news.slug}`}>
            <h2 className="text-xl font-black leading-tight text-white transition-colors group-hover:text-rose-300 sm:text-2xl lg:text-3xl">
              {news.title}
            </h2>
          </Link>

          {news.excerpt && (
            <p className="mt-3 line-clamp-2 text-sm text-neutral-300 sm:text-base">
              {news.excerpt}
            </p>
          )}

          <div className="mt-5 flex items-center gap-4 text-xs text-neutral-300">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {authorName}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {timeAgo}
            </span>
          </div>
        </div>
      </article>
    );
  }

  /* ==========================================================================
     COMPACT HORIZONTAL
  ========================================================================== */
  if (variant === "compact-horizontal") {
    return (
      <article className="group flex items-center gap-4">
        <Link
          href={`/haberler/${news.slug}`}
          className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-28 sm:w-36 block"
        >
          <NewsImage
            src={imageSrc}
            alt={news.title}
            onError={() => setImgError(true)}
            className={THUMB_IMG}
            priority={isHighPriority}
          />
        </Link>

        <div className="min-w-0 flex-1">
          {news.category && (
            <div className="mb-1">
              <CategoryBadge category={news.category} />
            </div>
          )}

          <Link href={`/haberler/${news.slug}`}>
            <h3 className="line-clamp-2 text-sm font-bold text-neutral-900 transition-colors group-hover:text-red-600 sm:text-base">
              {news.title}
            </h3>
          </Link>

          <div className="mt-2 flex items-center gap-1 text-xs text-neutral-400">
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
      </article>
    );
  }

  /* ==========================================================================
     HORIZONTAL
  ========================================================================== */
  if (variant === "horizontal") {
    return (
      <article className="group overflow-hidden rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-5 flex flex-col gap-4 sm:flex-row shadow-2xs transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-md">
        <Link
          href={`/haberler/${news.slug}`}
          className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:w-64 block"
        >
          <NewsImage
            src={imageSrc}
            alt={news.title}
            onError={() => setImgError(true)}
            className={THUMB_IMG}
            priority={isHighPriority}
          />
        </Link>

        <div className="flex-1 flex flex-col justify-center">
          {news.category && (
            <div className="mb-2">
              <CategoryBadge category={news.category} />
            </div>
          )}

          <Link href={`/haberler/${news.slug}`}>
            <h3 className="text-base font-bold text-neutral-900 transition-colors group-hover:text-red-600 sm:text-xl">
              {news.title}
            </h3>
          </Link>

          {news.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-neutral-500">
              {news.excerpt}
            </p>
          )}

          <div className="mt-4 flex items-center gap-3 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
            <span className="font-semibold text-neutral-700">{authorName}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </article>
    );
  }

  /* ==========================================================================
     STANDARD (Kategori Blokları vb.)
  ========================================================================== */
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-2xs transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-md">
      <Link
        href={`/haberler/${news.slug}`}
        className="relative aspect-[16/10] overflow-hidden bg-neutral-100 block"
      >
        <NewsImage
          src={imageSrc}
          alt={news.title}
          onError={() => setImgError(true)}
          className={THUMB_IMG}
          priority={isHighPriority}
        />
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {news.category && (
          <div className="mb-2">
            <CategoryBadge category={news.category} />
          </div>
        )}

        <Link href={`/haberler/${news.slug}`}>
          <h3 className="line-clamp-2 text-base font-bold text-neutral-900 transition-colors group-hover:text-red-600 sm:text-lg">
            {news.title}
          </h3>
        </Link>

        {news.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-neutral-500">
            {news.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-400">
          <span className="truncate font-semibold text-neutral-700">
            {authorName}
          </span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </article>
  );
}
