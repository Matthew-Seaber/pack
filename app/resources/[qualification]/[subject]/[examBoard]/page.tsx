"use client";

import React, { use, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Crosshair,
  Download,
  Newspaper,
  PanelBottomOpen,
  Shapes,
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

interface ResourcesPageProps {
  params: Promise<{
    qualification: string;
    subject: string;
    examBoard: string;
  }>;
}

export default function ResourcesPage({ params }: ResourcesPageProps) {
  interface ResourceEntry {
    id: string;
    resource_name: string;
    resource_description: string | null;
    location: string;
    topic: string | null;
    paper: string | null;
    uploaded_at: string;
    type: string;
    creator: string;
    commonTopic: boolean;
    difficultTopic: boolean;
  }

  const [resourceEntries, setResourceEntries] = useState<
    ResourceEntry[] | null
  >(null);
  const [selectedEntry, setSelectedEntry] = useState<ResourceEntry | null>(
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

  // Function to convert a given timestamp to a UX-friendly format
  const formatTimestamp = (timestamp: string | null, type: number): string => {
    if (!timestamp) return "No date";

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "ERROR";

    if (type === 1) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year.toString().slice(-2)}`;
    } else if (type === 2) {
      // Relative format (e.g. 3 days ago) so students can quickly compare the age of different resources
      const now = new Date();
      const msDifference = now.getTime() - date.getTime();
      if (msDifference <= 0) return "ERROR";

      const seconds = Math.floor(msDifference / 1000);
      if (seconds < 60) return "a few seconds ago";

      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const weeks = Math.floor(days / 7);
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);

      const format = (value: number, unit: string) =>
        `${value} ${unit}${value !== 1 ? "s" : ""} ago`;

      if (minutes < 60) return format(minutes, "minute");
      if (hours < 24) return format(hours, "hour");
      if (days < 7) return format(days, "day");
      if (weeks < 5) return format(weeks, "week");
      if (months < 12) return format(months, "month");
      return format(years, "year");
    } else {
      const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };

      return date.toLocaleString(undefined, options);
    }
  };

  // Function to sort entries by index
  const sortEntriesByTopic = useCallback(
    (entries: ResourceEntry[]): ResourceEntry[] => {
      return entries.sort((a, b) => {
        const indexA = a.topic;
        const indexB = b.topic;

        // Move topics to the end if their value is null
        if (indexA === null && indexB === null) return 0;
        if (indexA === null) return 1;
        if (indexB === null) return -1;

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

  const downloadFile = async (entryID: string) => {
    try {
      toast.info("Preparing download...");

      const downloadResponse = await fetch(
        `/api/resources/download_file?entryID=${encodeURIComponent(entryID)}`
      );

      if (!downloadResponse.ok) {
        console.error("Error downloading file:", downloadResponse.statusText);
        toast.error("Error downloading file. Please try again later.");
        return;
      }

      const blob = await downloadResponse.blob(); // Gets the raw binary data (BLOB = Binary Large Object)

      const entry = resourceEntries?.find((item) => item.id === entryID);

      const filename = entry
        ? `${entry.resource_name.toLowerCase().replace(/\s+/g, "-")}.zip`
        : "resource.zip"; // e.g. "fde-cycle-song.zip" so it's easily identifiable what each ZIP is in the file explorer

      const url = window.URL.createObjectURL(blob);
      const downloadObject = document.createElement("a");
      downloadObject.href = url;
      downloadObject.download = filename;
      document.body.appendChild(downloadObject);
      downloadObject.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(downloadObject);

      toast.success("Download complete!");

      try {
        const res = await fetch("/api/user_stats/save_stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dataToChange: "resources_downloaded",
            extraInfo: null,
          }),
        });

        if (!res.ok) {
          toast.error("Failed to save resource stats to profile.");
          const errorData = await res.json();
          console.error("Stats saving error:", errorData.message);
        }
      } catch (error) {
        console.error("Error saving resource stats:", error);
        toast.error("Error saving resource stats. Please try again later.");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Error downloading file. Please try again later.");
    }
  };

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
                  `/specification/${qualification}/` +
                    subject.replace(/ /g, "-").toLowerCase() +
                    "/" +
                    examBoard.toLowerCase()
                )
              }
            >
              SPECIFICATION
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
                `/specification/${qualification}/` +
                  subject.replace(/ /g, "-").toLowerCase() +
                  "/" +
                  examBoard.toLowerCase()
              )
            }
          >
            SPECIFICATION
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
            {selectedEntry.resource_name}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              {selectedEntry.commonTopic && (
                <Badge
                  backgroundColour="rgba(59, 130, 246, 0.2)"
                  textColour="#3B82F6"
                  className="w-auto px-3 py-1"
                >
                  Common topic
                </Badge>
              )}
              {selectedEntry.difficultTopic && (
                <Badge
                  backgroundColour="rgba(239, 68, 68, 0.2)"
                  textColour="#EF4444"
                  className="w-auto px-3 py-1"
                >
                  Difficult topic
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Crosshair className="w-4 h-4" strokeWidth={2} />
              <p>Section: {selectedEntry.topic}</p>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4" strokeWidth={2} />
              <p>Uploaded: {formatTimestamp(selectedEntry.uploaded_at, 1)}</p>
            </div>
            <div className="flex items-center gap-3">
              <Shapes className="w-4 h-4" strokeWidth={2} />
              <p>Type: {selectedEntry.type}</p>
            </div>
            <div className="flex items-center gap-3">
              <Newspaper className="w-4 h-4" strokeWidth={2} />
              <p>Paper {selectedEntry.paper}</p>
            </div>
            {selectedEntry.resource_description && (
              <p className="text-muted-foreground text-xs italic">
                {selectedEntry.resource_description}
              </p>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <Button
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                downloadFile(selectedEntry.id);
              }}
            >
              Download File
            </Button>
            <Button className="w-full bg-[#F8921A] hover:bg-[#DF8319]">
              Add Note
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                const emailSubject = encodeURIComponent(
                  "Issue with Resource Entry for " +
                    qualification +
                    " " +
                    subject +
                    " (" +
                    examBoard +
                    ")"
                );
                const emailBody = encodeURIComponent(`Dear Pack Support,

      I believe there is an issue on the resource page for:
      - Qualification: ${qualification}
      - Subject: ${subject}
      - Exam Board: ${examBoard}
      - Resource Entry: ${selectedEntry.topic} - ${selectedEntry.resource_name}
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

  React.useEffect(() => {
    const fetchResourceData = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const userData = await response.json();

          // Check if user is a teacher (since this is a student-only page)
          if (userData.role === "Teacher") {
            router.push("/dashboard");
            return;
          }

          // Gets past paper entries and their files' locations
          const resourceResponse = await fetch(
            `/api/resources/get_resource_data?qualification=${encodeURIComponent(
              qualification
            )}&subject=${encodeURIComponent(
              subject
            )}&examBoard=${encodeURIComponent(examBoard)}`
          );

          if (!resourceResponse.ok) {
            console.error(
              "Error getting resource entries:",
              resourceResponse.statusText
            );
            toast.error("Error getting resource data. Please try again later.");
            setResourceEntries(null);
          } else {
            const resourceData = await resourceResponse.json();
            const sortedEntries = sortEntriesByTopic(
              resourceData.resourceEntries
            );
            setResourceEntries(sortedEntries);
          }
        } else {
          // User not logged in
          console.log("No user logged in.");
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Error getting user or resource entries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResourceData();
  }, [qualification, subject, examBoard, router, sortEntriesByTopic]);

  if (loading) {
    return (
      <>
        <h2 className="text-3xl font-semibold mb-3">
          {subject} Resources ({examBoard})
        </h2>

        <h2 className="mt-6 mb-3 text-sm">
          <Spinner className="inline mr-2" />
          <i>Loading resources...</i>
        </h2>
      </>
    );
  }

  return (
    <>
      <div className="flex gap-6 pb-24 xl:pb-0">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 break-words">
            {subject} Resources ({examBoard})
          </h2>

          <div className="flex flex-col xl:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search resources..."
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
                    <SelectItem value="Uploaded">Uploaded</SelectItem>
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
                    <SelectItem value="Rarity">Common topics</SelectItem>
                    <SelectItem value="Difficulty">Difficult topics</SelectItem>
                    <SelectItem value="Creator: Pack">Creator: Pack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {resourceEntries && resourceEntries.length > 0 ? (
            <div style={{ overflowX: "auto", width: "100%" }}>
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted border-b border-border">
                      <th
                        className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                        style={{ width: "10%" }}
                      >
                        INDEX
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                        style={{ width: "30%" }}
                      >
                        NAME
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                        style={{ width: "15%" }}
                      >
                        TYPE
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                        style={{ width: "10%" }}
                      >
                        PAPER
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                        style={{ width: "15%" }}
                      >
                        CREATOR
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border"
                        style={{ width: "15%" }}
                      >
                        UPLOADED
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-semibold w-12"
                        style={{ width: "5%" }}
                      ></th>
                    </tr>
                  </thead>
                  <tbody className="font-medium">
                    {resourceEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        className={`border-b-2 border-border cursor-pointer hover:opacity-80 ${
                          selectedEntry?.id === entry.id
                            ? "ring-4 ring-primary ring-inset rounded-lg"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-2 text-sm font-medium border-r-2 border-border">
                          {entry.topic}
                        </td>

                        <td className="px-4 py-2 text-sm font-medium border-r-2 border-border">
                          {entry.resource_name}
                        </td>

                        <td className="px-4 py-2 text-sm font-medium border-r-2 border-border">
                          {entry.type}
                        </td>

                        <td className="px-4 py-2 text-sm font-medium border-r-2 border-border">
                          Paper {entry.paper}
                        </td>

                        <td className="px-4 py-2 text-sm font-medium border-r-2 border-border">
                          {entry.creator}
                        </td>

                        <td
                          className="px-4 py-2 text-sm font-medium border-r-2 border-border"
                          title={formatTimestamp(entry.uploaded_at, 0)}
                        >
                          {" "}
                          {/* Reveals long date on hover */}
                          {formatTimestamp(entry.uploaded_at, 2)}{" "}
                          {/* Relative format */}
                        </td>

                        <td className="p-4 text-center hover:bg-gray-800">
                          <div className="w-full h-full flex items-center justify-center">
                            <button
                              title="Download"
                              className="rounded text-lg font-semibold"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadFile(entry.id);
                              }}
                            >
                              <Download />
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
                There are currently no resources for this subject. This may mean
                your subject is unsupported or you&apos;ve entered an invalid
                qualification/course/exam board combination (check spelling
                above) - if this is not the case, please contact support so we
                can add content from your exam board.
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
