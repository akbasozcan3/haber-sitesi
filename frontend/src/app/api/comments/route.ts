import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const newsId = url.searchParams.get("news_id");

    const db = await getDatabase();
    const query: Record<string, any> = {};

    if (status === "approved") query.is_approved = true;
    if (status === "pending") query.is_approved = false;
    if (newsId) {
      const num = Number(newsId);
      query.news_id = !isNaN(num) ? num : newsId;
    }
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [{ name: regex }, { content: regex }];
    }

    const comments = await db.collection<any>("comments").find(query).sort({ created_at: -1 }).toArray();

    // Map news details
    const newsIds = [...new Set(comments.map((c) => c.news_id))];
    const newsDocs = await db
      .collection<any>("news")
      .find({ $or: [{ _id: { $in: newsIds } }, { id: { $in: newsIds } }] })
      .toArray();
    const newsMap = new Map<any, any>();
    newsDocs.forEach((n) => {
      newsMap.set(n._id, n);
      if (n.id !== undefined) newsMap.set(n.id, n);
    });

    const mapped = comments.map((c) => {
      const n = newsMap.get(c.news_id);
      return {
        id: c._id ? String(c._id) : c.id,
        news_id: c.news_id,
        name: c.name,
        content: c.content,
        likes: c.likes || 0,
        is_approved: Boolean(c.is_approved),
        created_at: c.created_at ? String(c.created_at) : new Date().toISOString(),
        news: n ? { id: n._id ? String(n._id) : n.id, title: n.title, slug: n.slug } : null,
      };
    });

    return NextResponse.json({ data: mapped, total: mapped.length });
  } catch (err) {
    console.error("Comments error:", err);
    return NextResponse.json({ data: [], total: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const db = await getDatabase();

    const newComment = {
      news_id: Number(data.news_id) || data.news_id,
      name: String(data.name || "Ziyaretçi").trim(),
      content: String(data.content || "").trim(),
      likes: 0,
      is_approved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const res = await db.collection<any>("comments").insertOne(newComment);
    return NextResponse.json({ message: "Yorumunuz alındı.", id: res.insertedId }, { status: 201 });
  } catch (err) {
    console.error("Error creating comment:", err);
    return NextResponse.json({ message: "Yorum kaydedilemedi." }, { status: 500 });
  }
}
