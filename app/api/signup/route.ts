import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";

export async function POST(req: Request) {
  const {
    firstName,
    role,
    username,
    email,
    password,
    yearGroup,
    progressEmails,
    title,
    surname,
    subject,
    classes,
    subjects,
    examBoards,
  } = await req.json();

  // Checks if user already exists (email or username)
  const { count, error } = await supabaseMainAdmin
    .from("users")
    .select("user_id")
    .or(`email.eq.${email},username.eq.${username}`);

  if (error) {
    return NextResponse.json(
      { message: `Database error: ${error.message}` },
      { status: 500 }
    );
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { message: "User with this email or username already exists." },
      { status: 409 }
    );
  }

  // Hashing password
  const hashedPassword = await bcrypt.hash(password, 12); // 12 salt rounds for strong security

  // Insert user and their data into database
  let user;
  try {
    const { data, error } = await supabaseMainAdmin
      .from("users")
      .insert([
        {
          username,
          email,
          password: hashedPassword,
          first_name: firstName,
          role,
        },
      ])
      .select();

    if (error) throw error;

    user = data && data[0];
    console.log("Successfully inserted user data:", user);
  } catch (error) {
    return NextResponse.json(
      {
        message: `Error creating user: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      },
      { status: 500 }
    );
  }

  if (role === "Student") {
    let student;
    try {
      const yearNumber = yearGroup.slice(-2);
      let progressEmailsBoolean;

      if (progressEmails === "Enabled") {
        progressEmailsBoolean = true;
      } else {
        progressEmailsBoolean = false;
      }

      const { data, error } = await supabaseMainAdmin
        .from("students")
        .insert([
          {
            user_id: user.user_id,
            year_group: yearNumber,
            progress_emails: progressEmailsBoolean,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      student = data;
      console.log("Successfully inserted student data:", student);
    } catch (error) {
      // Rollback if student creation fails - found out in testing that user would stay in database if this section fails
      // Ensures referential integrity

      try {
        await supabaseMainAdmin
          .from("users")
          .delete()
          .eq("user_id", user.user_id);
      } catch (rollbackError) {
        await fetch("/api/webhooks/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            error: "Failed to rollback user (student)",
            details: String(error) + " | " + String(rollbackError),
            userID: user.user_id,
            context: "/signup/route.ts",
          }),
        });
      }

      return NextResponse.json(
        {
          message: `Error creating student: ${
            error instanceof Error ? error.message : JSON.stringify(error)
          }`,
        },
        { status: 500 }
      );
    }

    try {
      const { error } = await supabaseMainAdmin
        .from("student_stats")
        .insert([
          {
            user_id: user.user_id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      console.log("Successfully inserted student stats.");
    } catch (error) {
      return NextResponse.json(
        {
          message: `Error creating student's stats: ${
            error instanceof Error ? error.message : JSON.stringify(error)
          }`,
        },
        { status: 500 }
      );
    }

    try {
      // Insert empty row for each subject (used in next part and after onboarding - a teacher and their email can be added later but this is optional)

      const subjectRows = subjects.map(() => ({
        user_id: user.user_id,
      }));

      const { data, error } = await supabaseMainAdmin
        .from("subjects")
        .insert(subjectRows)
        .select("subject_id");

      if (error) throw error;

      const subjectIDs = data?.map((row) => row.subject_id) || [];

      // Link each subject to a course

      const combinedRecord: string[][] = [];
      for (let i = 0; i < subjects.length; i++) {
        combinedRecord.push([subjects[i], examBoards[i]]);
      }

      // Find corresponding courseIDs for each subject and create links
      
      const linkRows = [];
      let qualification;
      if (yearGroup == "Year 10" || yearGroup == "Year 11") {
        qualification = "GCSE";
      } else if (yearGroup == "Year 12" || yearGroup == "Year 13") {
        qualification = "A level";
      }

      for (let i = 0; i < combinedRecord.length; i++) {
        const [subjectName, examBoardName] = combinedRecord[i];
        
        const { data: courseData, error: getCourseError } = await supabaseMainAdmin
          .from("courses")
          .select("course_id")
          .eq("course_name", subjectName)
          .eq("exam_board", examBoardName)
          .eq("qualification", qualification);

        if (getCourseError) throw getCourseError;

        if (courseData && courseData.length > 0) {
          linkRows.push({
            subject_id: subjectIDs[i],
            course_id: courseData[0].course_id,
          });
        }
      }

      if (linkRows.length > 0) {
        const { error: linkError } = await supabaseMainAdmin
          .from("subject_course_link")
          .insert(linkRows)
          .select();

        if (linkError) throw linkError;
      }

    } catch (error) {
      return NextResponse.json(
        {
          message: `Error creating student's subjects or linking to courses. It's likely the subject/exam board pair don't exist or aren't yet supported by Pack: ${
            error instanceof Error
              ? error.message
              : typeof error === "string"
                ? error
                : JSON.stringify(error, Object.getOwnPropertyNames(error)) || String(error)
          }`, // Added extra checks above since during testing, the 'error' was {}
          errorDetails: error
        },
        { status: 500 }
      );
    }
  } else {
    let teacher;
    try {
      const { data, error } = await supabaseMainAdmin
        .from("teachers")
        .insert([
          {
            user_id: user.user_id,
            title: title,
            surname: surname,
            subject: subject,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      teacher = data;
      console.log("Successfully inserted teacher data:", teacher);
    } catch (error) {
      // Rollback if teacher creation fails - found out in testing that user would stay in database if this section fails
      try {
        await supabaseMainAdmin
          .from("users")
          .delete()
          .eq("user_id", user.user_id);
      } catch (rollbackError) {
        await fetch("/api/webhooks/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            error: "Failed to rollback user (teacher)",
            details: String(error) + " | " + String(rollbackError),
            userID: user.user_id,
            context: "/signup/route.ts",
          }),
        });
      }

      return NextResponse.json(
        {
          message: `Error creating teacher: ${
            error instanceof Error ? error.message : JSON.stringify(error)
          }`,
        },
        { status: 500 }
      );
    }

    try {
      const classRows = classes.map((className: string) => ({
        teacher_id: user.user_id,
        class_name: className,
        join_code: crypto.randomBytes(4).toString("hex"), // Generates a unique code for each new class - 4 billion possible combinations
      }));

      const { error } = await supabaseMainAdmin
        .from("classes")
        .insert(classRows)
        .select();

      if (error) throw error;

      console.log("Successfully inserted teacher's classes.");
    } catch (error) {
      return NextResponse.json(
        {
          message: `Error creating teacher's classes: ${
            error instanceof Error ? error.message : JSON.stringify(error)
          }`,
        },
        { status: 500 }
      );
    }
  }

  // Creates session token
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  await supabaseMainAdmin.from("sessions").insert({
    user_id: user.user_id,
    token,
    expires: expires,
  });

  // HTTP cookie for session
  const res = NextResponse.json({ message: "Successfully logged in" });
  const cookieAge = 7; // In days

  res.cookies.set({
    name: "sessionCookie",
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * cookieAge,
    sameSite: "lax",
  });

  return res;
}
