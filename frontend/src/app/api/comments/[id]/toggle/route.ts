import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

function buildCommentIdFilter(idStr: string): any {
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

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const col = db.collection<any>("comments");
    const comment = await col.findOne(buildCommentIdFilter(id));

    if (!comment) return NextResponse.json({ message: "Yorum bulunamadı." }, { status: 404 });

    const newApproved = !comment.is_approved;
    await col.updateOne(buildCommentIdFilter(id), {
      $set: { is_approved: newApproved, updated_at: new Date().toISOString() },
    });

    const updated = await col.findOne(buildCommentIdFilter(id));
    return NextResponse.json({
      message: newApproved ? "Yorum onaylandı." : "Yorum onayı kaldırıldı.",
      comment: updated,
    });
  } catch (err) {
    console.error("Error toggling comment:", err);
    return NextResponse.json({ message: "Yorum güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    await db.collection<any>("comments").deleteOne(buildCommentIdFilter(id));
    return NextResponse.json({ message: "Yorum başarıyla silindi." });
  } catch (err) {
    console.error("Error deleting comment:", err);
    return NextResponse.json({ message: "Yorum silinemedi." }, { status: 500 });
  }
}
