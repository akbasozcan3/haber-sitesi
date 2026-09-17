import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const db = await getDatabase();
    const users = await db
      .collection<any>("users")
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    const mapped = users.map((u) => ({
      id: u._id ? String(u._id) : u.id,
      name: u.name || "Kullanıcı",
      email: u.email,
      is_admin: Boolean(u.is_admin ?? true),
      created_at: u.created_at || new Date().toISOString(),
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("Users list error:", err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, email, password } = data;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Ad, e-posta ve şifre zorunludur." },
        { status: 422 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const db = await getDatabase();
    const col = db.collection<any>("users");

    const existing = await col.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { message: "Bu e-posta adresi ile zaten bir kullanıcı kayıtlı." },
        { status: 422 }
      );
    }

    const maxDoc = await col.find({}).sort({ _id: -1 }).limit(1).toArray();
    const nextId = (maxDoc[0]?._id && typeof maxDoc[0]._id === "number" ? maxDoc[0]._id : 0) + 1;

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const newUser = {
      _id: nextId,
      name: String(name).trim(),
      email: cleanEmail,
      password: hashedPassword,
      is_admin: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await col.insertOne(newUser);

    return NextResponse.json(
      {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        is_admin: true,
        created_at: newUser.created_at,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("User create error:", err);
    return NextResponse.json(
      { message: "Kullanıcı oluşturulurken bir hata meydana geldi." },
      { status: 500 }
    );
  }
}
