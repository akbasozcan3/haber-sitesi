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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const col = db.collection<any>("news");

    await col.updateOne(buildNewsIdFilter(id), {
      $inc: { views: 1 },
    });

    const updated = await col.findOne(buildNewsIdFilter(id));
    return NextResponse.json({
      id,
      views: updated?.views || 1,
      status: "success",
      counted: true,
    });
  } catch (err) {
    console.error("View increment error:", err);
    return NextResponse.json({ status: "error", counted: false });
  }
}
