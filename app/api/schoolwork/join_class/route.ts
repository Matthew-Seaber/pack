import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Gets user here instead of the client for security
    const user = await getUser();
    let { joinCode } = await req.json();

    if (!user) {
      return NextResponse.json(
        { error: "User not signed in" },
        { status: 401 }
      );
    }

    const user_id = user.user_id;
    joinCode = joinCode.trim();

    if (joinCode === undefined || joinCode === null || joinCode === "") {
      return NextResponse.json({ error: "Empty join code" }, { status: 400 });
    }

    const { error } = await supabaseMainAdmin.rpc("join_teacher_class", {
      inputted_join_code: joinCode,
      inputted_student_id: user_id,
    });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: `Failed to add student to class: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Successfully added student to class",
      status: 200,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to add student to class" },
      { status: 500 }
    );
  }
}
