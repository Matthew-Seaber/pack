import { NextRequest, NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";

export async function GET(request: NextRequest) {
  try {
    const { user_id } = await request.json();

    const { data: tasksData, error: fetchError } = await supabaseMainAdmin
      .from("tasks")
      .select("task_id, task_name, task_description, due, priority")
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
      description: task.task_description,
      due: task.due,
      priority: task.priority,
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
