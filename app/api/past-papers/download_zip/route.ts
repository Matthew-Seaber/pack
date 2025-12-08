import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entryID = searchParams.get("entryID");

    if (!entryID) {
      return NextResponse.json(
        { error: "Missing entryID" },
        { status: 400 }
      );
    }

    const { data: locationData, error: locationError } =
      await supabaseMainAdmin
        .from("past_papers")
        .select("question_paper_location, mark_scheme_location, model_answers_location, insert_location")
        .eq("paper_id", entryID)
        .single();

    if (locationError) {
      console.error("Error getting file locations:", locationError);
      return NextResponse.json(
        { error: "Failed to get file locations" },
        { status: 500 }
      );
    }

    return NextResponse.json({ locationData });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error or missing user ID" },
      { status: 500 }
    );
  }
}
