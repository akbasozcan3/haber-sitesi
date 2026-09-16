import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { fetchSettingsFromMongo } from "@/lib/mongoService";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("favicon") as File | null;

    if (!file) {
      return NextResponse.json({ message: "Favicon dosyası bulunamadı." }, { status: 422 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mime = file.type || "image/x-icon";
    const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;

    const db = await getDatabase();
    await db.collection("settings").updateOne(
      { key: "site_favicon" },
      { $set: { value: dataUri, updated_at: new Date() } },
      { upsert: true }
    );

    const updatedSettings = await fetchSettingsFromMongo();

    return NextResponse.json({
      message: "Favicon başarıyla yüklendi ve MongoDB veritabanına kaydedildi.",
      url: dataUri,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Error uploading favicon to MongoDB:", error);
    return NextResponse.json(
      { message: "Favicon yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
