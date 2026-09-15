"use client";

import Link from "next/link";
import { useState } from "react";
import type { News } from "@/types/uygulama";

function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "Bugün";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    if (diffDays === 1) return "Dün";
    if (diffDays < 30) return `${diffDays} gün önce`;
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }
  if (diffHours > 0) return `${diffHours} saat önce`;
  return "Az önce";
}

export default function PopularList({ items = [] }: { items: News[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="w-full">
      <h2 className="mb-4 text-xl font-extrabold tracking-tight text-slate-900">
        Bugün popüler
      </h2>

      <div className="flex flex-col divide-y divide-slate-100">
        {items.slice(0, 5).map((item) => (
          <PopularItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function PopularItem({ item }: { item: News }) {
  const [imgError, setImgError] = useState(false);
  const timeAgo = formatRelativeTime(item.published_at || item.created_at);
  const hasImage = !imgError && !!item.image;

  return (
    <article className="group py-4 first:pt-0 last:pb-0">
      <Link href={`/haberler/${item.slug}`} className="flex items-start gap-3">

        {/* SABİT GÖRSEL — hover'da oynamaz */}
        <div className="relative h-[72px] w-[108px] shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image ?? undefined}
              alt={item.title}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
              /* Kasıtlı olarak transform/scale yok — sabit kalacak */
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 text-[10px] font-medium text-slate-400">
              {item.category?.name ?? "Haber"}
            </div>
          )}
        </div>

        {/* METİN */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">

          {/* KATEGORİ ETIKETI */}
          {item.category?.name && (
            <span className="inline-block w-fit rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-800">
              {item.category.name}
            </span>
          )}

          {/* BAŞLIK */}
          <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-red-600">
            {item.title}
          </h3>

          {/* YAZAR · ZAMAN */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="max-w-[100px] truncate font-medium">
              {item.author?.name ?? "Editör"}
            </span>
            <span>·</span>
            <span className="shrink-0">{timeAgo}</span>
          </div>

        </div>
      </Link>
    </article>
  );
}
