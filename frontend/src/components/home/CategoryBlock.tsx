import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category, News } from "@/types/uygulama";
import NewsCard from "@/components/news/NewsCard";

export default function CategoryBlock({
  category,
  news = [],
}: {
  category: Category;
  news: News[];
}) {
  if (news.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Kategori Başlığı */}
      <div className="relative mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1.5 rounded-full bg-red-600" />
          <h2 className="text-2xl font-black tracking-tight text-neutral-950 sm:text-3xl">
            {category.name}
          </h2>
        </div>

        <Link
          href={`/kategori/${category.slug}`}
          className="group inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-xs font-bold text-neutral-800 transition-all duration-200 hover:border-red-600 hover:bg-red-600 hover:text-white"
        >
          <span>Tüm Haberler</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
        <div className="absolute -bottom-px left-0 h-0.5 w-32 bg-red-600 rounded-full" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {news.slice(0, 3).map((item) => (
          <article key={item.id}>
            <NewsCard news={item} variant="standard" />
          </article>
        ))}
      </div>
    </section>
  );
}
