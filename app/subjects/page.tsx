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
  Newspaper,
  Clock,
  PanelBottomOpen,
  GraduationCap,
} from "lucide-react";
import { Fab } from "@/components/ui/fab";
import { Spinner } from "@/components/ui/spinner";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SubjectsPage() {
  interface Subject {
    id: string;
    name: string;
    description: string;
    examBoard: string;
    papers: string;
    examDates: ExamDate[];
    teacherName: string | null;
    teacherEmail: string | null;
  }

  interface ExamDate {
    examDate: string;
    type: string;
  }

  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [sortType, setSortType] = useState<string>("Alphabetical");
  const [filterType, setFilterType] = useState<string>("None");
  const [qualification, setQualification] = useState<string | null>(null);
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
    if (name.includes("mathematics") || name.includes("math")) {
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
  const formatTimestamp = (timestamp: string, type: number): string => {
    if (!timestamp) return "No date";

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "ERROR";
    const now = new Date();

    if (type === 1) {
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
    } else if (type === 2) {
      // Relative format (e.g. in 3 days) so students can quickly compare the age of different resources (only for dates in the future)
      const msDifference = date.getTime() - now.getTime();
      if (msDifference <= 0) return "ERROR";

      const seconds = Math.floor(msDifference / 1000);
      if (seconds < 60) return "in a few seconds";

      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const weeks = Math.floor(days / 7);
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);

      const format = (value: number, unit: string) =>
        `in ${value} ${unit}${value !== 1 ? "s" : ""}`;

      if (minutes < 60) return format(minutes, "minute");
      if (hours < 24) return format(hours, "hour");
      if (days < 7) return format(days, "day");
      if (weeks < 5) return format(weeks, "week");
      if (months < 12) return format(months, "month");
      return format(years, "year");
    } else {
      return date.toLocaleDateString();
    }
  };

  // Function to get the next or final exam for a subject
  const getExam = (
    examDates: ExamDate[],
    type: "next" | "final"
  ): ExamDate | null => {
    if (!examDates || examDates.length === 0) return null;

    const now = new Date();
    let filteredExams = examDates;

    if (type === "next") {
      filteredExams = examDates.filter((exam) => new Date(exam.examDate) > now);
    }

    if (filteredExams.length === 0) return null;

    // Sorts by exam date using bubble sort
    for (let i = 0; i < filteredExams.length; i++) {
      for (let j = 0; j < filteredExams.length - i - 1; j++) {
        if (
          new Date(filteredExams[j].examDate).getTime() >
          new Date(filteredExams[j + 1].examDate).getTime()
        ) {
          [filteredExams[j], filteredExams[j + 1]] = [
            filteredExams[j + 1],
            filteredExams[j],
          ];
        }
      }
    }

    return type === "next"
      ? filteredExams[0]
      : filteredExams[filteredExams.length - 1];
  };

  // Sidebar content component
  const SidebarContent = () => {
    if (!selectedSubject) {
      return (
        <div className="space-y-4">
          <div className="flex gap-2 font-semibold">
            <Button className="flex-1" variant="default">
              <span className="mr-2">+</span>
              ADD SUBJECT
            </Button>
            <Button className="text-foreground" variant="destructive">
              <span className="mr-2">-</span>
              REMOVE
            </Button>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center py-12">
            <p className="text-muted-foreground">
              Select a subject to view details.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Custom Insights</h3>
            </div>
            <p className="text-xs text-muted-foreground">Blah blah blah</p>
          </div>
        </div>
      );
    }

    const nextExam = getExam(selectedSubject.examDates, "next");
    const finalExam = getExam(selectedSubject.examDates, "final");

    return (
      <div className="space-y-4">
        <div className="flex gap-2 font-semibold">
          <Button className="flex-1" variant="default">
            <span className="mr-2">+</span>
            ADD SUBJECT
          </Button>
          <Button className="text-foreground" variant="destructive">
            <span className="mr-2">-</span>
            REMOVE
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">
            {selectedSubject.examBoard} {selectedSubject.name}
          </h3>
          <div className="space-y-2 text-sm">
            {nextExam &&
              new Date(nextExam.examDate).getTime() - new Date().getTime() <=
                21 * 24 * 60 * 60 * 1000 && ( // Within next 3 weeks
                <div className="flex gap-2">
                  <Badge
                    backgroundColour="rgba(239, 68, 68, 0.2)"
                    textColour="#F87171"
                    className="w-auto px-3 py-1"
                  >
                    Exam soon
                  </Badge>
                </div>
              )}
            {nextExam && (
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4" strokeWidth={2} />
                <p>Next exam: {formatTimestamp(nextExam.examDate, 1)}</p>
              </div>
            )}
            {finalExam && (
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4" strokeWidth={2} />
                <p>Final exam: {formatTimestamp(finalExam.examDate, 1)}</p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Newspaper className="w-4 h-4" strokeWidth={2} />
              <p>{selectedSubject.papers} papers</p>
            </div>
            {selectedSubject.teacherName && (
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4" strokeWidth={2} />
                <p>
                  Teacher:{" "}
                  <a
                    href={`mailto:${selectedSubject.teacherEmail}`}
                    className="underline"
                  >
                    {selectedSubject.teacherName}
                  </a>
                </p>
              </div>
            )}
            {selectedSubject.description && (
              <p className="text-muted-foreground text-xs italic">
                {selectedSubject.description}
              </p>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <Button
              className="w-full"
              onClick={() =>
                router.push(
                  `/specification/${qualification}/` +
                    selectedSubject.name.replace(/ /g, "-").toLowerCase() +
                    "/" +
                    selectedSubject.examBoard.toLowerCase()
                )
              }
            >
              View Specification
            </Button>
            <Button
              className="w-full bg-[#F8921A] hover:bg-[#DF8319]"
              onClick={() =>
                router.push(
                  `/resources/${qualification}/` +
                    selectedSubject.name.replace(/ /g, "-").toLowerCase() +
                    "/" +
                    selectedSubject.examBoard.toLowerCase()
                )
              }
            >
              View Resources
            </Button>
            <Button
              className="w-full bg-[#F8921A] hover:bg-[#DF8319]"
              onClick={() =>
                router.push(
                  `/past-papers/${qualification}/` +
                    selectedSubject.name.replace(/ /g, "-").toLowerCase() +
                    "/" +
                    selectedSubject.examBoard.toLowerCase()
                )
              }
            >
              View Past Papers
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                const emailSubject = encodeURIComponent(
                  "Issue with Subject Page for " +
                    qualification +
                    " - " +
                    selectedSubject.name +
                    " (" +
                    selectedSubject.examBoard +
                    ")"
                );
                const emailBody = encodeURIComponent(`Dear Pack Support,

      I believe there is an issue on the subjects page regarding the following subject:
      - Qualification: ${qualification}
      - Subject: ${selectedSubject.name}
      - Exam Board: ${selectedSubject.examBoard}

      Details of the issue:
      [Please describe the issue here]

      Kind regards,
      [Your Name]`);

                window.location.href = `mailto:support@packapp.co.uk?subject=${emailSubject}&body=${emailBody}`;
              }}
            >
              Report Issue
            </Button>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Custom Insights</h3>
          </div>
          <p className="text-xs text-muted-foreground">Blah blah blah</p>
        </div>
      </div>
    );
  };

  // Function to render a subject (with colours based on subject name)
  const renderSubject = (subject: Subject) => {
    const extras = getSubjectExtras(subject.name);
    const IconComponent = extras.icon;
    const nextExam = getExam(subject.examDates, "next");

    return (
      <div
        key={subject.id}
        onClick={() => setSelectedSubject(subject)}
        className={`relative border-4 ${
          extras.border
        } rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
          selectedSubject?.id === subject.id ? "ring-4 ring-primary" : "" // Adds outline when selected
        }`}
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
              onClick={() =>
                router.push(
                  `/specification/${qualification}/` +
                    subject.name.replace(/ /g, "-").toLowerCase() +
                    "/" +
                    subject.examBoard.toLowerCase()
                )
              }
            >
              Specification
            </Button>
            <Button
              variant="link"
              className="justify-start pl-0 text-foreground font-normal h-auto py-0"
              onClick={() =>
                router.push(
                  `/resources/${qualification}/` +
                    subject.name.replace(/ /g, "-").toLowerCase() +
                    "/" +
                    subject.examBoard.toLowerCase()
                )
              }
            >
              Resources
            </Button>
            <Button
              variant="link"
              className="justify-start pl-0 text-foreground font-normal h-auto py-0"
              onClick={() =>
                router.push(
                  `/past-papers/${qualification}/` +
                    subject.name.replace(/ /g, "-").toLowerCase() +
                    "/" +
                    subject.examBoard.toLowerCase()
                )
              }
            >
              Past papers
            </Button>
          </div>

          {nextExam && (
            <p className="text-xs mt-4 text-muted-foreground">
              Next exam: {formatTimestamp(nextExam.examDate, 1)} (
              {formatTimestamp(nextExam.examDate, 2)})
            </p>
          )}
        </div>
      </div>
    );
  };

  // Get user data using API
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

          // Get qualification level
          const qualificationResponse = await fetch(
            "/api/user/student/get_year_group",
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!qualificationResponse.ok) {
            console.error(
              "Error getting year group:",
              qualificationResponse.statusText
            );
            toast.error(
              "Error getting your qualification level. Please try again later."
            );
          } else {
            const qualificationData = await qualificationResponse.json();
            const yearGroup = qualificationData.yearGroup;

            if (yearGroup === 10 || yearGroup === 11) {
              setQualification("gcse");
            } else if (yearGroup === 12 || yearGroup === 13) {
              setQualification("a-level");
            } else {
              setQualification(null);
            }
          }
        } else {
          // User not logged in
          console.log("No user logged in.");
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Error getting user or subjects:", error);
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
      <div className="flex gap-6 pb-24 xl:pb-0">
        <div className="flex-1">
          <h2 className="text-3xl font-semibold mb-4">My Subjects</h2>

          <div className="flex flex-col xl:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search subjects..."
                className="w-full h-[42px] px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="bg-card border border-border rounded-lg px-4 h-[42px] flex items-center gap-4 text-sm xl:w-auto">
              <div className="flex items-center gap-2">
                <label className="text-muted-foreground" htmlFor="sort">
                  Sort:
                </label>
                <Select value={sortType} onValueChange={setSortType}>
                  <SelectTrigger id="sort" className="border-0 p-0">
                    <SelectValue placeholder="Alphabetical" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alphabetical">Alphabetical</SelectItem>
                    <SelectItem value="Exam Date">Exam Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-muted-foreground" htmlFor="filter">
                  Filter:
                </label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger id="filter" className="border-0 p-0">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Exam Board">Remaining Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {subjects && subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {subjects.map((subject) => renderSubject(subject))}
            </div>
          ) : (
            <div className="mt-5 p-6 text-center text-gray-500">
              <p>You have no subjects linked to your profile.</p>
              <Button className="mt-3">Add Subject</Button>
            </div>
          )}
        </div>

        <div className="hidden md:block w-80">
          <SidebarContent />
        </div>
      </div>

      <div className="md:hidden lg:hidden xl:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Fab>
              <PanelBottomOpen />
            </Fab>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>More Information</DrawerTitle>
              <DrawerDescription>
                Quick actions and personalised recommendations.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4 overflow-y-auto">
              <SidebarContent />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <Toaster />
    </>
  );
}
