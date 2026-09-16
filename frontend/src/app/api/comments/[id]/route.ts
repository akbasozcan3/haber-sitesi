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
