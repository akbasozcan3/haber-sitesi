import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

function buildIdFilter(idStr: string): any {
  const num = Number(idStr);
  if (!isNaN(num)) {
    return { $or: [{ _id: num }, { id: num }] };
  }
  try {
    return { _id: new ObjectId(idStr) };
  } catch {
    return { _id: idStr };
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDatabase();
  const item = await db.collection<any>("categories").findOne(buildIdFilter(id));
  if (!item) return NextResponse.json({ message: "Kategori bulunamadı." }, { status: 404 });
  return NextResponse.json({ data: item });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    const db = await getDatabase();
    const col = db.collection<any>("categories");

    const updateFields: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (data.name !== undefined) updateFields.name = data.name;
    if (data.slug !== undefined) updateFields.slug = data.slug;
    if (data.description !== undefined) updateFields.description = data.description;
    if (data.icon !== undefined) updateFields.icon = data.icon;
    if (data.is_featured !== undefined) updateFields.is_featured = data.is_featured;
    if (data.show_in_navbar !== undefined) updateFields.show_in_navbar = data.show_in_navbar;

    await col.updateOne(buildIdFilter(id), { $set: updateFields });
    const updated = await col.findOne(buildIdFilter(id));
    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Error updating category:", err);
    return NextResponse.json({ message: "Kategori güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    await db.collection<any>("categories").deleteOne(buildIdFilter(id));
    return NextResponse.json({ message: "Kategori başarıyla silindi." });
  } catch (err) {
    console.error("Error deleting category:", err);
    return NextResponse.json({ message: "Kategori silinemedi." }, { status: 500 });
  }
}
