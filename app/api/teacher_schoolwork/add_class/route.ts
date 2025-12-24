import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    // Gets user here instead of the client for security
    const user = await getUser();
    const { className } = await req.json();

    if (!user) {
      return NextResponse.json(
        { error: "User not signed in" },
        { status: 401 }
      );
    }

    if (className === undefined || className === null || className === "") {
      return NextResponse.json({ error: "Empty class name" }, { status: 400 });
    }

    const joinCode = crypto.randomBytes(4).toString("hex"); // Generates a unique code for the new class - 4 billion possible combinations

    const { error } = await supabaseMainAdmin
      .from("classes")
      .insert([{ teacher_id: user.user_id, class_name: className, join_code: joinCode }]);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: `Failed to add class to teacher's profile: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Successfully added class to teacher's profile",
      status: 200,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to add class to teacher's profile" },
      { status: 500 }
    );
  }
}
