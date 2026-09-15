"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Home, Newspaper } from "lucide-react";
import { useAdContext } from "@/components/layout/SiteLayout";
import { newsApi, categoriesApi } from "@/lib/istemci";
import type { News, Category } from "@/types/uygulama";
import EditorialSecondarySlider from "@/components/home/EditorialSecondarySlider";

export default function NotFound() {
  const router = useRouter();
  const { setShowAds } = useAdContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendedNews, setRecommendedNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // 404 sayfasında reklamları KESİNLİKLE devre dışı bırak
  useEffect(() => {
    setShowAds(false);
    return () => setShowAds(true);
  }, [setShowAds]);

  // Sayfada ziyaretçiye sunulacak güncel haberleri ve kategorileri dinamik çek
  useEffect(() => {
    let active = true;
    Promise.all([
      newsApi.list().catch(() => []),
      categoriesApi.list().catch(() => []),
    ]).then(([items, cats]) => {
      if (!active) return;
      if (Array.isArray(items)) {
        const published = items.filter((n) => n.status === "published");
        setRecommendedNews(published.slice(0, 6));
      }
      if (Array.isArray(cats)) {
        setCategories(cats.slice(0, 8));
      }
    });

    return () => {
      active = false;
    };
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/arama?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <div className="min-h-[75vh] bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ÜST BÖLÜM: KURUMSAL EDİTÖRYAL BAŞLIK */}
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-950">
            Aradığınız İçeriğe Ulaşılamadı
          </h1>

          <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-neutral-600">
            Ulaşmaya çalıştığınız haber veya sayfa silinmiş, adresi değişmiş ya da geçici olarak yayından kaldırılmış olabilir.
            Aşağıdaki arama alanından aradığınız konuyu bulabilir veya güncel haber akışımıza dönebilirsiniz.
          </p>

          {/* ARAMA FORMU */}
          <form onSubmit={handleSearch} className="mt-7 max-w-xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-4.5 w-4.5 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Haber başlığı, şirket, teknoloji veya konu arayın..."
                className="w-full rounded-2xl border border-neutral-300 bg-neutral-50/50 py-3 pl-11 pr-24 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-neutral-950 focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-1.5 rounded-xl bg-neutral-950 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-600 active:scale-95 cursor-pointer"
              >
                Ara
              </button>
            </div>
          </form>

          {/* HIZLI YÖNLENDİRME BUTONLARI */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-red-600 shadow-xs active:scale-95"
            >
              <Home className="h-4 w-4" />
              <span>Ana Sayfaya Dön</span>
            </Link>

            <Link
              href="/haberler"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-xs font-bold text-neutral-800 transition-all hover:border-neutral-950 hover:bg-neutral-50 active:scale-95"
            >
              <Newspaper className="h-4 w-4 text-neutral-500" />
              <span>Tüm Haberler Akışı</span>
            </Link>
          </div>

          {/* KATEGORİLER */}
          {categories.length > 0 && (
            <div className="mt-8 border-t border-neutral-100 pt-6">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400 block mb-2.5">
                Kategoriler
              </span>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/kategori/${cat.slug}`}
                    className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-all hover:border-neutral-950 hover:text-neutral-950 hover:bg-neutral-50"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* GÜNÜN ÖNE ÇIKAN HABERLERİ (ANA SAYFAYLA BİREBİR AYNI BOYUT VE BİLEŞEN) */}
        {recommendedNews.length > 0 && (
          <EditorialSecondarySlider
            stories={recommendedNews}
            title="Günün Öne Çıkan Gelişmeleri"
            subtitle="İlginizi Çekebilir"
            viewAllHref="/haberler"
          />
        )}

      </div>
    </div>
  );
}
