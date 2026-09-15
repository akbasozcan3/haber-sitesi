import Link from "next/link";
import type { Metadata } from "next";
import {
  getPublicNews,
  getCategories,
} from "@/lib/api/haberler";
import NewsCard from "@/components/news/NewsCard";
import KategoriSidebar from "@/components/home/KategoriSidebar";
import { ChevronRight, FolderOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Tüm Haberler ve Gündem Akışı",
  description:
    "Yapay zeka, teknoloji, internet girişimleri ve yatırım dünyasından tüm güncel haberler.",
};

type PageProps = {
  searchParams: Promise<{ kategori?: string }>;
};

export default async function HaberlerPage({ searchParams }: PageProps) {
  const { kategori } = await searchParams;

  const [allNews, categories] = await Promise.all([
    getPublicNews({ category: kategori, status: "published" }),
    getCategories(),
  ]);

  const publishedNews = allNews.filter((item) => item.status === "published");

  // Sidebar için: her kategoriden en fazla 3 yayınlanmış haber
  const sidebarGroups = await Promise.all(
    categories.slice(0, 5).map(async (cat) => {
      const news = await getPublicNews({ category: cat.slug, status: "published", limit: 3 });
      return { category: cat, news };
    })
  );
  const filteredSidebarGroups = sidebarGroups.filter((g) => g.news.length > 0);

  const activeCategoryName = kategori
    ? categories.find((c) => c.slug === kategori)?.name ?? kategori
    : null;

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* GEZİNTİ (BREADCRUMB) */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/" className="transition-colors hover:text-slate-900">
            Ana Sayfa
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <Link href="/haberler" className="transition-colors hover:text-slate-900">
            Haberler
          </Link>
          {activeCategoryName && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-300" />
              <span className="text-slate-900 font-semibold">{activeCategoryName}</span>
            </>
          )}
        </nav>

        {/* BAŞLIK & AÇIKLAMA */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            {activeCategoryName
              ? `${activeCategoryName} Haberleri`
              : "Tüm Haberler ve Gündem Akışı"}
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed">
            {activeCategoryName
              ? `${activeCategoryName} kategorisindeki en güncel gelişmeler, analizler ve sektörel haberler.`
              : "Teknoloji, yapay zeka, girişimcilik, fintek ve yatırım dünyasından en güncel gelişmeler ve analizler."}
          </p>
        </header>

        {/* KATEGORİ SEKMELERİ */}
        <div className="no-scrollbar mb-10 flex items-center gap-6 overflow-x-auto border-b border-slate-100 pb-1">
          <Link
            href="/haberler"
            className={`shrink-0 border-b-2 pb-3 text-sm font-semibold transition-colors ${
              !kategori
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            Tümü <span className="text-xs text-slate-400 font-normal">({publishedNews.length})</span>
          </Link>
          {categories.map((cat) => {
            const isActive = kategori === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/haberler?kategori=${cat.slug}`}
                className={`shrink-0 border-b-2 pb-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* 2 KOLONLU DÜZEN: SOL AKIŞ + SAĞ SIDEBAR */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* SOL: HABER LİSTESİ */}
          <main className="lg:col-span-8">
            {publishedNews.length > 0 ? (
              <div className="flex flex-col divide-y divide-slate-100">
                {publishedNews.map((item) => (
                  <div key={item.id} className="py-5 first:pt-0 last:pb-0">
                    <NewsCard news={item} variant="horizontal" />
                  </div>
                ))}
              </div>
            ) : (
              /* BOŞ DURUM (Çerçevesiz, Sade) */
              <div className="flex flex-col items-start justify-center rounded-2xl bg-slate-50/80 p-8 sm:p-10 my-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/60 text-slate-500 mb-3">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Bu kategoride haber yok
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm">
                  Yeni içerikler yayınlandığında burada görünecek. O sırada tüm haberlere göz atabilirsiniz.
                </p>
                <Link
                  href="/haberler"
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-slate-800"
                >
                  Tüm haberlere dön
                </Link>
              </div>
            )}
          </main>

          {/* SAĞ SIDEBAR: KATEGORİLERE GÖRE HABERLER */}
          <aside className="space-y-10 lg:col-span-4">
            <KategoriSidebar groups={filteredSidebarGroups} />
          </aside>

        </div>
      </div>
    </div>
  );
}