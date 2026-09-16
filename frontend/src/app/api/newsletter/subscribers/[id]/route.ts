import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

function buildSubscriberIdFilter(idStr: string): any {
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
    await db.collection<any>("newsletter_subscribers").deleteOne(buildSubscriberIdFilter(id));
    return NextResponse.json({ message: "Abone başarıyla silindi." });
  } catch (err) {
    console.error("Newsletter delete subscriber error:", err);
    return NextResponse.json({ message: "Abone silinemedi." }, { status: 500 });
  }
}
