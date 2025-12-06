"use client";

import React, { use, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check, Crosshair, Newspaper, PanelBottomOpen } from "lucide-react";
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

interface SpecificationPageProps {
  params: Promise<{
    qualification: string;
    subject: string;
    examBoard: string;
  }>;
}

export default function SpecificationPage({ params }: SpecificationPageProps) {
  interface SpecificationEntry {
    id: string;
    topic: string;
    topic_name: string;
    description: string | null;
    paper: string;
    common: boolean;
    difficult: boolean;
    confidence: number;
    sessions: number;
  }

  // Function to sort entries by index
  const sortEntriesByTopic = useCallback(
    (entries: SpecificationEntry[]): SpecificationEntry[] => {
      return entries.sort((a, b) => {
        const indexA = a.topic;
        const indexB = b.topic;

        // Check if the index starts with a number
        const isNumericA = /^\d/.test(indexA);
        const isNumericB = /^\d/.test(indexB);

        // Puts text-based indexes after numeric ones
        if (isNumericA && !isNumericB) return -1;
        if (!isNumericA && isNumericB) return 1;

        if (isNumericA && isNumericB) {
          // If both are numeric
          // Splits by dots and compares each section numerically
          const partsA = indexA.split(".").map((part: string) => {
            const num = parseInt(part);
            return isNaN(num) ? part : num;
          });
          const partsB = indexB.split(".").map((part: string) => {
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
        return indexA.localeCompare(indexB);
      });
    },
    []
  );

  const [specificationEntries, setSpecificationEntries] = useState<
    SpecificationEntry[] | null
  >(null);
  const [selectedEntry, setSelectedEntry] = useState<SpecificationEntry | null>(
    null
  );
  const [sortType, setSortType] = useState<string>("Topic");
  const [filterType, setFilterType] = useState<string>("None");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const resolvedParams = use(params);
  const qualification = resolvedParams.qualification;
  let subject = resolvedParams.subject;
  let examBoard = resolvedParams.examBoard;

  subject = subject
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase()); // Converts subject to sentence case and adds a space if required

  if (examBoard[0] !== "e") {
    examBoard = examBoard.toUpperCase();
  } // Capitalises exam boards that are normally capitalised (all others begin with "E")


  // Sidebar content component
  const SidebarContent = () => {
    if (!selectedEntry) {
      return (
        <div className="space-y-4">
          <div className="flex gap-2 font-semibold">
            <Button
              className="flex-1"
              onClick={() =>
                router.push(
                  `/resources/${qualification}/` +
                    subject.replace(/ /g, "-").toLowerCase() +
                    "/" +
                    examBoard.toLowerCase()
                )
              }
            >
              RESOURCES
            </Button>
            <Button
              className="flex-1"
              onClick={() =>
                router.push(
                  `/past-papers/${qualification}/` +
                    subject.replace(/ /g, "-").toLowerCase() +
                    "/" +
                    examBoard.toLowerCase()
                )
              }
            >
              PAST PAPERS
            </Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 text-center py-12">
            <p className="text-muted-foreground">
              Select an entry to view details.
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

    return (
      <div className="space-y-4">
        <div className="flex gap-2 font-semibold">
          <Button
            className="flex-1"
            onClick={() =>
              router.push(
                `/resources/${qualification}/` +
                  subject.replace(/ /g, "-").toLowerCase() +
                  "/" +
                  examBoard.toLowerCase()
              )
            }
          >
            RESOURCES
          </Button>
          <Button
            className="flex-1"
            onClick={() =>
              router.push(
                `/past-papers/${qualification}/` +
                  subject.replace(/ /g, "-").toLowerCase() +
                  "/" +
                  examBoard.toLowerCase()
              )
            }
          >
            PAST PAPERS
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">
            {selectedEntry.topic_name}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              {selectedEntry.common === true && (
                <Badge
                  backgroundColour="rgba(59, 130, 246, 0.2)"
                  textColour="#3B82F6"
                  className="w-auto px-3 py-1"
                >
                  Common topic
                </Badge>
              )}
              {selectedEntry.difficult === true && (
                <Badge
                  backgroundColour="rgba(239, 68, 68, 0.2)"
                  textColour="#F87171"
                  className="w-auto px-3 py-1"
                >
                  Difficult topic
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Crosshair className="w-4 h-4" strokeWidth={2} />
              <p>Section {selectedEntry.topic}</p>
            </div>
            <div className="flex items-center gap-3">
              <Newspaper className="w-4 h-4" strokeWidth={2} />
              <p>Paper {selectedEntry.paper}</p>
            </div>
            {selectedEntry.description && (
              <p className="text-muted-foreground text-xs italic">
                {selectedEntry.description}
              </p>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <Button
              className="w-full"
              onClick={() =>
                router.push(
                  `/resources/${qualification}/` +
                    subject.replace(/ /g, "-").toLowerCase() +
                    "/" +
                    examBoard.toLowerCase()
                )
              }
            >
              View Resources
            </Button>
            <Button className="w-full bg-[#F8921A] hover:bg-[#DF8319]">
              Add Note
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                const emailSubject = encodeURIComponent(
                  "Issue with Specification Page Entry for " + qualification + " " +
                    subject +
                    " (" +
                    examBoard +
                    ")"
                );
                const emailBody = encodeURIComponent(`Dear Pack Support,

      I believe there is an issue on the specification page for:
      - Qualification: ${qualification}
      - Subject: ${subject}
      - Exam Board: ${examBoard}
      - Specification Entry: ${selectedEntry.topic} - ${selectedEntry.topic_name}

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

  const updateSubjectLink = React.useCallback(
    async (entryID: string, type: string, detail?: number) => {
      if (
        type === "confidence" &&
        detail ===
          specificationEntries?.find((e) => e.id === entryID)?.confidence
      ) {
        // Checks whether there is a change in confidence level to prevent unnecessary API calls
        console.log("No change in confidence level detected.");
        return;
      }

      try {
        const res = await fetch("/api/specifications/edit_subject_link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qualification: qualification,
            courseName: subject,
            examBoard: examBoard,
            entryID: entryID,
            type: type,
            detail: detail || 0,
          }),
        });

        if (!res.ok) {
          toast.error(`Failed to update ${type}.`);
          const errorData = await res.json();
          console.error("Subject link saving error:", errorData.message);
        } else {
          toast.success(
            `${type.charAt(0).toUpperCase() + type.slice(1)} updated.`
          );

          // Updates UI accordingly
          if (type === "sessions") {
            setSpecificationEntries((prevEntries) =>
              prevEntries
                ? prevEntries.map((entry) =>
                    entry.id === entryID
                      ? { ...entry, sessions: entry.sessions + 1 }
                      : entry
                  )
                : null
            );

            setSelectedEntry((prevSelected) =>
              prevSelected?.id === entryID
                ? { ...prevSelected, sessions: prevSelected.sessions + 1 }
                : prevSelected
            );
          } else if (type === "confidence" && detail !== undefined) {
            setSpecificationEntries((prevEntries) =>
              prevEntries
                ? prevEntries.map((entry) =>
                    entry.id === entryID
                      ? { ...entry, confidence: detail }
                      : entry
                  )
                : null
            );
            setSelectedEntry((prevSelected) =>
              prevSelected?.id === entryID
                ? { ...prevSelected, confidence: detail }
                : prevSelected
            );
          }
        }
      } catch (error) {
        console.error("Subject link saving error (2):", error);
        toast.error(`Failed to save ${type}.`);
      }
    },
    [examBoard, qualification, subject, specificationEntries]
  );

  React.useEffect(() => {
    const fetchSpecificationData = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const userData = await response.json();

          // Check if user is a teacher (since this is a student-only page)
          if (userData.role === "Teacher") {
            router.push("/dashboard");
            return;
          }

          // Gets specification entries and the user's personal confidence/session data by subject and exam board
          const specificationResponse = await fetch(
            `/api/specifications/get_specification_data?qualification=${encodeURIComponent(qualification)}&subject=${encodeURIComponent(
              subject
            )}&examBoard=${encodeURIComponent(examBoard)}`
          );

          if (!specificationResponse.ok) {
            console.error(
              "Error getting specification entries:",
              specificationResponse.statusText
            );
            toast.error("Error getting specification. Please try again later.");
            setSpecificationEntries(null);
          } else {
            const specificationData = await specificationResponse.json();
            const sortedEntries = sortEntriesByTopic(
              specificationData.specificationEntries
            );
            setSpecificationEntries(sortedEntries);
          }
        } else {
          // User not logged in
          console.log("No user logged in.");
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Error getting user or specification entries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecificationData();
  }, [qualification, subject, examBoard, router, sortEntriesByTopic]);

  if (loading) {
    return (
      <>
        <h2 className="text-3xl font-semibold mb-3">
          {subject} Specification ({examBoard})
        </h2>

        <h2 className="mt-6 mb-3 text-sm">
          <Spinner className="inline mr-2" />
          <i>Loading specification...</i>
        </h2>
      </>
    );
  }

  return (
    <>
      <div className="flex gap-6 pb-24 xl:pb-0">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 break-words">
            {subject} Specification ({examBoard})
          </h2>

          <div className="flex flex-col xl:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search specification..."
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
                    <SelectValue placeholder="Topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Topic">Topic</SelectItem>
                    <SelectItem value="Paper">Paper</SelectItem>
                    <SelectItem value="Sessions">Sessions</SelectItem>
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
                    <SelectItem value="Low confidence">
                      Confidence - low
                    </SelectItem>
                    <SelectItem value="Medium confidence">
                      Confidence - medium
                    </SelectItem>
                    <SelectItem value="High confidence">
                      Confidence - high
                    </SelectItem>
                    <SelectItem value="Rarity">Common topics</SelectItem>
                    <SelectItem value="Difficulty">Difficult topics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {specificationEntries && specificationEntries.length > 0 ? (
            <div style={{ overflowX: "auto", width: "100%" }}>
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted border-b border-border">
                      <th className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border">
                        INDEX
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border">
                        TOPIC
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border">
                        PAPER
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border">
                        CONFIDENCE
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">
                        SESSIONS
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="font-medium">
                    {specificationEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        className={`border-b-2 border-border cursor-pointer hover:opacity-80 ${
                          selectedEntry?.id === entry.id
                            ? "ring-4 ring-primary ring-inset rounded-lg"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-2 text-sm font-medium border-r-2 border-border rounded-l-lg">
                          {entry.topic}
                        </td>

                        <td className="px-4 py-2 text-sm border-r-2 border-border font-semibold">
                          {entry.topic_name}
                        </td>

                        <td className="px-4 py-2 text-sm border-r-2 border-border">
                          Paper {entry.paper}
                        </td>

                        <td className="px-4 py-2 border-r-2 border-border">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateSubjectLink(entry.id, "confidence", 1);
                              }}
                              className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                                entry.confidence === 1
                                  ? "bg-red-600 border-red-700"
                                  : "bg-slate-100 border-red-400"
                              }`}
                            >
                              {entry.confidence === 1 && (
                                <Check
                                  className="w-3 h-3 text-white"
                                  strokeWidth={3}
                                />
                              )}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateSubjectLink(entry.id, "confidence", 2);
                              }}
                              className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                                entry.confidence === 2
                                  ? "bg-yellow-500 border-yellow-600"
                                  : "bg-slate-100 border-yellow-400"
                              }`}
                            >
                              {entry.confidence === 2 && (
                                <Check
                                  className="w-3 h-3 text-white"
                                  strokeWidth={3}
                                />
                              )}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateSubjectLink(entry.id, "confidence", 3);
                              }}
                              className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                                entry.confidence === 3
                                  ? "bg-green-600 border-green-700"
                                  : "bg-slate-100 border-green-400"
                              }`}
                            >
                              {entry.confidence === 3 && (
                                <Check
                                  className="w-3 h-3 text-white"
                                  strokeWidth={3}
                                />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="px-4 py-2 text-sm font-bold border-r-2 border-border">
                          {entry.sessions ? "|".repeat(entry.sessions) : "-"}
                        </td>

                        <td className="px-2 py-2 text-center hover:bg-gray-800">
                          <div className="w-full h-full flex items-center justify-center">
                            <button
                              className="rounded text-lg font-semibold"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateSubjectLink(entry.id, "sessions");
                              }}
                            >
                              +
                            </button>
                          </div>
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
                There are currently no entries for this subject. This may mean
                your subject is unsupported or you&apos;ve entered an invalid
                qualification/course/exam board combination (check spelling above) - if this is not the case, please
                contact support so we can add content from your exam board.
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
