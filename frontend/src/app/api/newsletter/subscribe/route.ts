import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ message: "Geçerli bir e-posta adresi giriniz." }, { status: 422 });
    }

    const db = await getDatabase();
    const col = db.collection<any>("newsletter_subscribers");

    const existing = await col.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return NextResponse.json({ message: "Bu e-posta adresi zaten kayıtlı.", subscribed: true });
    }

    await col.insertOne({
      email: email.trim().toLowerCase(),
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Bültene başarıyla abone oldunuz.", subscribed: true });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    return NextResponse.json({ message: "Abonelik kaydedilemedi." }, { status: 500 });
  }
}
