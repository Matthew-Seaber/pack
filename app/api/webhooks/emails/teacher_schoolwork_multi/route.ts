import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import { NextResponse } from "next/server";

import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      emailType,
      name,
      description,
      dueDate,
      type,
      className,
      teacherName,
      studentIDs,
    } = body;

    let subject = "";

    // Formatting email
    if (emailType === "reminder") {
      subject = `REMINDER: ${type} due soon (${className})!`;
    } else if (emailType === "update") {
      subject = `${type.toUpperCase()} UPDATE: Details have changed (${className})!`;
    }

    const emailContent = `
      <h2>${subject}</h2>
      <h3><strong>Name:</strong> ${name || "N/A"}</h3>
      <p><strong>Description:</strong> ${description || "N/A"}</p>
      <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleString()}</p>
      <p><strong>Class:</strong> ${className || "N/A"}</p>
      <p><strong>Teacher:</strong> ${teacherName || "N/A"}</p>
      <hr>
      <p><em>Automated email from Pack</em></p>

      <button onclick="window.location.href='https://packapp.co.uk/schoolwork'">View schoolwork</button>
    `;

    const { data: studentData, error: studentError } = await supabaseMainAdmin
      .from("users")
      .select("email")
      .in("user_id", studentIDs);

    if (studentError || !studentData || studentData.length === 0) {
      throw new Error(
        `Failed to fetch students' email addresses: ${studentError?.message ?? "No students found"}`,
      );
    }

    const emails = studentData.map((stdnt) => stdnt.email?.trim());

    const { error: batchError } = await resend.batch.send(
      emails.map((email) => ({
        from: "Pack Support <support@packapp.co.uk>",
        to: [email],
        subject: subject,
        html: emailContent,
      })),
    );

    if (batchError) {
      throw new Error(`Failed to send batch emails: ${batchError.message}`);
    }

    return NextResponse.json({ success: true, });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to send email: ${error}` },
      { status: 500 },
    );
  }
}
