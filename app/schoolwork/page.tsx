"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AlarmClock,
  CalendarPlus,
  GraduationCap,
  Notebook,
  PanelBottomOpen,
  Square,
  SquareCheck,
} from "lucide-react";
import { Fab } from "@/components/ui/fab";
import { Spinner } from "@/components/ui/spinner";
import { Toaster, toast } from "sonner";
import confetti from "canvas-confetti";
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronDownIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SchoolworkPage() {
  interface SchoolworkEntry {
    id: string;
    category: number; // 1 = student-managed, 2 = teacher-managed
    schoolworkType: "Homework" | "Test"; // Can be either "Homework" or "Test", restricts assigning any other value
    due: string;
    issued: string | null;
    name: string;
    description: string | null;
    subject_name: string | null;
    class_name: string | null;
    teacher_name: string | null;
    completed: boolean;
  }

  interface Subject {
    id: string;
    name: string;
  }

  const [schoolworkEntries, setSchoolworkEntries] = useState<
    SchoolworkEntry[] | null
  >(null);
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [futureEntries, setFutureEntries] = useState<SchoolworkEntry[]>([]);
  const [overdueEntries, setOverdueEntries] = useState<SchoolworkEntry[]>([]);
  const [completedEntries, setCompletedEntries] = useState<SchoolworkEntry[]>(
    []
  );
  const [selectedEntry, setSelectedEntry] = useState<SchoolworkEntry | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [entryName, setEntryName] = useState("");
  const [entryDescription, setEntryDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [issuedDate, setIssuedDate] = useState<Date | undefined>(undefined);
  const [entryType, setEntryType] = useState<"Homework" | "Test">("Homework");
  const [subjectID, setSubjectID] = useState<string | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [issuedCalendarOpen, setIssuedCalendarOpen] = useState(false);
  const router = useRouter();

  // Function to sort entries by due date (using bubble sort)
  const sortEntriesByDueDate = useCallback(
    (entries: SchoolworkEntry[]): SchoolworkEntry[] => {
      const sortedCopy = [...entries];
      const sortedListLength = sortedCopy.length;

      for (let i = 0; i < sortedListLength - 1; i++) {
        for (let j = 0; j < sortedListLength - i - 1; j++) {
          const dateA = new Date(sortedCopy[j].due);
          const dateB = new Date(sortedCopy[j + 1].due);

          if (dateA > dateB) {
            // Swap if date is after
            const tempValue = sortedCopy[j];
            sortedCopy[j] = sortedCopy[j + 1];
            sortedCopy[j + 1] = tempValue;
          }
        }
      }

      return sortedCopy;
    },
    []
  );

  const playCompletionSFX = () => {
    try {
      const audio = new Audio("/sounds/task-complete.mp3");
      audio.volume = 0.1;
      audio.play().catch((error) => {
        console.log("Could not play completion SFX:", error);
      });
    } catch (error) {
      console.log("Could not play completion SFX:", error);
    }
  };

  // Function to handle adding a new schoolwork entry
  const handleAddEntry = async () => {
    // Validate fields
    if (!entryName.trim()) {
      toast.error("Entry name is required.");
      return;
    }

    try {
      // Combine date and time into a timestampz
      let dueTimestamp: string | null = null;
      let issuedTimestamp: string | null = null;
      const now = new Date();

      if (dueDate) {
        const combinedDate = new Date(dueDate);
        combinedDate.setHours(23, 59, 59, 999);

        if (combinedDate < now) {
          toast.error("Due date cannot be in the past.");
          return;
        }

        dueTimestamp = combinedDate.toISOString();
      } else {
        toast.error("Please enter a due date.");
        return;
      }

      if (issuedDate) {
        const combinedDate = new Date(issuedDate);
        combinedDate.setHours(23, 59, 59, 999);
        issuedTimestamp = combinedDate.toISOString();
      } else {
        const combinedDate = new Date(now);
        combinedDate.setHours(23, 59, 59, 999);
        issuedTimestamp = combinedDate.toISOString();
      }

      if (issuedTimestamp > dueTimestamp) {
        toast.error("Issued date cannot be after the due date.");
        return;
      }

      const response = await fetch("/api/schoolwork/add_schoolwork_entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolwork_name: entryName.trim(),
          schoolwork_description: entryDescription.trim() || null,
          due: dueTimestamp,
          issued: issuedTimestamp,
          type: entryType,
          subject_id: subjectID || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Schoolwork entry added!");

        // Add new entry to the appropriate section (updates UI without refresh for improved UX)
        const newEntry = data.entry;
        const sortedEntries = sortEntriesByDueDate(
          schoolworkEntries ? [...schoolworkEntries, newEntry] : [newEntry]
        );
        setSchoolworkEntries(sortedEntries);

        // Categorise the new entry
        const category = categoriseEntry(newEntry);
        addEntryToCategory(newEntry, category);

        setEntryName("");
        setEntryDescription("");
        setDueDate(undefined);
        setIssuedDate(undefined);
        setEntryType("Homework");
        setSubjectID(undefined);
        setSheetOpen(false);
      } else {
        console.error("Failed to add schoolwork entry:", response.statusText);
        toast.error("Failed to add schoolwork entry. Please try again later.");
      }
    } catch (error) {
      console.error("Error adding schoolwork entry:", error);
      toast.error("Error adding schoolwork entry. Please try again later.");
    }
  };

  const handleMarkComplete = async (entryID: string, entryCategory: number) => {
    try {
      const response = await fetch(
        "/api/schoolwork/complete_schoolwork_entry",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            schoolworkID: entryID,
            category: entryCategory,
            complete: true,
          }),
        }
      );

      if (response.ok) {
        playCompletionSFX();
        toast.success("Schoolwork completed!");
        confetti({
          particleCount: 80,
          spread: 50,
          origin: { y: 0.6 },
          ticks: 100,
          gravity: 1.2,
        });

        // Moves entry to completed list (updates UI without refresh for improved UX)
        setSchoolworkEntries((previous) =>
          previous
            ? previous.map((entry) =>
                entry.id === entryID && entry.category === entryCategory
                  ? { ...entry, completed: true }
                  : entry
              )
            : null
        );
        setFutureEntries((previous) =>
          previous.filter(
            (entry) =>
              !(entry.id === entryID && entry.category === entryCategory)
          )
        );
        setOverdueEntries((previous) =>
          previous.filter(
            (entry) =>
              !(entry.id === entryID && entry.category === entryCategory)
          )
        );
        const completedEntry = [...futureEntries, ...overdueEntries].find(
          (entry) => entry.id === entryID && entry.category === entryCategory
        ); // Finds entry from either list and adds to the completed list below
        if (completedEntry) {
          setCompletedEntries((previous) => [
            ...previous,
            { ...completedEntry, completed: true }, // Marks entry as completed
          ]);
        }
        setSelectedEntry(null);
      } else {
        console.error(
          "Failed to complete schoolwork entry:",
          response.statusText
        );
        toast.error("Failed to complete schoolwork. Please try again later.");
      }
    } catch (error) {
      console.error("Error completing schoolwork entry:", error);
      toast.error("Error completing schoolwork. Please try again later.");
    }
  };

  const handleMarkIncomplete = async (
    entryID: string,
    entryCategory: number
  ) => {
    try {
      const response = await fetch(
        "/api/schoolwork/complete_schoolwork_entry",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            schoolworkID: entryID,
            category: entryCategory,
            complete: false,
          }),
        }
      );

      if (response.ok) {
        toast.success("Schoolwork marked as incomplete.");

        setSchoolworkEntries((previous) =>
          previous
            ? previous.map((entry) =>
                entry.id === entryID && entry.category === entryCategory
                  ? { ...entry, completed: false }
                  : entry
              ) // Switches 'complete' to false in master list
            : null
        );
        setCompletedEntries(
          (
            previous // Removes entry from the completed list
          ) =>
            previous.filter(
              (entry) =>
                !(entry.id === entryID && entry.category === entryCategory)
            )
        );
        // Finds the entry and categorises it based on due date (below)
        const incompleteEntry = completedEntries.find(
          (entry) => entry.id === entryID && entry.category === entryCategory
        );

        if (incompleteEntry) {
          // Moves entry to future or overdue list (updates UI without refresh for improved UX)
          const updatedEntry = { ...incompleteEntry, completed: false };
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const dueDate = new Date(updatedEntry.due);
          dueDate.setHours(0, 0, 0, 0);

          if (dueDate >= now) {
            setFutureEntries((previous) => [...previous, updatedEntry]);
          } else {
            setOverdueEntries((previous) => [...previous, updatedEntry]);
          }
        }

        setSelectedEntry(null);
      } else {
        console.error(
          "Failed to mark schoolwork as incomplete:",
          response.statusText
        );
        toast.error(
          "Failed to mark schoolwork as incomplete. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error marking schoolwork as incomplete:", error);
      toast.error(
        "Error marking schoolwork as incomplete. Please try again later."
      );
    }
  };

  // Function to convert a given timestamp to a UX-friendly format
  const formatTimestamp = (timestamp: string | null): string => {
    if (!timestamp) return "No date";

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "ERROR";

    const weekday = date.toLocaleDateString("en-GB", { weekday: "long" });
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${weekday} ${day}/${month}/${year}`;
  };

  // Split entries into future/today, past, and completed
  const categoriseEntry = React.useCallback(
    (entry: SchoolworkEntry): "future" | "past" | "completed" => {
      if (entry.completed === true) {
        return "completed";
      }

      const dueDate = new Date(entry.due);
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      dueDate.setHours(0, 0, 0, 0); // Makes it so time of day doesn't affect categorisation

      if (dueDate >= now) {
        return "future";
      } else {
        return "past";
      }
    },
    []
  );

  // Function to add an entry to the appropriate category
  const addEntryToCategory = React.useCallback(
    (entry: SchoolworkEntry, category: ReturnType<typeof categoriseEntry>) => {
      switch (category) {
        case "future":
          setFutureEntries((previous) => [...previous, entry]);
          break;
        case "past":
          setOverdueEntries((previous) => [...previous, entry]);
          break;
        case "completed":
          setCompletedEntries((previous) => [...previous, entry]);
          break;
        default:
          console.log("Entry categorisation error", category);
          break;
      }
    },
    []
  );

  // Sidebar content component
  const SidebarContent = () => {
    if (!selectedEntry) {
      return (
        <div className="space-y-4">
          <div className="flex gap-2 font-semibold">
            <Button
              className="flex-1"
              variant="default"
              onClick={() => {
                setEntryType("Homework");
                setSheetOpen(true);
              }}
            >
              <span className="mr-2">+</span>
              ADD HOMEWORK
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setEntryType("Test");
                setSheetOpen(true);
              }}
            >
              <span className="mr-2">+</span>
              ADD TEST
            </Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 text-center py-12">
            <p className="text-muted-foreground">
              Select an entry to view details.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex gap-2 font-semibold">
          <Button
            className="flex-1"
            variant="default"
            onClick={() => {
              setEntryType("Homework");
              setSheetOpen(true);
            }}
          >
            <span className="mr-2">+</span>
            ADD HOMEWORK
          </Button>
          <Button
            variant="default"
            onClick={() => {
              setEntryType("Test");
              setSheetOpen(true);
            }}
          >
            <span className="mr-2">+</span>
            ADD TEST
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">{selectedEntry.name}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              {selectedEntry.due < new Date().toISOString() && (
                <Badge
                  backgroundColour="rgba(239, 68, 68, 0.2)"
                  textColour="#F87171"
                  className="w-auto px-3 py-1"
                >
                  Overdue
                </Badge>
              )}
              {selectedEntry.schoolworkType === "Homework" && (
                <Badge
                  backgroundColour="rgba(59, 130, 246, 0.2)"
                  textColour="#3B82F6"
                  className="w-auto px-3 py-1"
                >
                  Homework
                </Badge>
              )}
              {selectedEntry.schoolworkType === "Test" && (
                <Badge
                  backgroundColour="rgba(239, 68, 68, 0.2)"
                  textColour="#F87171"
                  className="w-auto px-3 py-1"
                >
                  Test
                </Badge>
              )}
              {selectedEntry.category === 2 && (
                <Badge
                  backgroundColour="rgba(248, 146, 26, 0.2)"
                  textColour="#F8921A"
                  className="w-auto px-3 py-1"
                >
                  Managed by teacher
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <AlarmClock className="w-4 h-4" strokeWidth={2} />
              <p>Due: {formatTimestamp(selectedEntry.due)}</p>
            </div>
            <div className="flex items-center gap-3">
              <CalendarPlus className="w-4 h-4" strokeWidth={2} />
              <p>Issued: {formatTimestamp(selectedEntry.issued)}</p>
            </div>
            {selectedEntry.class_name ? (
              <div className="flex items-center gap-3">
                <Notebook className="w-4 h-4" strokeWidth={2} />
                <p>
                  Class: {selectedEntry.class_name}
                  {selectedEntry.subject_name
                    ? ` (${selectedEntry.subject_name})`
                    : null}
                </p>
              </div>
            ) : selectedEntry.subject_name ? (
              <div className="flex items-center gap-3">
                <Notebook className="w-4 h-4" strokeWidth={2} />
                <p>Subject: {selectedEntry.subject_name}</p>
              </div>
            ) : null}
            {selectedEntry.teacher_name && (
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4" strokeWidth={2} />
                <p>Teacher: {selectedEntry.teacher_name}</p>
              </div>
            )}
            {selectedEntry.description && (
              <p className="text-muted-foreground text-xs italic">
                {selectedEntry.description}
              </p>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {selectedEntry.completed === false && (
              <Button
                className="w-full"
                onClick={() =>
                  handleMarkComplete(selectedEntry.id, selectedEntry.category)
                }
              >
                Mark complete
              </Button>
            )}
            {selectedEntry.completed === true && (
              <Button
                className="w-full"
                onClick={() =>
                  handleMarkIncomplete(selectedEntry.id, selectedEntry.category)
                }
              >
                Mark incomplete
              </Button>
            )}
            {selectedEntry.category === 1 && ( // Only deletion of student-managed entries is allowed
              <Button className="w-full bg-[#F8921A] hover:bg-[#DF8319]">
                Edit
              </Button>
            )}
            {selectedEntry.category === 1 && ( // Only deletion of student-managed entries is allowed
              <Button
                variant="destructive"
                className="w-full"
                onClick={async () => {
                  try {
                    const response = await fetch(
                      "/api/schoolwork/delete_schoolwork_entry",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          schoolworkID: selectedEntry.id,
                        }),
                      }
                    );

                    if (response.ok) {
                      toast.success("Schoolwork entry deleted.");
                      // Refreshes all entry lists and UI to ensure consistency before and after the transaction
                      setSchoolworkEntries((previous) =>
                        previous
                          ? previous.filter(
                              (swk) =>
                                !(
                                  swk.id === selectedEntry.id &&
                                  swk.category === selectedEntry.category
                                )
                            )
                          : null
                      );
                      setFutureEntries((previous) =>
                        previous.filter(
                          (swk) =>
                            !(
                              swk.id === selectedEntry.id &&
                              swk.category === selectedEntry.category
                            )
                        )
                      );
                      setOverdueEntries((previous) =>
                        previous.filter(
                          (swk) =>
                            !(
                              swk.id === selectedEntry.id &&
                              swk.category === selectedEntry.category
                            )
                        )
                      );
                      setCompletedEntries((previous) =>
                        previous.filter(
                          (swk) =>
                            !(
                              swk.id === selectedEntry.id &&
                              swk.category === selectedEntry.category
                            )
                        )
                      );
                      setSelectedEntry(null);
                    } else {
                      console.error(
                        "Failed to delete schoolwork entry:",
                        response.statusText
                      );
                      toast.error(
                        "Failed to delete schoolwork entry. Please try again later."
                      );
                    }
                  } catch (error) {
                    console.error("Error deleting schoolwork entry:", error);
                    toast.error(
                      "Error deleting schoolwork entry. Please try again later."
                    );
                  }
                }}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  React.useEffect(() => {
    const fetchSchoolworkData = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const userData = await response.json();

          // Check if user is a teacher (since this is a student-only page)
          if (userData.role === "Teacher") {
            router.push("/dashboard");
            return;
          }

          // Gets schoolwork entries for the student
          const schoolworkResponse = await fetch(
            `/api/schoolwork/get_schoolwork_data`
          );

          if (!schoolworkResponse.ok) {
            console.error(
              "Error getting schoolwork entries:",
              schoolworkResponse.statusText
            );
            toast.error("Error getting schoolwork. Please try again later.");
            setSchoolworkEntries(null);
          } else {
            type APIResponse = {
              schoolwork: SchoolworkEntry[];
            };

            const schoolworkData =
              (await schoolworkResponse.json()) as APIResponse;
            const sortedEntries = sortEntriesByDueDate(
              schoolworkData.schoolwork
            );
            setSchoolworkEntries(sortedEntries);

            const now = new Date();
            now.setHours(0, 0, 0, 0); // Start of today

            const future: SchoolworkEntry[] = [];
            const past: SchoolworkEntry[] = [];
            const completed: SchoolworkEntry[] = [];

            sortedEntries.forEach((entry) => {
              if (entry.completed) {
                completed.push(entry);
              } else {
                const dueDate = new Date(entry.due);
                dueDate.setHours(0, 0, 0, 0);

                if (dueDate >= now) {
                  future.push(entry);
                } else {
                  past.push(entry);
                }
              }
            });

            setFutureEntries(future);
            setOverdueEntries(past);
            setCompletedEntries(completed);

            const subjectsResponse = await fetch("/api/subjects/get_subjects", {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });

            if (!subjectsResponse.ok) {
              console.error(
                "Error getting subjects:",
                subjectsResponse.statusText
              );
              toast.error(
                "Error getting your subjects for schoolwork creation. Please try again later"
              );
              setSubjects(null);
            } else {
              const subjectsData = await subjectsResponse.json();
              setSubjects(subjectsData.subjects);
            }
          }
        } else {
          // User not logged in
          console.log("No user logged in.");
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Error getting user or schoolwork entries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolworkData();
  }, [router, sortEntriesByDueDate]);

  if (loading) {
    return (
      <>
        <h2 className="text-3xl font-semibold mb-3">Schoolwork</h2>

        <h2 className="mt-6 mb-3 text-sm">
          <Spinner className="inline mr-2" />
          <i>Loading schoolwork...</i>
        </h2>
      </>
    );
  }

  return (
    <>
      <div className="flex gap-6 pb-24 xl:pb-0">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 break-words">
            Schoolwork
          </h2>

          {schoolworkEntries && schoolworkEntries.length > 0 ? (
            <div className="space-y-6">
              {futureEntries.length > 0 && ( // Table for future entries
                <div>
                  <h3 className="text-xl font-semibold mb-3">Upcoming</h3>
                  <div style={{ overflowX: "auto", width: "100%" }}>
                    <div className="border border-border rounded-xl overflow-hidden">
                      <table
                        className="w-full border-collapse"
                        style={{ minWidth: "600px" }}
                      >
                        <thead>
                          <tr className="bg-muted border-b border-border">
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold w-12 border-r-2 border-border"
                              style={{ width: "5%" }}
                            ></th>
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                              style={{ width: "20%" }}
                            >
                              NAME
                            </th>
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                              style={{ width: "10%" }}
                            >
                              SUBJECT
                            </th>
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                              style={{ width: "18%" }}
                            >
                              ISSUED
                            </th>
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                              style={{ width: "18%" }}
                            >
                              DUE
                            </th>
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold"
                              style={{ width: "12%" }}
                            >
                              TYPE
                            </th>
                          </tr>
                        </thead>
                        <tbody className="font-medium">
                          {futureEntries.map((entry) => (
                            <tr
                              key={`${entry.id}-${entry.category}`}
                              onClick={() => setSelectedEntry(entry)}
                              className={`border-b-2 border-border cursor-pointer hover:opacity-80 ${
                                selectedEntry?.id === entry.id &&
                                selectedEntry?.category === entry.category
                                  ? "ring-4 ring-primary ring-inset rounded-lg"
                                  : ""
                              }`}
                            >
                              <td className="px-4 py-4 text-center hover:bg-gray-800 border-r-2 border-border">
                                <div className="w-full h-full flex items-center justify-center">
                                  <button
                                    title="Open"
                                    className="rounded text-lg font-semibold"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkComplete(
                                        entry.id,
                                        entry.category
                                      );
                                    }}
                                  >
                                    <Square />
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-sm font-semibold border-r-2 border-border">
                                {entry.name}
                              </td>

                              <td className="px-4 py-4 text-sm font-semibold border-r-2 border-border">
                                {entry.subject_name ?? <i>No linked subject</i>}
                              </td>

                              <td className="px-4 py-4 text-sm border-r-2 border-border">
                                {formatTimestamp(entry.issued)}
                              </td>

                              <td className="px-4 py-4 text-sm font-medium border-r-2 border-border">
                                {formatTimestamp(entry.due)}
                              </td>

                              <td className="px-4 py-4 text-sm">
                                {entry.schoolworkType}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {overdueEntries.length > 0 && ( // Table for overdue entries
                <div>
                  <h3 className="text-xl font-semibold mb-3">Overdue</h3>
                  <div style={{ overflowX: "auto", width: "100%" }}>
                    <div className="border border-border rounded-xl overflow-hidden">
                      <table
                        className="w-full border-collapse"
                        style={{ minWidth: "600px" }}
                      >
                        <thead>
                          <tr className="bg-muted border-b border-border">
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold w-12 border-r-2 border-border"
                              style={{ width: "5%" }}
                            ></th>
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                              style={{ width: "20%" }}
                            >
                              NAME
                            </th>
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                              style={{ width: "10%" }}
                            >
                              SUBJECT
                            </th>
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                              style={{ width: "18%" }}
                            >
                              ISSUED
                            </th>
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                              style={{ width: "18%" }}
                            >
                              DUE
                            </th>
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold"
                              style={{ width: "12%" }}
                            >
                              TYPE
                            </th>
                          </tr>
                        </thead>
                        <tbody className="font-medium">
                          {overdueEntries.map((entry) => (
                            <tr
                              key={`${entry.id}-${entry.category}`}
                              onClick={() => setSelectedEntry(entry)}
                              className={`border-b-2 border-border cursor-pointer hover:opacity-80 ${
                                selectedEntry?.id === entry.id &&
                                selectedEntry?.category === entry.category
                                  ? "ring-4 ring-primary ring-inset rounded-lg"
                                  : ""
                              }`}
                            >
                              <td className="px-4 py-4 text-center hover:bg-gray-800 border-r-2 border-border">
                                <div className="w-full h-full flex items-center justify-center">
                                  <button
                                    title="Open"
                                    className="rounded text-lg font-semibold"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkComplete(
                                        entry.id,
                                        entry.category
                                      );
                                    }}
                                  >
                                    <Square />
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-sm font-semibold border-r-2 border-border">
                                {entry.name}
                              </td>

                              <td className="px-4 py-4 text-sm font-semibold border-r-2 border-border">
                                {entry.subject_name ?? <i>No linked subject</i>}
                              </td>

                              <td className="px-4 py-4 text-sm border-r-2 border-border">
                                {formatTimestamp(entry.issued)}
                              </td>

                              <td className="px-4 py-4 text-sm font-medium border-r-2 border-border">
                                {formatTimestamp(entry.due)}
                              </td>

                              <td className="px-4 py-4 text-sm">
                                {entry.schoolworkType}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {completedEntries.length > 0 && ( // Table for completed entries
                <div>
                  <h3 className="text-xl font-semibold mb-3">Completed</h3>
                  <div style={{ overflowX: "auto", width: "100%" }}>
                    <div className="border border-border rounded-xl overflow-hidden">
                      <table
                        className="w-full border-collapse"
                        style={{ minWidth: "600px" }}
                      >
                        <thead>
                          <tr className="bg-muted border-b border-border">
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold w-12 border-r-2 border-border"
                              style={{ width: "5%" }}
                            ></th>
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                              style={{ width: "20%" }}
                            >
                              NAME
                            </th>
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                              style={{ width: "10%" }}
                            >
                              SUBJECT
                            </th>
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                              style={{ width: "18%" }}
                            >
                              ISSUED
                            </th>
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                              style={{ width: "18%" }}
                            >
                              DUE
                            </th>
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold"
                              style={{ width: "12%" }}
                            >
                              TYPE
                            </th>
                          </tr>
                        </thead>
                        <tbody className="font-medium">
                          {completedEntries.map((entry) => (
                            <tr
                              key={`${entry.id}-${entry.category}`}
                              onClick={() => setSelectedEntry(entry)}
                              className={`border-b-2 border-border cursor-pointer hover:opacity-80 ${
                                selectedEntry?.id === entry.id &&
                                selectedEntry?.category === entry.category
                                  ? "ring-4 ring-primary ring-inset rounded-lg"
                                  : ""
                              }`}
                            >
                              <td className="px-4 py-4 text-center hover:bg-gray-800 border-r-2 border-border">
                                <div className="w-full h-full flex items-center justify-center">
                                  <button
                                    title="Open"
                                    className="rounded text-lg font-semibold"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkIncomplete(
                                        entry.id,
                                        entry.category
                                      );
                                    }}
                                  >
                                    <SquareCheck />
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-sm font-semibold border-r-2 border-border">
                                {entry.name}
                              </td>

                              <td className="px-4 py-4 text-sm font-semibold border-r-2 border-border">
                                {entry.subject_name ?? <i>No linked subject</i>}
                              </td>

                              <td className="px-4 py-4 text-sm border-r-2 border-border">
                                {formatTimestamp(entry.issued)}
                              </td>

                              <td className="px-4 py-4 text-sm font-medium border-r-2 border-border">
                                {formatTimestamp(entry.due)}
                              </td>

                              <td className="px-4 py-4 text-sm">
                                {entry.schoolworkType}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-5 p-6 text-center text-gray-500">
              <p>
                There are currently no homeworks or tests linked to your
                account. If you believe this is an error, please contact support
                so we can assist you.
              </p>
              <Button className="mt-3" onClick={() => router.push("/support")}>
                Contact Support
              </Button>
            </div>
          )}
        </div>

        <div className="hidden md:block w-80">
          <SidebarContent />
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Schoolwork</SheetTitle>
            <SheetDescription>
              Add a new {entryType.toLowerCase()}
            </SheetDescription>
          </SheetHeader>
          <div className="py-3">
            <div className="py-2 flex flex-col gap-3 mb-2">
              <Label className="px-1" htmlFor="entryName">
                Name *
              </Label>
              <Input
                id="entryName"
                value={entryName}
                onChange={(e) => setEntryName(e.target.value)}
              />
            </div>
            <div className="py-2 flex flex-col gap-3 mb-2">
              <Label className="px-1" htmlFor="entryDescription">
                Description
              </Label>
              <Input
                id="entryDescription"
                value={entryDescription}
                onChange={(e) => setEntryDescription(e.target.value)}
              />
            </div>
            <div className="py-2 mb-2">
              <div className="flex gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="dueDatePicker" className="px-1">
                    Due date *
                  </Label>
                  <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        id="dueDatePicker"
                        className="w-32 justify-between font-normal"
                      >
                        {dueDate ? dueDate.toLocaleDateString() : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-auto max-w-fit">
                      <DialogHeader>
                        <DialogTitle>Select a due date</DialogTitle>
                      </DialogHeader>
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={(selectedDate) => {
                          setDueDate(selectedDate);
                          setCalendarOpen(false);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="issuedDatePicker" className="px-1">
                    Issued date
                  </Label>
                  <Dialog
                    open={issuedCalendarOpen}
                    onOpenChange={setIssuedCalendarOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        id="issuedDatePicker"
                        className="w-32 justify-between font-normal"
                      >
                        {issuedDate
                          ? issuedDate.toLocaleDateString()
                          : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-auto max-w-fit">
                      <DialogHeader>
                        <DialogTitle>Select issued date</DialogTitle>
                      </DialogHeader>
                      <Calendar
                        mode="single"
                        selected={issuedDate}
                        onSelect={(selectedDate) => {
                          setIssuedDate(selectedDate);
                          setIssuedCalendarOpen(false);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
            <div className="py-2 mb-2">
              <div className="flex gap-4">
                <div className="flex flex-col gap-3">
                  <Label className="px-1" htmlFor="entryType">
                    Type *
                  </Label>
                  <Select
                    value={entryType}
                    onValueChange={(value: "Homework" | "Test") =>
                      setEntryType(value)
                    }
                  >
                    <SelectTrigger id="entryType" className="w-32">
                      <SelectValue placeholder={entryType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Homework">Homework</SelectItem>
                      <SelectItem value="Test">Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-3">
                  <Label className="px-1" htmlFor="subject">
                    Subject
                  </Label>
                  <Select value={subjectID} onValueChange={setSubjectID}>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects && subjects.length > 0 ? (
                        subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-subjects" disabled>
                          No subjects available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button onClick={handleAddEntry}>
              Add {entryType.toLowerCase()}
            </Button>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

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
                Details about tests/homework and quick actions.
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
