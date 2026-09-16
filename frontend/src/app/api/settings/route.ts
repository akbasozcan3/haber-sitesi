import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { fetchSettingsFromMongo } from "@/lib/mongoService";

export async function GET() {
  const settings = await fetchSettingsFromMongo();
  return NextResponse.json({ settings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await getDatabase();
    const settingsCol = db.collection("settings");

    const allowedKeys = [
      "site_logo",
      "site_logo_type",
      "site_logo_height",
      "site_favicon",
      "site_title",
      "site_tagline",
      "site_description",
      "ads_enabled",
      "adsense_client",
      "adsense_slot_header",
      "adsense_slot_billboard",
      "adsense_slot_sidebar",
      "adsense_slot_article",
      "ad_mode",
    ];

    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        await settingsCol.updateOne(
          { key },
          { $set: { value: String(body[key]), updated_at: new Date() } },
          { upsert: true }
        );
      }
    }

    const updatedSettings = await fetchSettingsFromMongo();
    return NextResponse.json({
      message: "Site ayarları başarıyla güncellendi.",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { message: "Ayarlar güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
