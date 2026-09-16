import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "E-posta ve şifre zorunludur." }, { status: 422 });
    }

    const db = await getDatabase();
    const user = await db.collection("users").findOne({ email: String(email).trim().toLowerCase() });

    if (!user) {
      return NextResponse.json({ message: "Geçersiz e-posta veya şifre." }, { status: 401 });
    }

    let isPasswordValid = false;
    if (user.password) {
      // Try bcrypt comparison
      try {
        isPasswordValid = await bcrypt.compare(String(password), user.password);
      } catch {
        isPasswordValid = false;
      }
      if (!isPasswordValid && user.password === password) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Geçersiz e-posta veya şifre." }, { status: 401 });
    }

    const token = Buffer.from(
      JSON.stringify({
        id: user._id,
        email: user.email,
        name: user.name,
        time: Date.now(),
      })
    ).toString("base64");

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        name: user.name || "Portal Editörü",
        email: user.email,
        is_admin: Boolean(user.is_admin ?? true),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Giriş yapılırken bir hata oluştu." }, { status: 500 });
  }
}
