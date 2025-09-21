import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";

export async function POST(req: Request) {
    const { user_id } = await req.json();

    // Gets a user's stats via user_id
    const { data: user_stats, error: fetchError } = await supabaseMainAdmin
    .from("student_stats")
    .select("streak, tasks_completed, schoolwork_completed, past_papers_completed, resources_downloaded, pomodoro_time")
    .eq("user_id", user_id)
    .single();

  if (fetchError || !user_stats) {
    return NextResponse.json({ error: "Error getting user stats" }, { status: 500 });
  }

  return NextResponse.json({
    message: "Successfully returned data",
    data: user_stats,
  });
}