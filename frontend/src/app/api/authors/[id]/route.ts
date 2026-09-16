import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

function buildAuthorIdFilter(idStr: string): any {
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
  const item = await db.collection<any>("authors").findOne(buildAuthorIdFilter(id));
  if (!item) return NextResponse.json({ message: "Yazar bulunamadı." }, { status: 404 });
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
    const col = db.collection<any>("authors");

    const updateFields: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (data.name !== undefined) updateFields.name = data.name;
    if (data.slug !== undefined) updateFields.slug = data.slug;
    if (data.email !== undefined) updateFields.email = data.email;
    if (data.bio !== undefined) updateFields.bio = data.bio;
    if (data.avatar !== undefined) updateFields.avatar = data.avatar;

    await col.updateOne(buildAuthorIdFilter(id), { $set: updateFields });
    const updated = await col.findOne(buildAuthorIdFilter(id));
    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Error updating author:", err);
    return NextResponse.json({ message: "Yazar güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    await db.collection<any>("authors").deleteOne(buildAuthorIdFilter(id));
    return NextResponse.json({ message: "Yazar başarıyla silindi." });
  } catch (err) {
    console.error("Error deleting author:", err);
    return NextResponse.json({ message: "Yazar silinemedi." }, { status: 500 });
  }
}
