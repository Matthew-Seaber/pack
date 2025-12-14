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

    function crc32(buffer: Buffer) {
      // CRC32 checksum calculation (cycle redundancy check) - required to ensure data integrity by checking for corruption - the CRC is a unique* value generated from the file's data (*collisions rare)
      const table = new Uint32Array(256); // Array of 256 unsigned 32-bit integers
      for (let byte = 0; byte < 256; byte++) {
        let crc = byte;
        for (let bit = 0; bit < 8; bit++) {
          crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1; // Checks if least significant bit is 1. If true (1), crc is shifted right by 1 bit and XORed with the polynomial constant. If false (0), crc is just shifted right by 1 bit
        }
        table[byte] = crc >>> 0; // Result stored in the table for quick lookup in code below (after being converted to an unsigned 32-bit integer)
      }

      let crc = ~0; // Flips bits (bitwise NOT)
      for (let byteIndex = 0; byteIndex < buffer.length; byteIndex++) {
        crc = table[(crc ^ buffer[byteIndex]) & 0xff] ^ (crc >>> 8); // XORs crc with the current byte and masks the result of this to the lowest 8 bits (using 0xff) to ensure it is within the table's range (line 31: 0-255). This value from the table is then XORed with the value of crc shifted right by 8 bits
      }

      return ~crc >>> 0; // Flips all bits and converts to an unsigned 32-bit integer (ensures number returned is positive)
    }

    function createLocalFileHeader(
      fileName: string,
      content: Buffer,
      crc: number
    ) {
      const bufferName = Buffer.from(fileName);

      // Writing ZIP local header
      const bufferHeader = Buffer.alloc(30); // 30 bytes
      bufferHeader.writeUInt32LE(0x04034b50, 0); // Indicates start of a local file header
      bufferHeader.writeUInt16LE(20, 4); // Version required to extract data from the ZIP file
      bufferHeader.writeUInt16LE(0, 6); // No encryption
      bufferHeader.writeUInt16LE(0, 8); // No compression
      bufferHeader.writeUInt16LE(0, 10); // Last modification time (set to none)
      bufferHeader.writeUInt16LE(0, 12); // Last modification date (set to none)
      bufferHeader.writeUInt32LE(crc, 14); // Checksum
      bufferHeader.writeUInt32LE(content.length, 18); // Size of the file (compressed - same as uncompressed in this case)
      bufferHeader.writeUInt32LE(content.length, 22); // Size of the file (uncompressed)
      bufferHeader.writeUInt16LE(bufferName.length, 26); // File name length
      bufferHeader.writeUInt16LE(0, 28); // No extra fields

      return Buffer.concat([bufferHeader, bufferName]);
    }

    function createCentralDirectoryHeader(
      fileName: string,
      content: Buffer,
      tempOffset: number,
      crc: number
    ) {
      const bufferName = Buffer.from(fileName);

      // Writing ZIP central directory header
      const bufferHeader = Buffer.alloc(46); // 46 bytes
      bufferHeader.writeUInt32LE(0x02014b50, 0); // Indicates start of a central directory file header
      bufferHeader.writeUInt16LE(20, 4); // Version made by
      bufferHeader.writeUInt16LE(20, 6); // Version required to extract data from the ZIP file
      bufferHeader.writeUInt16LE(0, 8); // No encryption
      bufferHeader.writeUInt16LE(0, 10); // No compression
      bufferHeader.writeUInt16LE(0, 12); // Last modification time (set to none)
      bufferHeader.writeUInt16LE(0, 14); // Last modification date (set to none)
      bufferHeader.writeUInt32LE(crc, 16); // Checksum
      bufferHeader.writeUInt32LE(content.length, 20); // Size of the file (compressed - same as uncompressed in this case)
      bufferHeader.writeUInt32LE(content.length, 24); // Size of the file (uncompressed)
      bufferHeader.writeUInt16LE(bufferName.length, 28); // File name length
      bufferHeader.writeUInt16LE(0, 30); // No extra fields
      bufferHeader.writeUInt16LE(0, 32); // No file comment
      bufferHeader.writeUInt16LE(0, 34); // Disk number where file starts
      bufferHeader.writeUInt16LE(0, 36); // No internal file attributes
      bufferHeader.writeUInt32LE(0, 38); // No external file attributes
      bufferHeader.writeUInt32LE(tempOffset, 42); // Position in bytes of where the file's local header starts

      return Buffer.concat([bufferHeader, bufferName]);
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

    const localFileBuffers: Buffer[] = []; // A 'Buffer' is storage in physical memory to temporary store binary data
    const centralDirectoryBuffers: Buffer[] = []; // A 'Buffer' is storage in physical memory to temporary store binary data
    let offset = 0;

    for (let i = 0; i < fileMap.length; i++) {
      const response = await fetch(fileMap[i].location); // Fetch file from its public URL
      const fileBuffer = Buffer.from(await response.arrayBuffer()); // Converts file to a buffer
      const crc = crc32(fileBuffer); // Calculates CRC32 checksum
      const localHeader = createLocalFileHeader(
        fileMap[i].name,
        fileBuffer,
        crc
      ); // Creates local file header
      const localFileEntry = Buffer.concat([localHeader, fileBuffer]); // Combines local header and file buffer into one
      localFileBuffers.push(localFileEntry); // Adds the combined buffer above to the localFileBuffers array
      centralDirectoryBuffers.push(
        createCentralDirectoryHeader(fileMap[i].name, fileBuffer, offset, crc)
      ); // Creates central directory header and adds it to the centralDirectoryBuffers array
      offset += localFileEntry.length; // Offset must be updated to point to the next available byte in the ZIP file (for the next file's local header)
    }

    const zipBuffer = Buffer.concat([
      ...localFileBuffers,
      ...centralDirectoryBuffers,
    ]); // Combines multiple buffers into one (to be returned below)

    const centralDirectorySize = centralDirectoryBuffers.reduce(
      (acc, bfr) => acc + bfr.length, // Sums the lengths of all central directory buffers so the ZIP knows how many bytes it occupies
      0
    );

    // Writing end of central directory record
    const endBuffer = Buffer.alloc(22); // 22 bytes
    endBuffer.writeUInt32LE(0x06054b50, 0); // Indicates start of the end of central directory record
    endBuffer.writeUInt16LE(0, 4); // Number of this disk
    endBuffer.writeUInt16LE(0, 6); // Disk where central directory starts
    endBuffer.writeUInt16LE(fileMap.length, 8); // Number of central directory records on this disk
    endBuffer.writeUInt16LE(fileMap.length, 10); // Total number of central directory records
    endBuffer.writeUInt32LE(centralDirectorySize, 12); // Size in bytes of the central directory
    endBuffer.writeUInt32LE(offset, 16); // Offset of the start of central directory (in bytes)
    endBuffer.writeUInt16LE(0, 20); // No file comment

    const zipData = Buffer.concat([zipBuffer, endBuffer]); // Combines all previous buffers into the final ZIP buffer for returning to client

    return new NextResponse(zipData, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=past-papers.zip",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Internal server error, ${error}` },
      { status: 500 }
    );
  }
}
