import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { fetchSettingsFromMongo } from "@/lib/mongoService";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("logo") as File | null;

    if (!file) {
      return NextResponse.json({ message: "Logo dosyası bulunamadı." }, { status: 422 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mime = file.type || "image/png";
    const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;

    const db = await getDatabase();
    const settingsCol = db.collection("settings");

    await settingsCol.updateOne(
      { key: "site_logo" },
      { $set: { value: dataUri, updated_at: new Date() } },
      { upsert: true }
    );

    await settingsCol.updateOne(
      { key: "site_logo_type" },
      { $set: { value: "image", updated_at: new Date() } },
      { upsert: true }
    );

    const updatedSettings = await fetchSettingsFromMongo();

    return NextResponse.json({
      message: "Logo başarıyla yüklendi ve MongoDB veritabanına kaydedildi.",
      url: dataUri,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Error uploading logo to MongoDB:", error);
    return NextResponse.json(
      { message: "Logo yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
