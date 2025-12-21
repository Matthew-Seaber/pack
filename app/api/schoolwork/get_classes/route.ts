import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function GET() {
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

    const { data: classesData, error: fetchError } = await supabaseMainAdmin
      .from("class_student_link")
      .select(
        `class_id,
          classes!class_id(
            class_name,
            teachers!teacher_id(
              title,
              surname
            )
          )`
      )
      .eq("student_id", user_id);

    if (fetchError) {
      console.error("Error getting classes:", fetchError);
      return NextResponse.json(
        { error: "Failed to get classes" },
        { status: 500 }
      );
    }

    type TeacherClassEntry = {
      class_id: number | string;
      classes: {
        class_name?: string;
        teachers: {
          title?: string;
          surname?: string;
        } | null;
      } | null;
    };

    const classes = ((classesData || []) as unknown as TeacherClassEntry[]).map(
      (entry) => {
        const classData = entry.classes;
        const teacherData = classData?.teachers;
        const teacherName =
          teacherData?.title && teacherData?.surname
            ? `${teacherData.title} ${teacherData.surname}`
            : null;

        return {
          id: entry.class_id,
          name: classData?.class_name,
          teacher: teacherName,
        };
      }
    );

    if (classes.length === 0) {
      return NextResponse.json({
        classes: [],
        message: "No classes found",
      });
    }

    return NextResponse.json({ classes });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
