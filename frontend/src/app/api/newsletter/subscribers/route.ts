import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDatabase();
    const list = await db
      .collection<any>("newsletter_subscribers")
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    const mapped = list.map((item) => ({
      id: item._id ? String(item._id) : item.id,
      email: item.email,
      created_at: item.created_at || new Date().toISOString(),
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("Newsletter subscribers error:", err);
    return NextResponse.json([]);
  }
}
