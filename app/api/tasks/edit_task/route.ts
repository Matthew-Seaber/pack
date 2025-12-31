import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function PUT(req: Request) {
  // PUT request used rather than POST because PUT is idempotent (calling it once or several times has the same effect)
  try {
    // Gets user here instead of the client for security
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not signed in" },
        { status: 401 }
      );
    }

    const user_id = user.user_id;
    const { id, name, description, due, priority, subject } =
      await req.json();

    // Validate required fields
    if (!name || !priority) {
      return NextResponse.json(
        { error: "Name and priority are required" },
        { status: 400 }
      );
    }

    const now = new Date();

    if (due) {
      if (due < now) {
        return NextResponse.json(
          { error: "Due date cannot be in the past" },
          { status: 400 }
        );
      }
    }

    // Updates the task in the database
    const { data: taskData, error: updateError } = await supabaseMainAdmin
      .from("tasks")
      .update({
        task_name: name,
        task_description: description || null,
        due: due || null,
        priority: priority,
        subject_id: subject || null,
      })
      .eq("task_id", id)
      .eq("user_id", user_id) // Ensures the user calling the API has permission to amend the task
      .select("task_id, task_name, task_description, due, priority, subject_id")
      .single();

    if (updateError) {
      console.error("Error updating task:", updateError);
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 500 }
      );
    }

    // Returns the updated task
    const updatedTask = {
      id: taskData.task_id,
      name: taskData.task_name,
      description: taskData.task_description || null,
      due: taskData.due,
      priority: taskData.priority,
      subject: taskData.subject_id || null,
    };

    return NextResponse.json({
      task: updatedTask,
      message: "Task successfully amended",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
