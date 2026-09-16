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

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const col = db.collection<any>("comments");

    await col.updateOne(buildCommentIdFilter(id), {
      $inc: { likes: 1 },
    });

    const item = await col.findOne(buildCommentIdFilter(id));
    return NextResponse.json({
      message: "Beğeni kaydedildi.",
      likes: item?.likes || 1,
    });
  } catch (err) {
    console.error("Comment like error:", err);
    return NextResponse.json({ message: "Beğeni eklenemedi." }, { status: 500 });
  }
}
