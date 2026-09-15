"use client";

import Link from "next/link";
import { SearchX, Lightbulb, ArrowRight } from "lucide-react";

interface EmptyStateCardProps {
  searchQuery: string;
  popularTags?: string[];
}

const DEFAULT_POPULAR_TAGS = [
  "E-Ticaret",
  "Fintek",
  "Yapay Zeka",
  "Yatırım",
  "SaaS",
];

export default function EmptyStateCard({
  searchQuery,
  popularTags = DEFAULT_POPULAR_TAGS,
}: EmptyStateCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-b from-neutral-50/80 via-white to-white p-8 sm:p-12 text-center shadow-xs">
      {/* Arka plan dekoratif hafif ızgara */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

      <div className="relative z-10 max-w-xl mx-auto">
        {/* İkon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100/80 shadow-xs">
          <SearchX className="h-8 w-8" />
        </div>

        {/* Başlık */}
        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900">
          Sonuç Bulunamadı
        </h3>

        {/* Açıklama & İpucu */}
        <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
          <span className="font-bold text-neutral-900">&quot;{searchQuery}&quot;</span> ifadesiyle eşleşen herhangi bir haber veya içerik bulunamadı.
        </p>

        {/* Arama İpuçları Kutusu */}
        <div className="mt-6 inline-flex items-start gap-2.5 rounded-2xl border border-gray-100 bg-white/90 p-4 text-left shadow-2xs backdrop-blur-xs">
          <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-neutral-600 space-y-1">
            <p className="font-bold text-neutral-800">Arama İpuçları:</p>
            <ul className="list-disc list-inside space-y-0.5 text-neutral-500">
              <li>Kelimenin doğru yazıldığından emin olun.</li>
              <li>Daha genel veya alternatif anahtar sözcükler kullanmayı deneyin.</li>
              <li>Aşağıdaki popüler etiketlerden birine tıklayarak ilgili içeriklere ulaşın.</li>
            </ul>
          </div>
        </div>

        {/* Tıklanabilir Popüler Etiketler */}
        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
            Önerilen Konu Başlıkları
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularTags.map((tag) => (
              <Link
                key={tag}
                href={`/arama?q=${encodeURIComponent(tag)}`}
                className="group inline-flex items-center gap-1.5 rounded-full border border-gray-200/90 bg-white px-3.5 py-1.5 text-xs font-bold text-neutral-700 shadow-2xs transition-all duration-200 hover:border-red-500 hover:bg-red-50 hover:text-red-600 hover:shadow-xs active:scale-98"
              >
                <span className="text-red-600 font-black">#</span>
                <span>{tag}</span>
                <ArrowRight className="h-3 w-3 opacity-0 -ml-1 text-red-600 transition-all group-hover:opacity-100 group-hover:ml-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
