import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getNewsByCategory,
  getCategories,
  getPublicNews,
} from "@/lib/api/haberler";
import NewsCard from "@/components/news/NewsCard";
import KategoriSidebar from "@/components/home/KategoriSidebar";
import { ChevronRight } from "lucide-react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Kategori Bulunamadı" };
  return {
    title: `${category.name} Haberleri`,
    description: `${category.name} alanındaki en güncel teknoloji, yatırım ve girişimcilik haberleri.`,
  };
}

export default async function KategoriPage({ params }: PageProps) {
  const { slug } = await params;

  const [category, news, categories] = await Promise.all([
    getCategoryBySlug(slug),
    getNewsByCategory(slug),
    getCategories(),
  ]);

  if (!category) notFound();

  const publishedNews = news.filter((item) => item.status === "published");

  // Sidebar: aktif kategori hariç diğer kategorilerin haberleri
  const otherCategories = categories.filter((c) => c.slug !== slug).slice(0, 4);
  const sidebarGroups = await Promise.all(
    otherCategories.map(async (cat) => {
      const catNews = await getPublicNews({ category: cat.slug, status: "published", limit: 3 });
      return { category: cat, news: catNews };
    })
  );
  const filteredSidebarGroups = sidebarGroups.filter((g) => g.news.length > 0);

  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* BREADCRUMB */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-neutral-500">
          <Link href="/" className="hover:text-neutral-900 transition-colors">Ana Sayfa</Link>
          <ChevronRight className="h-3 w-3 text-neutral-400" />
          <Link href="/haberler" className="hover:text-neutral-900 transition-colors">Kategoriler</Link>
          <ChevronRight className="h-3 w-3 text-neutral-400" />
          <span className="text-neutral-950 font-bold">{category.name}</span>
        </nav>

        {/* BAŞLIK */}
        <header className="relative mb-10 border-b border-neutral-200 pb-6">
          <div className="flex items-center gap-3">
            <span className="h-8 w-1.5 bg-red-600 rounded-full" />
            <h1 className="text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
              {category.name}
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
            {category.description ||
              `${category.name} alanında Türkiye ve dünyadaki en güncel teknoloji, yatırım ve girişimcilik gelişmeleri.`}
          </p>
          <div className="absolute -bottom-px left-0 h-0.5 w-36 bg-red-600 rounded-full" />
        </header>

        {/* 2 KOLONLU DÜZEN */}
        <div className="grid gap-10 lg:grid-cols-12">

          {/* SOL: HABER LİSTESİ */}
          <div className="lg:col-span-8">
            {publishedNews.length > 0 ? (
              <div className="flex flex-col gap-5">
                {publishedNews.map((item) => (
                  <NewsCard key={item.id} news={item} variant="horizontal" />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
                Bu kategoriye ait henüz yayınlanmış haber bulunmuyor.
              </div>
            )}
          </div>

          {/* SAĞ SIDEBAR */}
          <aside className="space-y-10 lg:col-span-4 self-start">
            <KategoriSidebar groups={filteredSidebarGroups} />
          </aside>
        </div>
      </div>
    </div>
  );
}
