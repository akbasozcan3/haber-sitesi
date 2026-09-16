import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { fetchNewsFromMongo } from "@/lib/mongoService";
import type { NewsStatus } from "@/types/uygulama";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") || undefined;
  const author = url.searchParams.get("author") || undefined;
  const search = url.searchParams.get("search") || undefined;
  const featured = url.searchParams.has("featured")
    ? url.searchParams.get("featured") === "1" || url.searchParams.get("featured") === "true"
    : undefined;
  const sort = (url.searchParams.get("sort") as "latest" | "popular") || undefined;
  const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined;
  const status = (url.searchParams.get("status") as NewsStatus | "all") || undefined;

  const news = await fetchNewsFromMongo({
    category,
    author,
    search,
    featured,
    sort,
    limit,
    status,
  });

  return NextResponse.json({ data: news });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const db = await getDatabase();
    const col = db.collection<any>("news");

    const maxDoc = await col.find({}).sort({ _id: -1 }).limit(1).toArray();
    const nextId = (maxDoc[0]?._id && typeof maxDoc[0]._id === "number" ? maxDoc[0]._id : 0) + 1;

    const newNews = {
      _id: nextId,
      category_id: Number(data.category_id) || data.category_id,
      author_id: Number(data.author_id) || data.author_id,
      title: data.title,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      excerpt: data.excerpt || "",
      content: data.content || "",
      image: data.image || null,
      inner_image: data.inner_image || null,
      status: data.status || "published",
      is_featured: data.is_featured ? 1 : 0,
      views: 0,
      published_at: data.published_at || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await col.insertOne(newNews);
    return NextResponse.json({ data: newNews }, { status: 201 });
  } catch (err) {
    console.error("Error creating news:", err);
    return NextResponse.json({ message: "Haber oluşturulamadı." }, { status: 500 });
  }
}
