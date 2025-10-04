import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Gets user here instead of the client for security
    const user = await getUser();
    const { taskID } = await req.json();

    if (!user) {
      return NextResponse.json(
        { error: "User not signed in" },
        { status: 401 }
      );
    }

    const user_id = user.user_id;

    const { error: fetchError } = await supabaseMainAdmin
      .from("tasks")
      .delete()
      .eq("task_id", taskID)
      .eq("user_id", user_id);

    if (fetchError) {
      console.error("Error completing task:", fetchError);
      return NextResponse.json(
        { error: "Failed to complete task" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Successfully deleted task ${taskID} from the DB`,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
