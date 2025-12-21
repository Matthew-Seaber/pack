import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // Gets user here instead of the client for security
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not signed in" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const schoolworkID = searchParams.get("schoolworkID");

    if (!schoolworkID) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Gets students' completed status for the schoolwork entry and student IDs for mapping later
    const { data: classStudents, error: classStudentsError } =
      await supabaseMainAdmin
        .from("schoolwork_student_link")
        .select("student_id, completed")
        .eq("class_schoolwork_id", schoolworkID);

    if (classStudentsError) {
      console.error(
        "Error getting class students/completed status':",
        classStudentsError
      );
      return NextResponse.json(
        { error: "Failed to get class students/completed status'" },
        { status: 500 }
      );
    }

    if (!classStudents || classStudents.length === 0) {
      return NextResponse.json({
        incompleteStudents: [],
        completedStudents: [],
      });
    }

    const studentIDs = classStudents.map((link) => link.student_id);

    type StudentProfile = {
      user_id: number;
      first_name: string;
    };

    // Gets students' first names
    const { data: studentNames, error: studentNamesError } =
      await supabaseMainAdmin
        .from("users")
        .select("user_id, first_name")
        .in("user_id", studentIDs);

    if (studentNamesError) {
      console.error("Error getting student profiles:", studentNamesError);
      return NextResponse.json(
        { error: "Failed to get student profiles" },
        { status: 500 }
      );
    }

    // Creates a map of student completion status
    const completionMap = new Map<string, boolean>();
    classStudents?.forEach((link) => {
      completionMap.set(link.student_id.toString(), link.completed);
    });

    // Separate students into completed and incomplete
    const incompleteStudents: Array<{
      student_id: string;
      name: string;
    }> = [];
    const completedStudents: Array<{
      student_id: string;
      name: string;
    }> = [];

    (studentNames as StudentProfile[])?.forEach((student) => {
      const isCompleted =
        completionMap.get(student.user_id.toString()) || false;
      const studentData = {
        student_id: student.user_id.toString(),
        name: student.first_name,
      };

      if (isCompleted) {
        completedStudents.push(studentData);
      } else {
        incompleteStudents.push(studentData);
      }
    });

    return NextResponse.json({
      incompleteStudents,
      completedStudents,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
