import {
  getPublicNews,
  getCategories,
  getAuthors,
} from "@/lib/api/haberler";
import CategoryBlock from "@/components/home/CategoryBlock";
import AuthorsSection from "@/components/home/AuthorsSection";
import FeaturedHero from "@/components/home/FeaturedHero";
import LatestNewsSection from "@/components/home/LatestNewsSection";
import AdBanner from "@/components/ads/AdBanner";


export const dynamic = "force-dynamic";

export default async function AnaSayfa() {
  const [allNews, categories, authors] = await Promise.all([
    getPublicNews({ status: "published", limit: 30 }),
    getCategories(),
    getAuthors(),
  ]);

  // 1. Manşet (Hero Slider): Öncelikle öne çıkarılmışlar (is_featured), toplam 4 haber
  const featuredOnly = allNews.filter((n) => n.is_featured);
  const heroStories = [...featuredOnly.slice(0, 4)];
  if (heroStories.length < 4) {
    for (const item of allNews) {
      if (heroStories.length >= 4) break;
      if (!heroStories.some((h) => h.id === item.id)) {
        heroStories.push(item);
      }
    }
  }

  // 2. Öne Çıkanlar (Sağ Sidebar): Manşette OLMAYAN tamamen farklı 4 haber
  const nonHeroPool = allNews.filter((n) => !heroStories.some((h) => h.id === n.id));
  const sidebarStories = nonHeroPool.slice(0, 4);

  // 3. Günün Önemli Gelişmeleri: Manşet ve Sidebar'da OLMAYAN tamamen farklı 5 haber
  const nonSidebarPool = nonHeroPool.filter((n) => !sidebarStories.some((s) => s.id === n.id));
  const secondaryStories = nonSidebarPool.length > 0 ? nonSidebarPool.slice(0, 5) : nonHeroPool.slice(0, 5);

  // 4. Canlı Haber Akışı: Tüm güncel haber listesi
  const latestNews = allNews;

  // 5. Çok Okunanlar (Popüler Haberler): En çok görüntülenen veya öne çıkan haberler
  const popularNews = [...allNews].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  const visibleCategories = categories.filter((cat) => cat.is_featured !== false);

  // Performans Optimizasyonu: allNews havuzundan kategori haberlerini öncelikli eşle (Aşırı HTTP isteklerini önler)
  const categoryNewsMap = new Map<string, typeof allNews>();
  for (const item of allNews) {
    const slug = item.category?.slug;
    if (slug) {
      const list = categoryNewsMap.get(slug) || [];
      if (list.length < 3) {
        list.push(item);
        categoryNewsMap.set(slug, list);
      }
    }
  }

  const categoryNewsResults = await Promise.all(
    visibleCategories.map(async (cat) => {
      const fromPool = categoryNewsMap.get(cat.slug);
      if (fromPool && fromPool.length >= 2) {
        return fromPool;
      }
      const fetched = await getPublicNews({ category: cat.slug, status: "published", limit: 3 });
      return fetched.length > 0 ? fetched : (fromPool ?? []);
    })
  );

  return (
    <div className="min-h-screen bg-white">
      {allNews.length === 0 ? (
        <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
          <div className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-8 shadow-xs">
            <h2 className="text-base font-bold text-neutral-900">Haberler Hazırlanıyor</h2>
            <p className="mt-2 text-xs leading-relaxed text-neutral-500">
              Güncel içerikler yüklenirken lütfen bekleyin veya kısa bir süre sonra sayfayı yenileyin.
            </p>
          </div>
        </div>
      ) : (
        <>
          {heroStories.length > 0 && (
            <FeaturedHero
              heroNews={heroStories}
              sidebarNews={sidebarStories}
              secondaryNews={secondaryStories}
            />
          )}

          <LatestNewsSection
            news={latestNews}
            popularNews={popularNews}
            categories={categories}
          />

          {/* REKLAM ALANI: Google AdSense Editoryal Billboard Banner */}
          <AdBanner format="billboard" position="home-middle" />

          {visibleCategories.map((cat, idx) => {
            const news = categoryNewsResults[idx] ?? [];
            if (news.length === 0) return null;
            return <CategoryBlock key={cat.id} category={cat} news={news} />;
          })}

          {authors.length > 0 && (
            <div className="border-t border-neutral-200 bg-neutral-50">
              <AuthorsSection authors={authors.slice(0, 4)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
