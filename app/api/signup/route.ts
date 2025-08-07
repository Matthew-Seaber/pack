import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";

export async function POST(req: Request) {
  const {
    firstName,
    role,
    username,
    email,
    password,
    yearGroup,
    progressEmails,
    title,
    surname,
    subject /*classes, subjects, examBoards */,
  } = await req.json();

  // Checks if user already exists (email or username)
  const { count, error } = await supabaseMainAdmin
    .from("users")
    .select("user_id")
    .or(`email.eq.${email},username.eq.${username}`);

  if (error) {
    return NextResponse.json(
      { message: `Database error: ${error.message}` },
      { status: 500 }
    );
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { message: "User with this email or username already exists." },
      { status: 409 }
    );
  }

  // Hashing password
  const hashedPassword = await bcrypt.hash(password, 12); // 12 salt rounds for strong security

  // Insert user and their data into database
  let user;
  try {
    const { data, error } = await supabaseMainAdmin
      .from("users")
      .insert([
        {
          username,
          email,
          password: hashedPassword,
          first_name: firstName,
          role,
        },
      ])
      .select();

    if (error) throw error;

    user = data && data[0];
    console.log("Successfully inserted user data:", user);
  } catch (error) {
    return NextResponse.json(
      { message: `Error creating user: ${error}` },
      { status: 500 }
    );
  }

  if (role === "Student") {
    let student;
    try {
      const yearNumber = yearGroup.slice(-2);

      const { data, error } = await supabaseMainAdmin
        .from("students")
        .insert([
          {
            user_id: user.user_id,
            year_group: yearNumber,
            progress_emails: progressEmails,
          },
        ])
        .single();

      if (error) throw error;

      student = data;
      console.log("Successfully inserted student data:", student);
    } catch (error) {
      // START OF TESTING (TEMP)
      try {
        const {} = await supabaseMainAdmin.from("users").insert([
          {
            username: "TEST",
            email: "TEST",
            password: "TEST",
            first_name: "TEST",
            role: "Student",
          },
        ]);
      } catch (error) {
        console.error("Error inserting test user:", error);
      }
      // END OF TESTING

      // Rollback if student creation fails - found out in testing that user would stay in database if this section fails
      try {
        await supabaseMainAdmin
          .from("users")
          .delete()
          .eq("user_id", user.user_id);
      } catch (rollbackError) {
        await fetch("/api/webhooks/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            error: "Failed to rollback user (student)",
            details: String(error) + " | " + String(rollbackError),
            userId: user.user_id,
            context: "/signup/route.ts",
          }),
        });
      }

      return NextResponse.json(
        { message: `Error creating student: ${error}` },
        { status: 500 }
      );
    }
  } else {
    let teacher;
    try {
      const { data, error } = await supabaseMainAdmin
        .from("teachers")
        .insert([
          {
            user_id: user.user_id,
            title: title,
            surname: surname,
            subject: subject,
          },
        ])
        .single();

      if (error) throw error;

      teacher = data;
      console.log("Successfully inserted teacher data:", teacher);
    } catch (error) {
      // Rollback if teacher creation fails - found out in testing that user would stay in database if this section fails
      try {
        await supabaseMainAdmin
          .from("users")
          .delete()
          .eq("user_id", user.user_id);
      } catch (rollbackError) {
        await fetch("/api/webhooks/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            error: "Failed to rollback user (teacher)",
            details: String(error) + " | " + String(rollbackError),
            userId: user.user_id,
            context: "/signup/route.ts",
          }),
        });
      }

      return NextResponse.json(
        { message: `Error creating teacher: ${error}` },
        { status: 500 }
      );
    }
  }

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
