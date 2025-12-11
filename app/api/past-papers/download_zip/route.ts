import { NextResponse } from "next/server";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entryID = searchParams.get("entryID");

    if (!entryID) {
      return NextResponse.json({ error: "Missing entryID" }, { status: 400 });
    }

    const { data: locationData, error: locationError } = await supabaseMainAdmin
      .from("past_papers")
      .select(
        "question_paper_location, mark_scheme_location, model_answers_location, insert_location"
      )
      .eq("paper_id", entryID)
      .single();

    if (locationError) {
      console.error("Error getting file locations:", locationError);
      return NextResponse.json(
        { error: "Failed to get file locations" },
        { status: 500 }
      );
    }

    function zipFile(fileName: string, content: Buffer) {
      const bufferName = Buffer.from(fileName);

      // Writing ZIP header
      const bufferHeader = Buffer.alloc(30);
      bufferHeader.writeUInt32LE(0x04034b50, 0); // Indicates start of a ZIP file
      bufferHeader.writeUInt16LE(20, 4); // Version required to extract data from the ZIP file
      bufferHeader.writeUInt16LE(0, 6); // No encryption
      bufferHeader.writeUInt16LE(0, 8); // No compression
      bufferHeader.writeUInt16LE(0, 10); // Last modification time (set to none)
      bufferHeader.writeUInt16LE(0, 12); // Last modification date (set to none)
      bufferHeader.writeUInt32LE(0, 14); // Checksum (set to none)
      bufferHeader.writeUInt32LE(content.length, 18); // Size of the file (compressed - same as uncompressed in this case)
      bufferHeader.writeUInt32LE(content.length, 22); // Size of the file (uncompressed)
      bufferHeader.writeUInt16LE(bufferName.length, 26); // File name length
      bufferHeader.writeUInt16LE(0, 28); // No extra fields

      return Buffer.concat([bufferHeader, bufferName, content]);
    }

    const fileMap = [
      {
        location: locationData.question_paper_location,
        name: "question_paper.pdf",
      },
      { location: locationData.mark_scheme_location, name: "mark_scheme.pdf" },
      {
        location: locationData.model_answers_location,
        name: "model_answers.pdf",
      },
      { location: locationData.insert_location, name: "insert.pdf" },
    ].filter((file) => file.location); // Removes null/undefined locations

    const buffers: Buffer[] = []; // A 'Buffer' is storage in physical memory to temporary store binary data

    for (let i = 0; i < fileMap.length; i++) {
      const response = await fetch(fileMap[i].location);
      const arrayBuffer = Buffer.from(await response.arrayBuffer());
      const fileName = fileMap[i].name;
      buffers.push(zipFile(fileName, arrayBuffer));
    }

    const zipData = Buffer.concat(buffers); // Combines multiple buffers into one (to be returned below)

    return new NextResponse(zipData);
  } catch (error) {
    return NextResponse.json(
      { error: `Internal server error, ${error}` },
      { status: 500 }
    );
  }
}
