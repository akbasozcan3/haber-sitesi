import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { fetchCategoriesFromMongo } from "@/lib/mongoService";

export async function GET() {
  const categories = await fetchCategoriesFromMongo();
  return NextResponse.json({ data: categories });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const db = await getDatabase();
    const col = db.collection<any>("categories");

    const maxDoc = await col.find({}).sort({ _id: -1 }).limit(1).toArray();
    const nextId = (maxDoc[0]?._id && typeof maxDoc[0]._id === "number" ? maxDoc[0]._id : 0) + 1;

    const newCategory = {
      _id: nextId,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: data.description || null,
      icon: data.icon || "cpu",
      is_featured: data.is_featured ?? true,
      show_in_navbar: data.show_in_navbar ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await col.insertOne(newCategory);
    return NextResponse.json({ data: newCategory }, { status: 201 });
  } catch (err) {
    console.error("Error creating category:", err);
    return NextResponse.json({ message: "Kategori oluşturulamadı." }, { status: 500 });
  }
}
