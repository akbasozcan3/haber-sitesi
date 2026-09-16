import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

function buildNewsIdFilter(idStr: string): any {
  const num = Number(idStr);
  if (!isNaN(num)) {
    return { $or: [{ _id: num }, { id: num }, { slug: idStr }] };
  }
  try {
    return { $or: [{ _id: new ObjectId(idStr) }, { slug: idStr }] };
  } catch {
    return { $or: [{ _id: idStr }, { slug: idStr }] };
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDatabase();
  const item = await db.collection<any>("news").findOne(buildNewsIdFilter(id));
  if (!item) return NextResponse.json({ message: "Haber bulunamadı." }, { status: 404 });
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
    const col = db.collection<any>("news");

    const updateFields: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (data.title !== undefined) updateFields.title = data.title;
    if (data.slug !== undefined) updateFields.slug = data.slug;
    if (data.excerpt !== undefined) updateFields.excerpt = data.excerpt;
    if (data.content !== undefined) updateFields.content = data.content;
    if (data.image !== undefined) updateFields.image = data.image;
    if (data.inner_image !== undefined) updateFields.inner_image = data.inner_image;
    if (data.status !== undefined) updateFields.status = data.status;
    if (data.category_id !== undefined) updateFields.category_id = Number(data.category_id) || data.category_id;
    if (data.author_id !== undefined) updateFields.author_id = Number(data.author_id) || data.author_id;
    if (data.is_featured !== undefined) updateFields.is_featured = data.is_featured ? 1 : 0;

    await col.updateOne(buildNewsIdFilter(id), { $set: updateFields });
    const updated = await col.findOne(buildNewsIdFilter(id));
    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Error updating news:", err);
    return NextResponse.json({ message: "Haber güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    await db.collection<any>("news").deleteOne(buildNewsIdFilter(id));
    return NextResponse.json({ message: "Haber başarıyla silindi." });
  } catch (err) {
    console.error("Error deleting news:", err);
    return NextResponse.json({ message: "Haber silinemedi." }, { status: 500 });
  }
}
