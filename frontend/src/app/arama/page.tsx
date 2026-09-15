import type { Metadata } from "next";
import Link from "next/link";
import { searchNews, getCategories, getPopularNews } from "@/lib/api/haberler";
import SearchForm from "@/components/search/SearchForm";
import EmptyStateCard from "@/components/search/EmptyStateCard";
import TrendingNewsGrid from "@/components/search/TrendingNewsGrid";
import CategoryCountSidebar from "@/components/search/CategoryCountSidebar";
import SearchResultCard from "@/components/search/SearchResultCard";
import { ChevronRight, FileText, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();
  return {
    title: query ? `"${query}" Arama Sonuçları - Zernews` : "Arama Yap - Zernews",
    description: query
      ? `"${query}" ifadesi ile ilgili teknoloji, yapay zeka, finans ve girişim haberleri.`
      : "Zernews teknoloji, girişimcilik ve yapay zeka haber arşivinde arama yapın.",
  };
}

export default async function AramaPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const searchQuery = q ? q.trim() : "";

  // Paralel veri çekimi: Arama sonuçları, popüler haberler ve kategoriler
  const [results, popularNews, categories] = await Promise.all([
    searchQuery ? searchNews(searchQuery, 24) : Promise.resolve([]),
    getPopularNews(6),
    getCategories(),
  ]);

  const hasResults = results.length > 0;
  const isSearchPerformed = Boolean(searchQuery);

  return (
    <div className="min-h-screen bg-neutral-50/40 py-6 sm:py-10">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* BREADCRUMB */}
        <nav className="mb-5 flex items-center gap-2 text-xs font-medium text-neutral-400">
          <Link href="/" className="hover:text-red-600 transition-colors">
            Ana Sayfa
          </Link>
          <ChevronRight className="h-3 w-3 text-neutral-300" />
          <Link href="/arama" className="hover:text-red-600 transition-colors">
            Arama
          </Link>
          {isSearchPerformed && (
            <>
              <ChevronRight className="h-3 w-3 text-neutral-300" />
              <span className="text-neutral-900 font-bold truncate max-w-xs sm:max-w-md">
                &quot;{searchQuery}&quot;
              </span>
            </>
          )}
        </nav>

        {/* HERO ARAMA KUTUSU & BAŞLIK ALANI */}
        <header className="mb-10 rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
          {/* Hafif kırmızı üst aksan çizgisi */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-neutral-900" />

          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              {isSearchPerformed
                ? hasResults
                  ? `"${searchQuery}" için ${results.length} haber bulundu`
                  : `"${searchQuery}" için sonuç bulunamadı`
                : "Zernews İçerik Arşivinde Arayın"}
            </h1>

            <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 leading-relaxed">
              {isSearchPerformed
                ? hasResults
                  ? "Aradığınız terimle doğrudan eşleşen teknoloji, finans ve girişim haberleri listelendi."
                  : "Aradığınız terimle eşleşen içerik bulunamadı. Lütfen farklı anahtar kelimeler deneyin."
                : "Yapay zeka, fintech, e-ticaret, siber güvenlik ve girişim ekosistemindeki tüm haberlerde anında arama yapın."}
            </p>

            {isSearchPerformed && (
              <div className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-neutral-100/90 border border-neutral-200/60 px-3 py-1 text-xs text-neutral-700">
                <span className="font-medium text-neutral-500">Seçili Etiket / Filtre:</span>
                <span className="font-bold text-red-600">#{searchQuery}</span>
                <Link
                  href="/arama"
                  className="ml-1 rounded px-1.5 py-0.5 text-[11px] font-bold text-neutral-500 hover:bg-neutral-200/80 hover:text-neutral-900 transition-colors"
                >
                  Temizle ✕
                </Link>
              </div>
            )}
          </div>

          <div className="mt-6">
            <SearchForm initialQuery={searchQuery} />
          </div>
        </header>

        {/* ANA İÇERİK BÖLÜMÜ */}
        {isSearchPerformed && !hasResults ? (
          /* =========================================================================
             DURUM 1: SONUÇ BULUNAMADI (EMPTY STATE + ALTERNATİF İÇERİK ALANI)
             ========================================================================= */
          <div className="space-y-10 sm:space-y-12">
            {/* Şık Uyarı ve Arama İpuçları Kutusu */}
            <EmptyStateCard searchQuery={searchQuery} />

            {/* Alternatif İçerik Alanı: Sol (Grid En Çok Okunanlar), Sağ (Kategoriler Sidebar) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* Sol: Gündemdeki En Çok Okunanlar Grid */}
              <div className="lg:col-span-8">
                <TrendingNewsGrid
                  news={popularNews}
                  title="Gündemdeki En Çok Okunanlar"
                  subtitle="İlginizi çekebilecek güncel teknoloji ve yatırım haberleri"
                />
              </div>

              {/* Sağ: Kategoriler ve Sayı Adetleri Sidebar */}
              <aside className="lg:col-span-4 sticky top-24">
                <CategoryCountSidebar categories={categories} />
              </aside>
            </div>
          </div>
        ) : isSearchPerformed && hasResults ? (
          /* =========================================================================
             DURUM 2: ARAMA SONUÇLARI BULUNDU
             ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Sol: Eşleşen Sonuçlar Listesi */}
            <div className="lg:col-span-8 space-y-6">
              {/* Liste Üst Bilgi Barı */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-1 rounded-full bg-red-600" />
                  <h2 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-600" />
                    <span>Eşleşen Haberler</span>
                  </h2>
                  <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-bold text-neutral-600">
                    {results.length}
                  </span>
                </div>

                <div className="text-xs font-semibold text-neutral-400 flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  <span>En Yeniler</span>
                </div>
              </div>

              {/* Sonuç Kartları */}
              <div className="space-y-4">
                {results.map((item) => (
                  <SearchResultCard key={item.id} news={item} />
                ))}
              </div>

              {/* Alt Alternatif Öneri: Gündemdeki En Çok Okunanlar */}
              <div className="mt-14 pt-10 border-t border-gray-100">
                <TrendingNewsGrid
                  news={popularNews.slice(0, 4)}
                  title="Gündemdeki Diğer Gelişmeler"
                  subtitle="Okurlarımızın en çok ilgi gösterdiği öne çıkan haberler"
                />
              </div>
            </div>

            {/* Sağ: Kategoriler Sidebar */}
            <aside className="lg:col-span-4 sticky top-24">
              <CategoryCountSidebar categories={categories} />
            </aside>
          </div>
        ) : (
          /* =========================================================================
             DURUM 3: DOĞRUDAN /arama ZİYARETİ (HENÜZ TERİM GİRİLMEDİ)
             ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Sol: Gündemdeki En Çok Okunanlar */}
            <div className="lg:col-span-8">
              <TrendingNewsGrid
                news={popularNews}
                title="Gündemdeki En Çok Okunanlar"
                subtitle="Aramaya başlamadan önce teknoloji dünyasındaki popüler haberleri inceleyin"
              />
            </div>

            {/* Sağ: Kategoriler Sidebar */}
            <aside className="lg:col-span-4 sticky top-24">
              <CategoryCountSidebar categories={categories} />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
