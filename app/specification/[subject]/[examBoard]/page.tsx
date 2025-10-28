"use client";

import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Crosshair, Newspaper, PanelBottomOpen } from "lucide-react";
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

  let { subject, examBoard } = use(params);
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
                  "/resources/" +
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
                  "/past-papers/" +
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
                "/resources/" +
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
                "/past-papers/" +
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
            {selectedEntry.common === true && (
              <div className="flex gap-2">
                <Badge
                  backgroundColour="rgba(59, 130, 246, 0.2)"
                  textColour="#3B82F6"
                  className="w-auto px-3 py-1"
                >
                  Common topic
                </Badge>
              </div>
            )}
            {selectedEntry.difficult === true && (
              <div className="flex gap-2">
                <Badge
                  backgroundColour="rgba(239, 68, 68, 0.2)"
                  textColour="#F87171"
                  className="w-auto px-3 py-1"
                >
                  Difficult topic
                </Badge>
              </div>
            )}
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
                  "/resources/" +
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
            <Button variant="destructive" className="w-full">
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

  // Function to render an entry
  const renderEntry = (entry: SpecificationEntry) => {
    return (
      <div
        key={entry.id}
        onClick={() => setSelectedEntry(entry)}
        className={`relative border-4 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
          selectedEntry?.id === entry.id ? "ring-2 ring-primary" : "" // Adds outline when selected
        }`}
      >
        <div className="pr-20">
          <h3 className="text-xl font-semibold">
            {entry.topic} {entry.topic_name}
          </h3>
        </div>
      </div>
    );
  };

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
            `/api/specifications/get_specification_data?subject=${encodeURIComponent(
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
            setSpecificationEntries(specificationData.specificationEntries);
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
  }, [subject, examBoard, router]);

  if (loading) {
    return (
      <>
        <h2 className="text-3xl font-semibold mb-3">
          {subject} Specification {examBoard}
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
          <h2 className="text-3xl font-semibold mb-4">
            {subject} Specification {examBoard}
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
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {specificationEntries.map((entry) => renderEntry(entry))}
            </div>
          ) : (
            <div className="mt-5 p-6 text-center text-gray-500">
              <p>
                There are currently no entries for this subject. This may mean
                your subject is unsupported - please contact support so we can
                add content from your exam board.
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
