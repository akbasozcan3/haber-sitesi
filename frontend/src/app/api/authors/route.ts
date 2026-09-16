import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { fetchAuthorsFromMongo } from "@/lib/mongoService";

export async function GET() {
  const authors = await fetchAuthorsFromMongo();
  return NextResponse.json({ data: authors });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const db = await getDatabase();
    const col = db.collection<any>("authors");

    const maxDoc = await col.find({}).sort({ _id: -1 }).limit(1).toArray();
    const nextId = (maxDoc[0]?._id && typeof maxDoc[0]._id === "number" ? maxDoc[0]._id : 0) + 1;

    const newAuthor = {
      _id: nextId,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      email: data.email || "",
      bio: data.bio || null,
      avatar: data.avatar || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await col.insertOne(newAuthor);
    return NextResponse.json({ data: newAuthor }, { status: 201 });
  } catch (err) {
    console.error("Error creating author:", err);
    return NextResponse.json({ message: "Yazar oluşturulamadı." }, { status: 500 });
  }
}
