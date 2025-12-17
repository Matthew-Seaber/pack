import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Gets user here instead of the client for security
    const user = await getUser();
    const { dataToChange, extraInfo } = await req.json();

    if (!user) {
      return NextResponse.json(
        { error: "User not signed in" },
        { status: 401 }
      );
    }

    const user_id = user.user_id;

    if (dataToChange === "pomodoro") {
      if (extraInfo === undefined || typeof extraInfo !== "number") {
        return NextResponse.json(
          { error: "Invalid extraInfo value" },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabaseMainAdmin.rpc(
        "increase_pomodoro_stats",
        {
          inputted_user_id: user_id,
          amount: extraInfo,
        }
      );

      if (updateError) {
        console.error("Database error:", updateError);
        return NextResponse.json(
          { error: `Failed to update user stats ${updateError.message}` },
          { status: 500 }
        );
      }
    } else if (dataToChange === "tasks_completed") {
      const { error: updateError } = await supabaseMainAdmin.rpc(
        "increment_tasks_stat",
        {
          inputted_user_id: user_id,
        }
      );

      if (updateError) {
        console.error("Database error:", updateError);
        return NextResponse.json(
          { error: "Failed to update user stats" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid dataToChange value" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Successfully amended data",
      status: 200,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to update user stats" },
      { status: 500 }
    );
  }
}
