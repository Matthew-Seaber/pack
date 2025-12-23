import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Gets user here instead of the client for security
    const user = await getUser();
    const { classID } = await req.json();

    if (!user) {
      return NextResponse.json(
        { error: "User not signed in" },
        { status: 401 }
      );
    }

    const user_id = user.user_id;

    const newCode = crypto.randomBytes(4).toString("hex")

    const { error: updateError } = await supabaseMainAdmin
      .from("classes")
      .update({ join_code: newCode })
      .eq("class_id", classID)
      .eq("teacher_id", user_id);

    if (updateError) {
      console.error("Database error:", updateError);
      return NextResponse.json(
        { error: `Failed to reset join code ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Successfully reset join code",
      new_code: newCode,
      status: 200,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to reset join code" },
      { status: 500 }
    );
  }
}
