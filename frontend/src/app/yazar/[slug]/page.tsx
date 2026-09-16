import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchAuthorBySlugFromMongo,
  fetchNewsFromMongo,
  fetchCategoriesFromMongo,
} from "@/lib/mongoService";
import NewsCard from "@/components/news/NewsCard";
import KategoriSidebar from "@/components/home/KategoriSidebar";
import { ChevronRight, Newspaper, Mail } from "lucide-react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await fetchAuthorBySlugFromMongo(slug);
  if (!author) return { title: "Yazar Bulunamadı" };
  return {
    title: `${author.name} - Yazarın Haberleri`,
    description:
      author.bio ||
      `${author.name} tarafından kaleme alınan teknoloji, yapay zeka ve girişimcilik haberleri.`,
  };
}

export default async function YazarPage({ params }: PageProps) {
  const { slug } = await params;

  const [author, news, categories] = await Promise.all([
    fetchAuthorBySlugFromMongo(slug),
    fetchNewsFromMongo({ author: slug, status: "published" }),
    fetchCategoriesFromMongo(),
  ]);

  if (!author) notFound();

  const publishedNews = news.filter((item) => item.status === "published");

  // Sidebar: tüm kategorilerden haberler
  const sidebarGroups = await Promise.all(
    categories.slice(0, 4).map(async (cat) => {
      const catNews = await fetchNewsFromMongo({ category: cat.slug, status: "published", limit: 3 });
      return { category: cat, news: catNews };
    })
  );
  const filteredSidebarGroups = sidebarGroups.filter((g) => g.news.length > 0);

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* BREADCRUMB */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-red-600 transition-colors">Ana Sayfa</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/haberler" className="hover:text-red-600 transition-colors">Haberler</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-neutral-950">{author.name}</span>
        </nav>

        {/* YAZAR PROFİL KARTI */}
        <div className="mb-10 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-100 shadow-md sm:h-28 sm:w-28">
              {author.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={author.avatar} alt={author.name} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-tr from-slate-900 to-red-600 text-4xl font-black text-white">
                  {author.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <span className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-neutral-900 border border-neutral-200">
                Yazar Profili
              </span>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {author.name}
              </h1>
              {author.bio && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">{author.bio}</p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Mail className="h-4 w-4 text-red-600" />
                  <span>{author.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Newspaper className="h-4 w-4 text-red-600" />
                  <span><strong className="font-bold text-slate-900">{publishedNews.length}</strong> yayınlanmış haber</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2 KOLONLU */}
        <div className="grid gap-10 lg:grid-cols-12">
          <main className="lg:col-span-8">
            <div className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-3">
              <Newspaper className="h-4 w-4 text-rose-600" />
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                {author.name} Tarafından Haberler
              </h2>
            </div>
            {publishedNews.length > 0 ? (
              <div className="flex flex-col divide-y divide-slate-100">
                {publishedNews.map((item) => (
                  <div key={item.id} className="py-5 first:pt-0 last:pb-0">
                    <NewsCard news={item} variant="horizontal" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <Newspaper className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="mt-3 text-base font-bold text-slate-900">Henüz yayınlanmış haber yok</h3>
                <Link href="/haberler" className="mt-4 inline-block rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors">
                  Tüm Haberlere Dön
                </Link>
              </div>
            )}
          </main>

          <aside className="space-y-10 lg:col-span-4 self-start">
            <KategoriSidebar groups={filteredSidebarGroups} />
          </aside>
        </div>
      </div>
    </div>
  );
}
