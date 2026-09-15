"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { News } from "@/types/uygulama";
import CategoryBadge from "@/components/common/CategoryBadge";

function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "Bugün";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays > 0) {
    if (diffDays === 1) return "Dün";
    if (diffDays < 30) return `${diffDays} gün önce`;
    return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short" }).format(date);
  }
  if (diffHours > 0) return `${diffHours} saat önce`;
  return "Az önce";
}

export default function FeaturedSidebar({
  news,
}: {
  news: News[];
  activeId?: number;
  onSelect?: (item: News) => void;
}) {
  if (!news || news.length === 0) return null;

  return (
    <aside className="w-full">
      {/* Başlık: Profesyonel Kırmızı Vurgulu Çizgi */}
      <div className="relative mb-4 flex items-center justify-between border-b border-neutral-200 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="h-5 w-1.5 rounded-full bg-red-600" />
          <h2 className="text-xl font-black tracking-tight text-neutral-950 sm:text-2xl">
            Öne Çıkanlar
          </h2>
        </div>

        <Link
          href="/haberler"
          className="flex items-center gap-1 text-xs font-bold text-neutral-500 transition-colors hover:text-red-600"
        >
          <span>Tümü</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <div className="absolute -bottom-px left-0 h-0.5 w-24 bg-red-600 rounded-full" />
      </div>

      {/* Liste — Sabit, bağımsız ve manşet kaydıkça zıplamaz */}
      <div className="flex flex-col divide-y divide-neutral-200/70">
        {news.slice(0, 4).map((item) => (
          <div key={item.id} className="py-3.5 first:pt-0 last:pb-0">
            <SidebarNewsRow item={item} />
          </div>
        ))}
      </div>
    </aside>
  );
}

export function SidebarNewsRow({ item }: { item: News }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = !imgError && Boolean(item.image);
  const timeAgo = formatRelativeTime(item.published_at || item.created_at);

  return (
    <article className="group grid w-full grid-cols-[120px_minmax(0,1fr)] items-start gap-4 sm:grid-cols-[128px_minmax(0,1fr)]">
      {/* SOLDA GÖRSEL */}
      <Link
        href={`/haberler/${item.slug}`}
        className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-100 block shadow-2xs"
      >
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image ?? undefined}
            alt={item.title}
            onError={() => setImgError(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-neutral-100 px-2 text-center text-[10px] font-bold text-neutral-400">
            {item.category?.name ?? "Zernews"}
          </div>
        )}
      </Link>

      {/* SAĞDA METİN — Kategori Rozeti, Başlık, Yazar ve Tarih */}
      <div className="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
        {item.category && (
          <div className="mb-0.5">
            <CategoryBadge category={item.category} />
          </div>
        )}

        <Link href={`/haberler/${item.slug}`}>
          <h3 className="line-clamp-2 text-sm font-extrabold leading-snug text-neutral-900 transition-colors group-hover:text-red-600 sm:text-[15px]">
            {item.title}
          </h3>
        </Link>

        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-neutral-400">
          <span className="truncate font-medium text-neutral-600">
            {item.author?.name ?? "Zernews"}
          </span>
          <span>·</span>
          <span className="shrink-0">{timeAgo}</span>
        </div>
      </div>
    </article>
  );
}
