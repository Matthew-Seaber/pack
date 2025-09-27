import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";

export async function POST(req: Request) {
    const { userID, newPassword, oldPassword } = await req.json();

    if (!userID || !newPassword || !oldPassword)
        return NextResponse.json({ ok: false }, { status: 400 });

    const { data, error } = await supabaseMainAdmin
        .from("users")
        .select("password")
        .eq("user_id", userID)
        .single();

    if (error) {
        return NextResponse.json({ ok: false }, { status: 500 });
    }

    const isValid = await bcrypt.compare(oldPassword, data.password);
    if (!isValid) {
        return NextResponse.json({ ok: false, error: "Current password is incorrect." }, { status: 401 });
    }

    // Hashing password
    const hashedPassword = await bcrypt.hash(newPassword, 12); // 12 salt rounds for strong security

    const { error: updateError } = await supabaseMainAdmin
      .from("users")
      .update({ password: hashedPassword })
      .eq("user_id", userID);

    if (updateError) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}