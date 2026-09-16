import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const num = Number(id);
    const filter = !isNaN(num) ? { $or: [{ news_id: num }, { news_id: id }] } : { news_id: id };

    const comments = await db
      .collection<any>("comments")
      .find({ ...filter, is_approved: true })
      .sort({ created_at: -1 })
      .toArray();

    const mapped = comments.map((c) => ({
      id: c._id ? String(c._id) : c.id,
      news_id: c.news_id,
      name: c.name,
      content: c.content,
      likes: c.likes || 0,
      is_approved: true,
      created_at: c.created_at || new Date().toISOString(),
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("News comments error:", err);
    return NextResponse.json([]);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    const db = await getDatabase();

    const num = Number(id);
    const newsId = !isNaN(num) ? num : id;

    const newComment = {
      news_id: newsId,
      name: String(data.name || "Ziyaretçi").trim(),
      content: String(data.content || "").trim(),
      likes: 0,
      is_approved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const res = await db.collection<any>("comments").insertOne(newComment);
    return NextResponse.json(
      {
        message: "Yorumunuz yönetici onayına gönderildi.",
        comment: { ...newComment, id: String(res.insertedId) },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create news comment error:", err);
    return NextResponse.json({ message: "Yorum eklenemedi." }, { status: 500 });
  }
}
