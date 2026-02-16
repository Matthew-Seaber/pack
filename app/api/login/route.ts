import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  // Gets the user's ID and hashed password via username
  const { data: user, error: fetchError } = await supabaseMainAdmin
    .from("users")
    .select("user_id, password")
    .eq("username", username)
    .single();

  if (fetchError || !user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 }); // Deliberately vague - doesn't give away whether username or password is incorrect
  }

  // Compares password with hashed value
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 }); // Deliberately vague - doesn't give away whether username or password is incorrect
  }

  // Creates session token
  const token = crypto.randomUUID();
  const cookieAge = 90; // In days
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * cookieAge); // 90 days

  await supabaseMainAdmin.from("sessions").insert({
    user_id: user.user_id,
    token,
    expires: expires,
  });

  // HTTP cookie for session
  const res = NextResponse.json({
    message: "Successfully logged in",
    clearCache: true,
  });

  res.cookies.set({
    name: "sessionCookie",
    value: token,
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * cookieAge,
    sameSite: "lax",
  });

  // Clears cache (required for role-based navbar)
  revalidatePath("/", "layout");

  return res;
}
