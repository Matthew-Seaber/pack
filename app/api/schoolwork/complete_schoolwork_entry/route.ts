import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Gets user here instead of the client for security
    const user = await getUser();
    const { schoolworkID, category, complete } = await req.json();

    if (!schoolworkID || !category || complete === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not signed in" },
        { status: 401 }
      );
    }

    const user_id = user.user_id;

    if (category === 1) {
        const { error: studentFetchError } = await supabaseMainAdmin
          .from("schoolwork")
          .update({ completed: complete })
          .eq("schoolwork_id", schoolworkID)
          .eq("user_id", user_id);

        if (studentFetchError) {
          console.error("Error completing schoolwork:", studentFetchError);
          return NextResponse.json(
            { error: "Failed to complete student schoolwork" },
            { status: 500 }
          );
        }
    } else if (category === 2) {
        const { error: teacherFetchError } = await supabaseMainAdmin
          .from("schoolwork_student_link")
          .update({ completed: complete })
          .eq("class_schoolwork_id", schoolworkID)
          .eq("student_id", user_id);

        if (teacherFetchError) {
          console.error("Error completing schoolwork:", teacherFetchError);
          return NextResponse.json(
            { error: "Failed to complete teacher schoolwork" },
            { status: 500 }
          );
        }
    } else {
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Successfully updated schoolwork status (${schoolworkID} - ${category})`,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
