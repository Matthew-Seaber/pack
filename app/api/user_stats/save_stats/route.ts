import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";

export async function POST(req: Request) {
  try {
    const { user_id, dataToChange, timeRevised } = await req.json();

  if (dataToChange === "pomodoro") {
    const { error } = await supabaseMainAdmin
      .from("student_stats")
      .update({ pomodoro_time: timeRevised })
      .eq("user_id", user_id);
    
    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to update user stats" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    message: "Successfully amended data",
  });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to update user stats" },
      { status: 500 }
    );
  }
}
