"use client";

import React, { useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { AlarmClock, CalendarPlus, PanelBottomOpen } from "lucide-react";
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

interface SchoolworkPageProps {
  params: Promise<{
    classID: string;
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

  const { classID } = use(params);

  // Function to sort entries by index
  const sortEntriesByTopic = useCallback(
    (entries: SchoolworkEntry[]): SchoolworkEntry[] => {
      return entries.sort((a, b) => {
        const nameA = a.name;
        const nameB = b.name;

        // Check if the name starts with a number
        const isNumericA = /^\d/.test(nameA);
        const isNumericB = /^\d/.test(nameB);

        // Puts text-based names after numeric ones
        if (isNumericA && !isNumericB) return -1;
        if (!isNumericA && isNumericB) return 1;

        if (isNumericA && isNumericB) {
          // If both are numeric
          // Splits by dots and compares each section numerically
          const partsA = nameA.split(".").map((part: string) => {
            const num = parseInt(part);
            return isNaN(num) ? part : num;
          });
          const partsB = nameB.split(".").map((part: string) => {
            const num = parseInt(part);
            return isNaN(num) ? part : num;
          });

          for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
            const partA = partsA[i] ?? 0;
            const partB = partsB[i] ?? 0;

            if (typeof partA === "number" && typeof partB === "number") {
              // If both parts numbers
              if (partA !== partB) return partA - partB;
            } else {
              const comparison = String(partA).localeCompare(String(partB)); // If 1 part is a number and the other is text-based
              if (comparison !== 0) return comparison;
            }
          }
          return 0;
        }

        // Sorts alphabetically if both are text-based
        return nameA.localeCompare(nameB);
      });
    },
    []
  );

  const [schoolworkEntries, setSchoolworkEntries] = useState<
    SchoolworkEntry[] | null
  >(null);
  const [selectedEntry, setSelectedEntry] = useState<SchoolworkEntry | null>(
    null
  );
  const [className, setClassName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Sidebar content component
  const SidebarContent = () => {
    if (!selectedEntry) {
      return (
        <div className="space-y-4">
          <div className="flex gap-2 font-semibold">
            <Button className="flex-1" variant="default">
              <span className="mr-2">+</span>
              SET HOMEWORK
            </Button>
            <Button variant="default">
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
          <Button className="flex-1" variant="default">
            <span className="mr-2">+</span>
            SET HOMEWORK
          </Button>
          <Button variant="default">
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
              <p>Due: {selectedEntry.due}</p>
            </div>
            <div className="flex items-center gap-3">
              <CalendarPlus className="w-4 h-4" strokeWidth={2} />
              <p>Issued: {selectedEntry.issued}</p>
            </div>
            <div className="flex items-center gap-3">
              <CalendarPlus className="w-4 h-4" strokeWidth={2} />
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
            <Button variant="destructive" className="w-full">
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

            const schoolworkData = await schoolworkResponse.json() as APIResponse;
            setClassName(schoolworkData.className);
            const sortedEntries = sortEntriesByTopic(
              schoolworkData.schoolwork
            );
            setSchoolworkEntries(sortedEntries);
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
  }, [classID, router, sortEntriesByTopic]);

  if (loading) {
    return (
      <>
        <h2 className="text-3xl font-semibold mb-3">
          Schoolwork
        </h2>

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
            <div style={{ overflowX: "auto", width: "100%" }}>
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted border-b border-border">
                      <th className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border">
                        NAME
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border">
                        ISSUED
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border">
                        DUE
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border">
                        TYPE
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border">
                        COMPLETED
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-medium">
                    {schoolworkEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        className={`border-b-2 border-border cursor-pointer hover:opacity-80 ${
                          selectedEntry?.id === entry.id
                            ? "ring-4 ring-primary ring-inset rounded-lg"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-2 text-sm font-semibold border-r-2 border-border rounded-l-lg">
                          {entry.name}
                        </td>

                        <td className="px-4 py-2 text-sm border-r-2 border-border">
                          {entry.issued}
                        </td>

                        <td className="px-4 py-2 text-sm font-medium border-r-2 border-border">
                          {entry.due}
                        </td>

                        <td className="px-4 py-2 text-sm border-r-2 border-border">
                          {entry.schoolworkType}
                        </td>

                        <td className="px-4 py-2 text-sm border-r-2 border-border">
                          {entry.completed}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mt-5 p-6 text-center text-gray-500">
              <p>
                There are currently no homeworks or tests for this class. This
                may mean you&apos;ve entered an invalid class ID (check URL), but
                if not, please contact support so we can assist you.
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
