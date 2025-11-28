"use client";

import React, { useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  AlarmClock,
  CalendarPlus,
  PanelBottomOpen,
  UserRoundCheck,
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

interface SchoolworkPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SchoolworkPage({ params }: SchoolworkPageProps) {
  interface SchoolworkEntry {
    id: string;
    course_name: string | null;
    schoolworkType: "Homework" | "Test"; // Can be either "Homework" or "Test", restricts assigning any other value
    due: string;
    issued: string | null;
    name: string;
    description: string | null;
    completed: string | null;
  }

  const { id: classID } = use(params);

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

      const response = await fetch(
        "/api/teacher_schoolwork/add_schoolwork_entry",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            schoolwork_name: entryName.trim(),
            schoolwork_description: entryDescription.trim() || null,
            due: dueTimestamp,
            issued: issuedTimestamp,
            type: entryType,
            course_id: null, // To be implemented in the future
            class_id: classID,
          }),
        }
      );

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
      } else {
        console.error("Failed to add schoolwork entry:", response.statusText);
        toast.error("Failed to add schoolwork entry. Please try again later.");
      }
    } catch (error) {
      console.error("Error adding schoolwork entry:", error);
      toast.error("Error adding schoolwork entry. Please try again later.");
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

  // Split entries into future/today and past
  const categoriseEntry = React.useCallback(
    (entry: SchoolworkEntry): "future" | "past" => {
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
          setPastEntries((previous) => [...previous, entry]);
          break;
        default:
          console.log("Entry categorisation error", category);
          break;
      }
    },
    []
  );

  const [schoolworkEntries, setSchoolworkEntries] = useState<
    SchoolworkEntry[] | null
  >(null);
  const [futureEntries, setFutureEntries] = useState<SchoolworkEntry[]>([]);
  const [pastEntries, setPastEntries] = useState<SchoolworkEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<SchoolworkEntry | null>(
    null
  );
  const [className, setClassName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [entryName, setEntryName] = useState("");
  const [entryDescription, setEntryDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [issuedDate, setIssuedDate] = useState<Date | undefined>(undefined);
  const [entryType, setEntryType] = useState<"Homework" | "Test">("Homework");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [issuedCalendarOpen, setIssuedCalendarOpen] = useState(false);
  const router = useRouter();

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
              SET HOMEWORK
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setEntryType("Test");
                setSheetOpen(true);
              }}
            >
              <span className="mr-2">+</span>
              SET TEST
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
            SET HOMEWORK
          </Button>
          <Button
            variant="default"
            onClick={() => {
              setEntryType("Test");
              setSheetOpen(true);
            }}
          >
            <span className="mr-2">+</span>
            SET TEST
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">{selectedEntry.name}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
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
            </div>
            <div className="flex items-center gap-3">
              <AlarmClock className="w-4 h-4" strokeWidth={2} />
              <p>Due: {formatTimestamp(selectedEntry.due)}</p>
            </div>
            <div className="flex items-center gap-3">
              <CalendarPlus className="w-4 h-4" strokeWidth={2} />
              <p>Issued: {formatTimestamp(selectedEntry.issued)}</p>
            </div>
            <div className="flex items-center gap-3">
              <UserRoundCheck className="w-4 h-4" strokeWidth={2} />
              <p>Completed: {selectedEntry.completed}</p>
            </div>
            {selectedEntry.description && (
              <p className="text-muted-foreground text-xs italic">
                {selectedEntry.description}
              </p>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <Button className="w-full">Edit</Button>
            <Button className="w-full bg-[#F8921A] hover:bg-[#DF8319]">
              View student submissions
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={async () => {
                try {
                  const response = await fetch(
                    "/api/teacher_schoolwork/delete_schoolwork_entry",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        entryID: selectedEntry.id,
                        classID: classID,
                      }),
                    }
                  );

                  if (response.ok) {
                    toast.success("Schoolwork entry deleted.");
                    // Refreshes both entry lists and UI to ensure consistency before and after the transaction
                    setSchoolworkEntries((previous) =>
                      previous
                        ? previous.filter((swk) => swk.id !== selectedEntry.id)
                        : null
                    );
                    setFutureEntries((previous) =>
                      previous.filter((swk) => swk.id !== selectedEntry.id)
                    );
                    setPastEntries((previous) =>
                      previous.filter((swk) => swk.id !== selectedEntry.id)
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

          // Check if user is a student (since this is a teacher-only page)
          if (userData.role === "Student") {
            router.push("/dashboard");
            return;
          }

          // Gets schoolwork entries and class name by classID
          const schoolworkResponse = await fetch(
            `/api/teacher_schoolwork/get_schoolwork_data?classID=${encodeURIComponent(
              classID
            )}`
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
              className: string;
              schoolwork: SchoolworkEntry[];
            };

            const schoolworkData =
              (await schoolworkResponse.json()) as APIResponse;
            setClassName(schoolworkData.className);
            const sortedEntries = sortEntriesByDueDate(
              schoolworkData.schoolwork
            );
            setSchoolworkEntries(sortedEntries);

            const now = new Date();
            now.setHours(0, 0, 0, 0); // Start of today

            const future: SchoolworkEntry[] = [];
            const past: SchoolworkEntry[] = [];

            sortedEntries.forEach((entry) => {
              const dueDate = new Date(entry.due);
              dueDate.setHours(0, 0, 0, 0);

              if (dueDate >= now) {
                future.push(entry);
              } else {
                past.push(entry);
              }
            });

            setFutureEntries(future);
            setPastEntries(past);
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
  }, [classID, router, sortEntriesByDueDate]);

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
            Schoolwork for {className}
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
                              className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                              style={{ width: "30%" }}
                            >
                              NAME
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
                              className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                              style={{ width: "12%" }}
                            >
                              TYPE
                            </th>
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                              style={{ width: "5%" }}
                            >
                              COMPLETED
                            </th>
                          </tr>
                        </thead>
                        <tbody className="font-medium">
                          {futureEntries.map((entry) => (
                            <tr
                              key={entry.id}
                              onClick={() => setSelectedEntry(entry)}
                              className={`border-b-2 border-border cursor-pointer hover:opacity-80 ${
                                selectedEntry?.id === entry.id
                                  ? "ring-4 ring-primary ring-inset rounded-lg"
                                  : ""
                              }`}
                            >
                              <td className="px-4 py-4 text-sm font-semibold border-r-2 border-border rounded-l-lg">
                                {entry.name}
                              </td>

                              <td className="px-4 py-4 text-sm border-r-2 border-border">
                                {formatTimestamp(entry.issued)}
                              </td>

                              <td className="px-4 py-4 text-sm font-medium border-r-2 border-border">
                                {formatTimestamp(entry.due)}
                              </td>

                              <td className="px-4 py-4 text-sm border-r-2 border-border">
                                {entry.schoolworkType}
                              </td>

                              <td className="px-4 py-4 text-sm border-r-2 border-border">
                                {entry.completed}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {pastEntries.length > 0 && ( // Table for past entries
                <div>
                  <h3 className="text-xl font-semibold mb-3">Past Due</h3>
                  <div style={{ overflowX: "auto", width: "100%" }}>
                    <div className="border border-border rounded-xl overflow-hidden">
                      <table
                        className="w-full border-collapse"
                        style={{ minWidth: "600px" }}
                      >
                        <thead>
                          <tr className="bg-muted border-b border-border">
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                              style={{ width: "30%" }}
                            >
                              NAME
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
                              className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                              style={{ width: "12%" }}
                            >
                              TYPE
                            </th>
                            <th
                              className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                              style={{ width: "5%" }}
                            >
                              COMPLETED
                            </th>
                          </tr>
                        </thead>
                        <tbody className="font-medium">
                          {pastEntries.map((entry) => (
                            <tr
                              key={entry.id}
                              onClick={() => setSelectedEntry(entry)}
                              className={`border-b-2 border-border cursor-pointer hover:opacity-80 ${
                                selectedEntry?.id === entry.id
                                  ? "ring-4 ring-primary ring-inset rounded-lg"
                                  : ""
                              }`}
                            >
                              <td className="px-4 py-4 text-sm font-semibold border-r-2 border-border rounded-l-lg">
                                {entry.name}
                              </td>

                              <td className="px-4 py-4 text-sm border-r-2 border-border">
                                {formatTimestamp(entry.issued)}
                              </td>

                              <td className="px-4 py-4 text-sm font-medium border-r-2 border-border">
                                {formatTimestamp(entry.due)}
                              </td>

                              <td className="px-4 py-4 text-sm border-r-2 border-border">
                                {entry.schoolworkType}
                              </td>

                              <td className="px-4 py-4 text-sm border-r-2 border-border">
                                {entry.completed}
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
                There are currently no homeworks or tests for this class. This
                may mean you&apos;ve entered an invalid class ID (check URL),
                but if not, please contact support so we can assist you.
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
              Add a new {entryType.toLowerCase()} for {className}
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
            <div className="py-2 flex flex-col gap-3 mb-2">
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
