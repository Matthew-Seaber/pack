import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";

export async function POST(req: Request) {
    const { role, username, email, password, yearGroup, progressEmails, title, surname, subject, classes, subjects, examBoards } = await req.json();

    // Checks if user already exists (email or username)
    const { count, error } = await supabaseMainAdmin
        .from("users")
        .select("user_id")
        .or(`email.eq.${email},username.eq.${username}`);

    if (error) {
        return NextResponse.json({ message: `Database error: ${error.message}` }, { status: 500 });
    }

    if ((count ?? 0) > 0) {
        return NextResponse.json({ message: "User with this email or username already exists." }, { status: 409 });
    }

    // Hashing password
    const hashedPassword = await bcrypt.hash(password, 12); // 12 salt rounds for strong security

    // Insert user and their data into database


    // Creates session token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    await supabaseMainAdmin.from("sessions").insert({
        user_id: user.user_id,
        token,
        expires: expires,
    });

    // HTTP cookie for session
    const res = NextResponse.json({ message: "Successfully logged in" });
    const cookieAge = 7; // In days

    res.cookies.set({
        name: "sessionCookie",
        value: token,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * cookieAge,
        sameSite: "lax",
    });

    return res;
}