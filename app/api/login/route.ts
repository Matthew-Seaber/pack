import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  // 1. Fetch user ID and password by username
  const { data: user, error: fetchError } = await supabaseMainAdmin
    .from("users")
    .select("id, password")
    .eq("username", username)
    .single();

  if (fetchError || !user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 2. Compare submitted password with stored hash
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 3. Create a new session token
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  await supabaseMainAdmin.from("sessions").insert({
    user_id: user.id,
    token,
    expires_at: expires,
  });

  // 4. Set HTTP-only cookie for session
  const res = NextResponse.json({ message: "Logged in" });
  const cookieAge = 7; // In days

  res.cookies.set({
    name: "session",
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * cookieAge,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
