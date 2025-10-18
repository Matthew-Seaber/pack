import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
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
    const { name, description, due, priority, subject } = await req.json();

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

    // Insert the new task into the database
    const { data: taskData, error: insertError } = await supabaseMainAdmin
      .from("tasks")
      .insert({
        user_id: user_id,
        task_name: name,
        task_description: description || null,
        due: due || null,
        priority: priority,
        subject_id: subject || null,
      })
      .select("task_id, task_name, task_description, due, priority, subject_id")
      .single();

    if (insertError) {
      console.error("Error adding task:", insertError);
      return NextResponse.json(
        { error: "Failed to add task" },
        { status: 500 }
      );
    }

    // Returns the created task
    const newTask = {
      id: taskData.task_id,
      name: taskData.task_name,
      description: taskData.task_description || null,
      due: taskData.due || null,
      priority: taskData.priority,
      subject: taskData.subject_id || null,
    };

    return NextResponse.json({
      task: newTask,
      message: "Task successfully added",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
