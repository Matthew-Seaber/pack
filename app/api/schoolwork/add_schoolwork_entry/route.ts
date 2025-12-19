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
    const {
      schoolwork_name,
      schoolwork_description,
      due,
      issued,
      type: typeString,
      subject_id,
    } = await req.json();

    // Validate required fields
    if (!schoolwork_name || !typeString || !due || !issued) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    let type = 0;

    if (typeString === "Homework") {
      type = 1;
    } else if (typeString === "Test") {
      type = 2;
    } else {
      return NextResponse.json(
        { error: "Invalid schoolwork type" },
        { status: 400 }
      );
    }

    // Insert the new task into the database
    const { data: schoolworkData, error: insertError } = await supabaseMainAdmin
      .from("schoolwork")
      .insert({
        user_id: user_id,
        type: type,
        completed: false,
        due: due,
        issued: issued,
        schoolwork_name: schoolwork_name,
        schoolwork_description: schoolwork_description || null,
        subject_id: subject_id || null,
      })
      .select(
        `
        schoolwork_id,
        schoolwork_name,
        schoolwork_description,
        due,
        issued,
        type,
        subject_id,
        subjects!subject_id(teacher_name,
            courses!course_id(
              course_name
          )
        )
      `
      )
      .single();

    if (insertError) {
      console.error("Error adding schoolwork entry:", insertError);
      return NextResponse.json(
        { error: "Failed to add schoolwork entry" },
        { status: 500 }
      );
    }

    // Returns the created task
    const newSchoolwork = {
      id: schoolworkData.schoolwork_id,
      category: 1, // Student-managed schoolwork
      schoolworkType: schoolworkData.type === 1 ? "Homework" : "Test",
      due: schoolworkData.due,
      issued: schoolworkData.issued,
      name: schoolworkData.schoolwork_name,
      description: schoolworkData.schoolwork_description || null,
      subject_name: schoolworkData.subjects?.courses?.course_name || null,
      class_name: null,
      teacher_name: schoolworkData.subjects?.teacher_name || null,
      completed: false,
    };

    return NextResponse.json({
      schoolwork: newSchoolwork,
      message: "Schoolwork entry successfully added",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
