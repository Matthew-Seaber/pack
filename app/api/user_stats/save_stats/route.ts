import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Gets user here instead of the client for security
    const user = await getUser();
    const { user_id, dataToChange, timeRevised } = await req.json();

    if (!user) {
      return NextResponse.json(
        { error: "User not signed in" },
        { status: 401 }
      );
    }

  if (dataToChange === "pomodoro") {
    const { data, error: fetchError } = await supabaseMainAdmin
      .from("student_stats")
      .select("pomodoro_time")
      .eq("user_id", user_id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const currentPomodoroTime = data?.pomodoro_time ?? 0;
    const newPomodoroTime = currentPomodoroTime + timeRevised;

    const { error: updateError } = await supabaseMainAdmin
      .from("student_stats")
      .update({ pomodoro_time: newPomodoroTime })
      .eq("user_id", user_id);

    if (updateError) {
      console.error("Database error:", updateError);
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
