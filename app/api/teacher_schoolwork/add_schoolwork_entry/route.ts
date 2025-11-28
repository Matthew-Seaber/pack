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
      type,
      course_id,
      class_id,
    } = await req.json();

    // Security check to ensure users don't exploit API and add entries to classes they don't teach
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
        { error: "User not authorised to add entries to this class" },
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

    // Insert the new entry into the database
    const { data: entryData, error: insertError } = await supabaseMainAdmin
      .from("class_schoolwork")
      .insert({
        class_id: class_id,
        course_id: course_id || null,
        type: newType,
        due: due,
        issued: issued || now,
        schoolwork_name: schoolwork_name,
        schoolwork_description: schoolwork_description || null,
      })
      .select(
        "class_schoolwork_id, course_id, type, due, issued, schoolwork_name, schoolwork_description"
      )
      .single();

    if (insertError) {
      console.error("Error adding entry:", insertError);
      return NextResponse.json(
        { error: "Failed to add entry" },
        { status: 500 }
      );
    }

    const { data: students, error: studentsError } = await supabaseMainAdmin
      .from("class_student_link")
      .select("student_id")
      .eq("class_id", class_id);

    if (studentsError) {
      console.error("Error fetching students:", studentsError);
      return NextResponse.json(
        { error: "Failed to fetch students in the class" },
        { status: 500 }
      );
    }

    // Create schoolwork links for each student
    const { data: studentLinksData, error: studentLinksError } =
      await supabaseMainAdmin.from("schoolwork_student_link").insert(
        students.map((student) => ({
          class_schoolwork_id: entryData.class_schoolwork_id,
          student_id: student.student_id,
          completed: false,
        }))
      )
      .select();

    if (studentLinksError || !studentLinksData) {
      console.error("Error creating student links:", studentLinksError);
      return NextResponse.json(
        { error: "Failed to create student links" },
        { status: 500 }
      );
    }

    const totalStudents = studentLinksData.length;

    // Returns the created entry
    const newEntry = {
      id: entryData.class_schoolwork_id,
      course_name: entryData.course_id,
      schoolworkType: entryData.type,
      due: entryData.due,
      issued: entryData.issued,
      name: entryData.schoolwork_name,
      description: entryData.schoolwork_description,
      completed: `0/${totalStudents}`,
    };

    return NextResponse.json({
      entry: newEntry,
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
