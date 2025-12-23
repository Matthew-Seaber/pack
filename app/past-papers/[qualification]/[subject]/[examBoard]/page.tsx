"use client";

import React, { use, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Crosshair,
  Download,
  FolderOpen,
  PanelBottomOpen,
  SquareArrowOutUpRight,
  X,
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

interface PastPaperPageProps {
  params: Promise<{
    qualification: string;
    subject: string;
    examBoard: string;
  }>;
}

export default function PastPaperPage({ params }: PastPaperPageProps) {
  interface PastPaperEntry {
    id: string;
    resource_name: string;
    series: string;
    files: number;
    question_paper_location: string;
    mark_scheme_location: string | null;
    model_answers_location: string | null;
    insert_location: string | null;
  }

  const [pastPaperEntries, setPastPaperEntries] = useState<
    PastPaperEntry[] | null
  >(null);
  const [selectedEntry, setSelectedEntry] = useState<PastPaperEntry | null>(
    null
  );
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

  // Function to sort entries by series and resource name
  const sortEntriesBySeries = useCallback(
    (entries: PastPaperEntry[]): PastPaperEntry[] => {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const isDateBased = (series: string) =>
        months.some((month) => series.startsWith(month));
      const getPaperNumber = (resource_name: string) => {
        const match = resource_name.match(/Paper (\d+)/); // Extracts paper value if applicable for later sorting
        return match ? parseInt(match[1]) : 0; // Returns 0 if no paper number linked to entry
      };

      return [...entries].sort((a, b) => {
        // Due to .sort(), if the statements below return negative, the first number comes first in the final array and vice versa
        const aIsDate = isDateBased(a.series);
        const bIsDate = isDateBased(b.series);

        // Separates date-based and text-based series
        if (aIsDate !== bIsDate) {
          return aIsDate ? -1 : 1; // Makes date-based series appear before text-based series
        }

        if (aIsDate && bIsDate) {
          // Splits series into month and year parts
          const [aMonth, aYear] = a.series.split(" ");
          const [bMonth, bYear] = b.series.split(" ");

          // Converts the month's placement in the year to an integer for sorting
          const aMonthIndex = months.indexOf(aMonth);
          const bMonthIndex = months.indexOf(bMonth);

          // Sorts by year and then month
          if (aYear !== bYear) {
            return parseInt(bYear) - parseInt(aYear); // bYear is first because years should be sorted in descending order
          }
          if (aMonthIndex !== bMonthIndex) {
            return bMonthIndex - aMonthIndex; // bMonthIndex is first because months should be sorted in descending order
          }
        } else {
          // Both have text-based series
          if (a.series !== b.series) {
            return a.series.localeCompare(b.series); // Sorts alphabetically
          }
        }

        // Same series and therefore sorts by paper number
        return (
          getPaperNumber(a.resource_name) - getPaperNumber(b.resource_name) // Sorts by paper number (lowest first)
        );
      });
    },
    []
  );

  const downloadZIP = async (entryID: string) => {
    try {
      toast.info("Preparing download...");

      const downloadResponse = await fetch(
        `/api/past_papers/download_zip?entryID=${encodeURIComponent(entryID)}`
      );

      if (!downloadResponse.ok) {
        console.error("Error downloading ZIP:", downloadResponse.statusText);
        toast.error("Error downloading files. Please try again later.");
        return;
      }

      const blob = await downloadResponse.blob(); // Gets the raw binary data (BLOB = Binary Large Object)

      const entry = pastPaperEntries?.find((item) => item.id === entryID);
      const words = subject.toLowerCase().split(" "); // Same logic reused from sign up page
      let prefix = "";
      if (words.length >= 2) {
        prefix = words[0][0] + words[1][0];
      } else {
        prefix = subject.slice(0, 2);
      }

      const filename = entry
        ? `${prefix}-${entry.series
            .toLowerCase()
            .replace(/\s+/g, "-")}-${entry.resource_name
            .toLowerCase()
            .replace(/\s+/g, "-")}.zip`
        : "past-papers.zip"; // e.g. "cs-june-2022-paper-2.zip" so it's easily identifiable what each ZIP is in the file explorer

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
            dataToChange: "past_papers_downloaded_opened",
            extraInfo: null,
          }),
        });

        if (!res.ok) {
          toast.error("Failed to save past paper stats to profile.");
          const errorData = await res.json();
          console.error("Stats saving error:", errorData.message);
        }
      } catch (error) {
        console.error("Error saving past paper stats:", error);
        toast.error("Error saving past paper stats. Please try again later.");
      }
    } catch (error) {
      console.error("Error downloading ZIP:", error);
      toast.error("Error downloading files. Please try again later.");
    }
  };

  const openFiles = async (entryID: string) => {
    toast.info("Opening files...");

    window.open(
      `/past-papers/view/${entryID}/`,
      "_blank",
      "noopener,noreferrer"
    ); // Opens in new tab
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
                  `/resources/${qualification}/` +
                    subject.replace(/ /g, "-").toLowerCase() +
                    "/" +
                    examBoard.toLowerCase()
                )
              }
            >
              RESOURCES
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
                `/resources/${qualification}/` +
                  subject.replace(/ /g, "-").toLowerCase() +
                  "/" +
                  examBoard.toLowerCase()
              )
            }
          >
            RESOURCES
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">
            {selectedEntry.resource_name} - {selectedEntry.series}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <Badge
                backgroundColour={
                  selectedEntry.mark_scheme_location !== null
                    ? "rgba(34, 197, 94, 0.2)"
                    : "rgba(239, 68, 68, 0.2)"
                }
                textColour={
                  selectedEntry.mark_scheme_location !== null
                    ? "#22C55E"
                    : "#EF4444"
                }
                className="w-auto px-3 py-1 flex items-center gap-1"
              >
                {selectedEntry.mark_scheme_location !== null ? (
                  <Check className="w-4 h-4 mr-1" />
                ) : (
                  <X className="w-4 h-4 mr-1" />
                )}
                <span>Mark scheme</span>
              </Badge>
              <Badge
                backgroundColour={
                  selectedEntry.model_answers_location !== null
                    ? "rgba(34, 197, 94, 0.2)"
                    : "rgba(239, 68, 68, 0.2)"
                }
                textColour={
                  selectedEntry.model_answers_location !== null
                    ? "#22C55E"
                    : "#EF4444"
                }
                className="w-auto px-3 py-1 flex items-center gap-1"
              >
                {selectedEntry.model_answers_location !== null ? (
                  <Check className="w-4 h-4 mr-1" />
                ) : (
                  <X className="w-4 h-4 mr-1" />
                )}
                <span>Model answers</span>
              </Badge>
              <Badge
                backgroundColour={
                  selectedEntry.insert_location !== null
                    ? "rgba(34, 197, 94, 0.2)"
                    : "rgba(239, 68, 68, 0.2)"
                }
                textColour={
                  selectedEntry.insert_location !== null ? "#22C55E" : "#EF4444"
                }
                className="w-auto px-3 py-1 flex items-center gap-1"
              >
                {selectedEntry.insert_location !== null ? (
                  <Check className="w-4 h-4 mr-1" />
                ) : (
                  <X className="w-4 h-4 mr-1" />
                )}
                <span>Insert</span>
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Crosshair className="w-4 h-4" strokeWidth={2} />
              <p>Series: {selectedEntry.series}</p>
            </div>
            <div className="flex items-center gap-3">
              <FolderOpen className="w-4 h-4" strokeWidth={2} />
              <p>Files: {selectedEntry.files}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Button
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                openFiles(selectedEntry.id);
              }}
            >
              Open
            </Button>
            <Button
              className="w-full bg-[#F8921A] hover:bg-[#DF8319]"
              onClick={(e) => {
                e.stopPropagation();
                downloadZIP(selectedEntry.id);
              }}
            >
              Download .ZIP
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                const emailSubject = encodeURIComponent(
                  "Issue with Past Paper Page Entry for " +
                    qualification +
                    " " +
                    subject +
                    " (" +
                    examBoard +
                    ")"
                );
                const emailBody = encodeURIComponent(`Dear Pack Support,

      I believe there is an issue on the past paper page for:
      - Qualification: ${qualification}
      - Subject: ${subject}
      - Exam Board: ${examBoard}
      - Past Paper Entry: ${selectedEntry.series} - ${selectedEntry.resource_name}

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
    const fetchPastPaperData = async () => {
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
          const pastPaperResponse = await fetch(
            `/api/past_papers/get_past_paper_data?qualification=${encodeURIComponent(
              qualification
            )}&subject=${encodeURIComponent(
              subject
            )}&examBoard=${encodeURIComponent(examBoard)}`
          );

          if (!pastPaperResponse.ok) {
            console.error(
              "Error getting past paper entries:",
              pastPaperResponse.statusText
            );
            toast.error(
              "Error getting past paper data. Please try again later."
            );
            setPastPaperEntries(null);
          } else {
            const pastPaperData = await pastPaperResponse.json();
            const sortedEntries = sortEntriesBySeries(
              pastPaperData.pastPaperEntries
            );
            setPastPaperEntries(sortedEntries);
          }
        } else {
          // User not logged in
          console.log("No user logged in.");
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Error getting user or past paper entries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPastPaperData();
  }, [qualification, subject, examBoard, router, sortEntriesBySeries]);

  if (loading) {
    return (
      <>
        <h2 className="text-3xl font-semibold mb-3">
          {subject} Past Papers ({examBoard})
        </h2>

        <h2 className="mt-6 mb-3 text-sm">
          <Spinner className="inline mr-2" />
          <i>Loading past papers...</i>
        </h2>
      </>
    );
  }

  return (
    <>
      <div className="flex gap-6 pb-24 xl:pb-0">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 break-words">
            {subject} Past Papers ({examBoard})
          </h2>

          <div className="flex flex-col xl:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search past papers..."
                className="w-full h-[42px] px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {pastPaperEntries && pastPaperEntries.length > 0 ? (
            <div style={{ overflowX: "auto", width: "100%" }}>
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted border-b border-border">
                      <th className="px-4 py-3 text-center text-sm font-semibold border-r-2 border-border">
                        NAME
                      </th>
                      <th
                        className="py-3 text-center text-sm font-semibold w-16"
                        title="Mark Scheme"
                      >
                        MS
                      </th>
                      <th
                        className="py-3 text-center text-sm font-semibold w-16"
                        title="Model Answers"
                      >
                        MA
                      </th>
                      <th
                        className="py-3 text-center text-sm font-semibold border-r-2 border-border w-16"
                        title="Insert"
                      >
                        IS
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold w-12"></th>
                      <th className="px-4 py-3 text-center text-sm font-semibold w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="font-medium">
                    {pastPaperEntries.map((entry) => (
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
                          {entry.series} {entry.resource_name}
                        </td>

                        <td className="py-2 text-center">
                          {entry.mark_scheme_location ? (
                            <Check className="w-5 h-5 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 mx-auto" />
                          )}
                        </td>

                        <td className="py-2 text-center">
                          {entry.model_answers_location ? (
                            <Check className="w-5 h-5 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 mx-auto" />
                          )}
                        </td>

                        <td className="py-2 border-r-2 border-border text-center">
                          {entry.insert_location ? (
                            <Check className="w-5 h-5 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 mx-auto" />
                          )}
                        </td>

                        <td className="p-4 text-center hover:bg-gray-800 border-r-2 border-border">
                          <div className="w-full h-full flex items-center justify-center">
                            <button
                              title="Download"
                              className="w-full h-full rounded text-lg font-semibold flex items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadZIP(entry.id);
                              }}
                            >
                              <Download />
                            </button>
                          </div>
                        </td>

                        <td className="p-4 text-center hover:bg-gray-800">
                          <div className="w-full h-full flex items-center justify-center">
                            <button
                              title="Open"
                              className="w-full h-full rounded text-lg font-semibold flex items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                openFiles(entry.id);
                              }}
                            >
                              <SquareArrowOutUpRight />
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
                There are currently no past papers for this subject. This may
                mean your subject is unsupported or you&apos;ve entered an
                invalid qualification/course/exam board combination (check
                spelling above) - if this is not the case, please contact
                support so we can add content from your exam board.
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
