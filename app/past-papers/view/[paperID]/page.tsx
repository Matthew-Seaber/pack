"use client";

import React, { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Fab } from "@/components/ui/fab";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutPanelLeft } from "lucide-react";

interface ViewPastPaperPageProps {
  params: Promise<{
    paperID: string;
  }>;
}

export default function ViewPastPaperPage({ params }: ViewPastPaperPageProps) {
  const [questionPaperLocation, setQuestionPaperLocation] = useState(null);
  const [markSchemeLocation, setMarkSchemeLocation] = useState(null);
  const [modelAnswersLocation, setModelAnswersLocation] = useState(null);
  const [insertLocation, setInsertLocation] = useState(null);
  const [questionPaperVisible, setQuestionPaperVisible] = useState(true);
  const [markSchemeVisible, setMarkSchemeVisible] = useState(true);
  const [modelAnswersVisible, setModelAnswersVisible] = useState(true);
  const [insertVisible, setInsertVisible] = useState(true);
  const [layoutStructure, setLayoutStructure] = useState<
    "Horizontal" | "Vertical"
  >("Horizontal");
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const router = useRouter();

  const visibleCount = useMemo(() => {
    return [
      questionPaperVisible && questionPaperLocation,
      markSchemeVisible && markSchemeLocation,
      modelAnswersVisible && modelAnswersLocation,
      insertVisible && insertLocation,
    ].filter(Boolean).length;
  }, [
    questionPaperVisible,
    questionPaperLocation,
    markSchemeVisible,
    markSchemeLocation,
    modelAnswersVisible,
    modelAnswersLocation,
    insertVisible,
    insertLocation,
  ]);

  const resolvedParams = use(params);
  const paperID = resolvedParams.paperID;

  // Get user data using API and then get past paper data
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

          // Gets tasks via API call
          const pastPapersResponse = await fetch(
            `/api/past_papers/open_files?entryID=${encodeURIComponent(paperID)}`
          );

          if (!pastPapersResponse.ok) {
            console.error(
              "Error getting past paper data:",
              pastPapersResponse.statusText
            );
            toast.error("Error getting files. Please try again later.");
          } else {
            const pastPapersData = await pastPapersResponse.json();
            setQuestionPaperLocation(pastPapersData.question_paper_location);
            setMarkSchemeLocation(pastPapersData.mark_scheme_location);
            setModelAnswersLocation(pastPapersData.model_answers_location);
            setInsertLocation(pastPapersData.insert_location);
          }
        } else {
          // User not logged in
          console.log("No user logged in.");
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Error getting user or past paper data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPastPaperData();
  }, [router, paperID]);

  if (loading) {
    return (
      <>
        <h1 className="text-2xl font-semibold mb-3">Past Paper Viewer</h1>

        <h2 className="mt-6 mb-3 text-sm">
          <Spinner className="inline mr-2" />
          <i>Loading files...</i>
        </h2>
      </>
    );
  }

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Fab>
            <LayoutPanelLeft />
          </Fab>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit layout</SheetTitle>
            <SheetDescription>Customise your workspace.</SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-4">
            {questionPaperLocation && (
              <div className="flex flex-col gap-2">
                <Label className="px-1" htmlFor="qp">
                  Question Paper
                </Label>
                <Select
                  value={questionPaperVisible ? "enabled" : "disabled"}
                  onValueChange={(value) =>
                    setQuestionPaperVisible(value === "enabled")
                  }
                >
                  <SelectTrigger id="qp">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {markSchemeLocation && (
              <div className="flex flex-col gap-2">
                <Label className="px-1" htmlFor="ms">
                  Mark Scheme
                </Label>
                <Select
                  value={markSchemeVisible ? "enabled" : "disabled"}
                  onValueChange={(value) =>
                    setMarkSchemeVisible(value === "enabled")
                  }
                >
                  <SelectTrigger id="ms">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {modelAnswersLocation && (
              <div className="flex flex-col gap-2">
                <Label className="px-1" htmlFor="ma">
                  Model Answers
                </Label>
                <Select
                  value={modelAnswersVisible ? "enabled" : "disabled"}
                  onValueChange={(value) =>
                    setModelAnswersVisible(value === "enabled")
                  }
                >
                  <SelectTrigger id="ma">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {insertLocation && (
              <div className="flex flex-col gap-2">
                <Label className="px-1" htmlFor="ins">
                  Insert
                </Label>
                <Select
                  value={insertVisible ? "enabled" : "disabled"}
                  onValueChange={(value) =>
                    setInsertVisible(value === "enabled")
                  }
                >
                  <SelectTrigger id="ins">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {visibleCount === 2 && (
              <div className="flex flex-col gap-2">
                <Label className="px-1" htmlFor="layout">
                  Orientation
                </Label>
                <Select
                  value={layoutStructure}
                  onValueChange={(val) =>
                    setLayoutStructure(val as "Horizontal" | "Vertical")
                  }
                >
                  <SelectTrigger id="layout">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Horizontal">Horizontal</SelectItem>
                    <SelectItem value="Vertical">Vertical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <SheetFooter>
            <Button onClick={() => setSheetOpen(false)}>Done</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <div className="h-100vh w-full">
        {(() => {
          const visiblePanels = [];
          if (questionPaperVisible && questionPaperLocation) {
            // Counting visible panels to decide layout
            visiblePanels.push({
              name: "Question Paper",
              url: questionPaperLocation,
            });
          }
          if (markSchemeVisible && markSchemeLocation) {
            visiblePanels.push({
              name: "Mark Scheme",
              url: markSchemeLocation,
            });
          }
          if (modelAnswersVisible && modelAnswersLocation) {
            visiblePanels.push({
              name: "Model Answers",
              url: modelAnswersLocation,
            });
          }
          if (insertVisible && insertLocation) {
            visiblePanels.push({ name: "Insert", url: insertLocation });
          }

          // 1 paper visible - full width/height
          if (visibleCount === 1) {
            return (
              <div className="w-full h-full">
                <iframe className="w-full h-full" />
              </div>
            );
          }

          // 2 papers visible - horizontal or vertical split option available
          if (visibleCount === 2) {
            return (
              <ResizablePanelGroup
                direction={
                  layoutStructure === "Horizontal" ? "horizontal" : "vertical"
                }
              >
                <ResizablePanel defaultSize={50}>
                  <iframe className="w-full h-full" />
                </ResizablePanel>
                <ResizableHandle withHandle/>
                <ResizablePanel defaultSize={50}>
                  <iframe className="w-full h-full" />
                </ResizablePanel>
              </ResizablePanelGroup>
            );
          }

          // 3 papers visible - 1 left half, 2 split vertically right half
          if (visibleCount === 3) {
            return (
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={50}>
                  <iframe className="w-full h-full" />
                </ResizablePanel>
                <ResizableHandle withHandle/>
                <ResizablePanel defaultSize={50}>
                  <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={50}>
                      <iframe className="w-full h-full" />
                    </ResizablePanel>
                    <ResizableHandle withHandle/>
                    <ResizablePanel defaultSize={50}>
                      <iframe className="w-full h-full" />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
              </ResizablePanelGroup>
            );
          }

          // 4 papers visible - quarter each (2x2 grid)
          if (visibleCount === 4) {
            return (
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={50}>
                  <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={50}>
                      <iframe className="w-full h-full" />
                    </ResizablePanel>
                    <ResizableHandle withHandle/>
                    <ResizablePanel defaultSize={50}>
                      <iframe className="w-full h-full" />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
                <ResizableHandle withHandle/>
                <ResizablePanel defaultSize={50}>
                  <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={50}>
                      <iframe className="w-full h-full" />
                    </ResizablePanel>
                    <ResizableHandle withHandle/>
                    <ResizablePanel defaultSize={50}>
                      <iframe className="w-full h-full" />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
              </ResizablePanelGroup>
            );
          }

          return null;
        })()}
      </div>

      <Toaster />
    </>
  );
}
