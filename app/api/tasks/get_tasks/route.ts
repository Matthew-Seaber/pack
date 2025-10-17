import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function GET() {
  try {
    // Gets user here instead of the client for security
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "User not signed in" }, { status: 401 });
    }

    const user_id = user.user_id;

    const { data: tasksData, error: fetchError } = await supabaseMainAdmin
      .from("tasks")
      .select("task_id, task_name, task_description, due, priority, subject_id")
      .eq("user_id", user_id);

    if (fetchError) {
      console.error("Error getting tasks:", fetchError);
      return NextResponse.json(
        { error: "Failed to get tasks" },
        { status: 500 }
      );
    }

    const tasks = tasksData.map((task) => ({
      id: task.task_id,
      name: task.task_name,
      description: task.task_description || null,
      due: task.due || null,
      priority: task.priority,
      subject: task.subject_id || null,
    }));

    if (tasks.length === 0) {
      return NextResponse.json({ 
        tasks: [], 
        message: "No tasks found" 
      });
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error or missing user ID" },
      { status: 500 }
    );
  }
}
