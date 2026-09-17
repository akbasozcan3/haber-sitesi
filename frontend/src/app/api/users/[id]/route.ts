import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

function buildUserIdFilter(idStr: string): any {
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const user = await db.collection<any>("users").findOne(buildUserIdFilter(id));
    if (!user) {
      return NextResponse.json({ message: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id ? String(user._id) : user.id,
      name: user.name,
      email: user.email,
      is_admin: Boolean(user.is_admin ?? true),
      created_at: user.created_at,
    });
  } catch (err) {
    console.error("User get error:", err);
    return NextResponse.json({ message: "Kullanıcı getirilemedi." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    const db = await getDatabase();
    const col = db.collection<any>("users");

    const updateFields: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updateFields.name = String(data.name).trim();
    if (data.email !== undefined) updateFields.email = String(data.email).trim().toLowerCase();
    if (data.password && String(data.password).trim().length > 0) {
      updateFields.password = await bcrypt.hash(String(data.password), 10);
    }

    await col.updateOne(buildUserIdFilter(id), { $set: updateFields });
    const updated = await col.findOne(buildUserIdFilter(id));

    return NextResponse.json({
      id: updated?._id ? String(updated._id) : id,
      name: updated?.name,
      email: updated?.email,
      is_admin: Boolean(updated?.is_admin ?? true),
      created_at: updated?.created_at,
    });
  } catch (err) {
    console.error("User update error:", err);
    return NextResponse.json({ message: "Kullanıcı güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const col = db.collection<any>("users");

    const user = await col.findOne(buildUserIdFilter(id));
    if (
      user?.email === "ozcanakbas@akillipanda.com" ||
      user?.email === "admin@habersitesi.com" ||
      user?._id === 1
    ) {
      return NextResponse.json(
        { message: "Ana yönetici hesabı silinemez." },
        { status: 403 }
      );
    }

    await col.deleteOne(buildUserIdFilter(id));
    return NextResponse.json({ message: "Kullanıcı başarıyla silindi." });
  } catch (err) {
    console.error("User delete error:", err);
    return NextResponse.json({ message: "Kullanıcı silinemedi." }, { status: 500 });
  }
}
