"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Leaf,
  Code,
  Calculator,
  BookOpen,
  Atom,
  FlaskConical,
  Globe,
  Languages,
  Palette,
  Music,
  Dumbbell,
  Building,
  LucideIcon,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function SubjectsPage() {
  interface Subject {
    id: string;
    name: string;
    examBoard: string;
    papers: string;
    examDates: ExamDate[];
  }

  interface ExamDate {
    examDate: string;
    type: string;
  }

  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function mapping subjects to their corresponding icon/colour
  const getSubjectExtras = (
    subjectName: string
  ): { border: string; icon: LucideIcon } => {
    const name = subjectName.toLowerCase();

    // Biology
    if (name.includes("biology")) {
      return { border: "border-green-400", icon: Leaf };
    }
    // Computer Science
    if (name.includes("computer")) {
      return { border: "border-orange-400", icon: Code };
    }
    // Mathematics
    if (name.includes("mathematics")) {
      return { border: "border-purple-500", icon: Calculator };
    }
    // Physics
    if (name.includes("physics")) {
      return { border: "border-blue-400", icon: Atom };
    }
    // Chemistry
    if (name.includes("chemistry")) {
      return { border: "border-cyan-500", icon: FlaskConical };
    }
    // Geography
    if (name.includes("geography")) {
      return { border: "border-teal-400", icon: Globe };
    }
    // English
    if (name.includes("english")) {
      return { border: "border-pink-400", icon: BookOpen };
    }
    // Languages
    if (
      name.includes("french") ||
      name.includes("spanish") ||
      name.includes("german")
    ) {
      return { border: "border-yellow-400", icon: Languages };
    }
    // Art
    if (name.includes("art") || name.includes("graphic")) {
      return { border: "border-pink-300", icon: Palette };
    }
    // Music
    if (name.includes("music")) {
      return { border: "border-yellow-400", icon: Music };
    }
    // PE
    if (name.includes("physical") || name.includes("sport")) {
      return { border: "border-red-400", icon: Dumbbell };
    }
    // Business/economics
    if (name.includes("business") || name.includes("economics")) {
      return { border: "border-amber-400", icon: Building };
    }

    // Default
    return { border: "border-gray-400", icon: BookOpen };
  };

  // Function to convert a given timestamp to a UX-friendly format
  const formatTimestamp = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const year = now.getFullYear();
    const inputYear = date.getFullYear();

    const day = date.getDate();
    const month = date.toLocaleDateString("en-GB", { month: "short" });

    // Include year if it's not due the current year
    if (inputYear !== year) {
      return `${day} ${month} ${inputYear}`;
    } else {
      return `${day} ${month}`;
    }
  };

  // Function to get the next exam for a subject
  const getNextExam = (examDates: ExamDate[]): ExamDate | null => {
    if (!examDates || examDates.length === 0) return null;

    const now = new Date();
    const upcomingExams = examDates.filter(
      (exam) => new Date(exam.examDate) > now
    );

    // Bubble sort to sort based on exam date
    for (let i = 0; i < upcomingExams.length; i++) {
      for (let j = 0; j < upcomingExams.length - i - 1; j++) {
        if (
          new Date(upcomingExams[j].examDate).getTime() >
          new Date(upcomingExams[j + 1].examDate).getTime()
        ) {
          [upcomingExams[j], upcomingExams[j + 1]] = [
            upcomingExams[j + 1],
            upcomingExams[j],
          ];
        }
      }
    }

    return upcomingExams.length > 0 ? upcomingExams[0] : null;
  };

  // Function to render a subject (with colours based on subject name)
  const renderSubject = (subject: Subject) => {
    const extras = getSubjectExtras(subject.name);
    const IconComponent = extras.icon;
    const nextExam = getNextExam(subject.examDates);

    return (
      <div
        key={subject.id}
        className={`relative border-4 ${extras.border} rounded-xl p-6 cursor-pointer`}
      >
        <div className="absolute top-5 right-5">
          <IconComponent className="w-8 h-8" strokeWidth={1.5} />
        </div>

        <div className="pr-20">
          <h3 className="text-xl font-semibold">
            {subject.examBoard} {subject.name}
          </h3>

          <hr className="mt-2 mb-3 border-muted border-1" />

          <div className="text-sm flex flex-col gap-1 border-l-2 border-muted pl-3">
            <Button
              variant="link"
              className="justify-start pl-0 text-foreground font-normal h-auto py-0"
            >
              Specification
            </Button>
            <Button
              variant="link"
              className="justify-start pl-0 text-foreground font-normal h-auto py-0"
            >
              Resources
            </Button>
            <Button
              variant="link"
              className="justify-start pl-0 text-foreground font-normal h-auto py-0"
            >
              Past papers
            </Button>
          </div>

          {nextExam && (
            <p className="text-xs mt-4 text-muted-foreground">
              Next exam: {formatTimestamp(nextExam.examDate)}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Get user data using API and then get subjects
  React.useEffect(() => {
    const fetchUserSubjects = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const userData = await response.json();

          // Check if user is a teacher (since this is a student-only page)
          if (userData.role === "Teacher") {
            router.push("/dashboard");
            return;
          }

          // Gets subjects and their exam dates via API call

          const subjectsResponse = await fetch(
            "/api/subjects/get_subjects_full",
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!subjectsResponse.ok) {
            console.error(
              "Error getting subjects:",
              subjectsResponse.statusText
            );
            toast.error("Error getting your subjects. Please try again later.");
            setSubjects(null);
          } else {
            const subjectsData = await subjectsResponse.json();
            setSubjects(subjectsData.subjects);
          }
        } else {
          // User not logged in
          console.log("No user logged in.");
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Error getting user or tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSubjects();
  }, [router]);

  if (loading) {
    return (
      <>
        <h2 className="text-3xl font-semibold mb-3">My Subjects</h2>

        <h2 className="mt-6 mb-3 text-sm">
          <Spinner className="inline mr-2" />
          <i>Loading subjects...</i>
        </h2>
      </>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-semibold mb-3">My Subjects</h2>

      {subjects && subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {subjects.map((subject) => renderSubject(subject))}
        </div>
      ) : (
        <div className="mt-5 p-6 text-center text-gray-500">
          <p>You have no subjects linked to your profile.</p>
          <Button className="mt-3">Add Subject</Button>
        </div>
      )}
      <Toaster />
    </>
  );
}
