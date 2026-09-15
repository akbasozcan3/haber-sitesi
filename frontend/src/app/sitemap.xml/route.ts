import { NextResponse } from "next/server";
import { getCategories, getPublicNews, getAuthors } from "@/lib/api/haberler";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value.replace(/[<>&'\"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;",
  })[character] ?? character);
}

export async function GET() {
  const [news, categories, authors] = await Promise.all([
    getPublicNews({ status: "published", limit: 50 }),
    getCategories(),
    getAuthors(),
  ]);
  const now = new Date().toISOString();
  const urls = [
    { path: "", lastmod: now, changefreq: "daily", priority: "1.0" },
    { path: "/haberler", lastmod: now, changefreq: "daily", priority: "0.9" },
    { path: "/arama", lastmod: now, changefreq: "weekly", priority: "0.7" },
    ...categories.map((category) => ({
      path: `/kategori/${encodeURIComponent(category.slug)}`,
      lastmod: category.updated_at ?? now,
      changefreq: "weekly",
      priority: "0.8",
    })),
    ...authors.map((author) => ({
      path: `/yazar/${encodeURIComponent(author.slug)}`,
      lastmod: author.updated_at ?? now,
      changefreq: "weekly",
      priority: "0.7",
    })),
    ...news.map((article) => ({
      path: `/haberler/${encodeURIComponent(article.slug)}`,
      lastmod: article.published_at ?? article.updated_at ?? now,
      changefreq: "daily",
      priority: "0.9",
    })),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map((url) => `<url><loc>${escapeXml(`${SITE_URL}${url.path}`)}</loc><lastmod>${escapeXml(url.lastmod)}</lastmod><changefreq>${url.changefreq}</changefreq><priority>${url.priority}</priority></url>`).join("\n  ")}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate",
    },
  });
}