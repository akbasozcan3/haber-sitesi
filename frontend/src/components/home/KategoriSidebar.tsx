"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category, News } from "@/types/uygulama";
import { SidebarNewsRow } from "./FeaturedSidebar";

type CategoryWithNews = {
  category: Category;
  news: News[];
};

export default function KategoriSidebar({
  groups = [],
}: {
  groups: CategoryWithNews[];
}) {
  if (groups.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-8">
      {groups.map(({ category, news }) => {
        if (news.length === 0) return null;
        return (
          <section key={category.id} className="w-full">
            {/* Başlık — Öne Çıkanlar ile BİREBİR AYNI editoryal başlık tasarımı */}
            {/* Başlık — Öne Çıkanlar ile BİREBİR AYNI editoryal başlık tasarımı */}
            <div className="relative mb-4 flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-4 w-1.5 rounded-full bg-red-600" />
                <Link
                  href={`/kategori/${category.slug}`}
                  className="text-xl font-black tracking-tight text-neutral-950 sm:text-2xl transition-colors hover:text-red-600"
                >
                  {category.name}
                </Link>
              </div>

              <Link
                href={`/kategori/${category.slug}`}
                className="flex items-center gap-1 text-xs font-bold text-neutral-500 transition-colors hover:text-red-600"
              >
                <span>Tümü</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <div className="absolute -bottom-px left-0 h-0.5 w-20 bg-red-600 rounded-full" />
            </div>

            {/* Liste — Öne Çıkanlar ile BİREBİR AYNI kart yapısı, dairesel kenarlar ve tipografi */}
            <div className="flex flex-col divide-y divide-neutral-100">
              {news.slice(0, 3).map((item) => {
                const itemWithCat = item.category ? item : { ...item, category };
                return (
                  <div key={item.id} className="py-3.5 first:pt-0 last:pb-0">
                    <SidebarNewsRow item={itemWithCat} />
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

