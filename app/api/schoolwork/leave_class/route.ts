import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Gets user here instead of the client for security
    const user = await getUser();
    const { classID } = await req.json();

    if (!user) {
      return NextResponse.json(
        { error: "User not signed in" },
        { status: 401 }
      );
    }

    const user_id = user.user_id;

    const { error: fetchError } = await supabaseMainAdmin
      .from("class_student_link")
      .delete()
      .eq("class_id", classID)
      .eq("student_id", user_id);

    if (fetchError) {
      console.error("Error removing student from the class:", fetchError);
      return NextResponse.json(
        { error: "Failed to remove student from class" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Successfully removed student from class ${classID}`,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
