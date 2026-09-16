import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HaberlerArticle from "@/components/haberler/HaberlerArticle";
import {
  fetchNewsBySlugFromMongo,
  fetchNewsFromMongo,
  fetchCategoriesFromMongo,
} from "@/lib/mongoService";
import type { News } from "@/types/uygulama";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ sayfa?: string }>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const news = await fetchNewsBySlugFromMongo(slug);
  if (!news) return { title: "Haber bulunamadı" };

  // SEO Kuralı: Çok sayfalı makalelerde canonical URL her zaman ana haberi (/haberler/[slug]) işaret etmelidir.
  // Bu sayede kopya içerik cezası önlenir ve sıralama sinyalleri tek adreste toplanır.
  const canonical = `${siteUrl}/haberler/${news.slug}`;

  const sayfaNum = resolvedSearchParams?.sayfa ? parseInt(resolvedSearchParams.sayfa, 10) : 1;
  const titleSuffix = !isNaN(sayfaNum) && sayfaNum > 1 ? ` (Sayfa ${sayfaNum})` : "";

  return {
    title: `${news.title}${titleSuffix}`,
    description: news.excerpt,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${news.title}${titleSuffix}`,
      description: news.excerpt,
      url: !isNaN(sayfaNum) && sayfaNum > 1 ? `${canonical}?sayfa=${sayfaNum}` : canonical,
      type: "article",
      publishedTime: news.published_at || undefined,
      authors: news.author?.name ? [news.author.name] : undefined,
      images: news.image ? [{ url: news.image, alt: news.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${news.title}${titleSuffix}`,
      description: news.excerpt,
      images: news.image ? [news.image] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const news = await fetchNewsBySlugFromMongo(slug);
  if (!news) notFound();

  const sayfa = resolvedSearchParams?.sayfa ? parseInt(resolvedSearchParams.sayfa, 10) : 1;
  const initialPage = isNaN(sayfa) || sayfa < 1 ? 1 : sayfa;

  // Tüm haberler + kategoriler paralel çek
  const [allNewsRaw, categories, featuredNews] = await Promise.all([
    fetchNewsFromMongo(),
    fetchCategoriesFromMongo(),
    fetchNewsFromMongo({ featured: 1, status: "published", limit: 5 }),
  ]);

  const allNews: News[] = allNewsRaw ?? [];
  const published = allNews.filter((item) => item.status === "published" && item.id !== news.id);
  const related = published.filter((item) => item.category_id === news.category_id).slice(0, 4);
  const nextNews = published.find((item) => item.category_id !== news.category_id) || published[0] || null;

  // Sidebar: kategori grupları (mevcut haber kategorisi önce, 4 kategori)
  const sortedCategories = [
    ...categories.filter((c) => c.id === news.category_id),
    ...categories.filter((c) => c.id !== news.category_id),
  ].slice(0, 4);

  const sidebarGroups = await Promise.all(
    sortedCategories.map(async (cat) => {
      const catNews = await fetchNewsFromMongo({ category: cat.slug, status: "published", limit: 3 });
      // Mevcut haberi sidebar listesinden çıkar
      const filtered = (catNews ?? []).filter((n) => n.id !== news.id);
      // Kategoride tek haber varsa sidebar boş kalmasın; API'den gelen mevcut haberi göster.
      return { category: cat, news: filtered.length > 0 ? filtered : catNews ?? [] };
    })
  );
  const filteredSidebarGroups = sidebarGroups.filter((g) => g.news.length > 0);

  return (
    <HaberlerArticle
      news={news}
      related={related}
      sidebarGroups={filteredSidebarGroups}
      featuredNews={featuredNews.filter((item) => item.id !== news.id)}
      nextNews={nextNews}
      shareUrl={`${siteUrl}/haberler/${news.slug}`}
      initialPage={initialPage}
    />
  );
}