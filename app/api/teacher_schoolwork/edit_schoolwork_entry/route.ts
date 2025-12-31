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
    const {
      id,
      schoolwork_name,
      schoolwork_description,
      due,
      issued,
      type,
      course_id,
      class_id,
      original_completed,
    } = await req.json();

    // Security check to ensure users don't exploit API and update entries belonging to classes they don't teach
    const { data: userConfirmationData, error: userConfirmationError } =
      await supabaseMainAdmin
        .from("classes")
        .select("teacher_id")
        .eq("class_id", class_id)
        .single();

    if (userConfirmationError) {
      console.error("Error confirming user:", userConfirmationError);
      return NextResponse.json(
        { error: "Error confirming user is connected to the class" },
        { status: 500 }
      );
    }

    if (userConfirmationData.teacher_id !== user_id) {
      return NextResponse.json(
        { error: "User not authorised to update entries in this class" },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!schoolwork_name || !type || !due || !issued || !class_id) {
      return NextResponse.json(
        {
          error: "Name, type, due date, issued date, and class ID are required",
        },
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

    let newType: number;

    if (type === "Homework") {
      newType = 1;
    } else if (type === "Test") {
      newType = 2;
    } else {
      return NextResponse.json(
        { error: "Invalid type provided" },
        { status: 400 }
      );
    }

    // Updates the entry in the database
    const { data: schoolworkData, error: updateError } = await supabaseMainAdmin
      .from("class_schoolwork")
      .update({
        class_id: class_id,
        course_id: course_id || null,
        type: newType,
        due: due,
        issued: issued || now,
        schoolwork_name: schoolwork_name,
        schoolwork_description: schoolwork_description || null,
      })
      .eq("class_schoolwork_id", id)
      .eq("class_id", class_id)
      .select(
        "class_schoolwork_id, course_id, type, due, issued, schoolwork_name, schoolwork_description"
      )
      .single();

    if (updateError) {
      console.error("Error updating schoolwork entry:", updateError);
      return NextResponse.json(
        { error: "Failed to update schoolwork entry" },
        { status: 500 }
      );
    }

    // Returns the updated entry
    const updatedEntry = {
      id: schoolworkData.class_schoolwork_id,
      course_name: schoolworkData.course_id,
      schoolworkType: schoolworkData.type === 1 ? "Homework" : "Test",
      due: schoolworkData.due,
      issued: schoolworkData.issued,
      name: schoolworkData.schoolwork_name,
      description: schoolworkData.schoolwork_description,
      completed: original_completed,
    };

    return NextResponse.json({
      entry: updatedEntry,
      message: "Schoolwork entry successfully amended",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
