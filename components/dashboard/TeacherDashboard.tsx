"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { PanelBottomOpen, UserRound } from "lucide-react";
import { Fab } from "@/components/ui/fab";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface TeacherClass {
  id: string;
  name: string;
  memberCount: number;
  joinCode: string;
}

interface TeacherSchoolwork {
  id: string;
  class: TeacherClass[];
  dueDate: string;
  name: string;
  description: string;
}

interface TeacherNotification {
  id: string;
  class: TeacherClass[];
  schoolwork: TeacherSchoolwork[];
}

interface TeacherDashboardProps {
  teacherClasses: TeacherClass[];
  teacherSchoolworks: TeacherSchoolwork[];
  teacherNotifications: TeacherNotification[];
}

export default function TeacherDashboard({
  teacherClasses,
  teacherNotifications,
}: TeacherDashboardProps) {
  // Function to sort classes by name
  const sortClassesByName = useCallback(
    (classes: TeacherClass[]): TeacherClass[] => {
      return classes.sort((a, b) => {
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

  const [selectedTeacherClass, setSelectedTeacherClass] =
    useState<TeacherClass | null>(null);
  const [removeMode, setRemoveMode] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const sortedTeacherClasses = sortClassesByName([...teacherClasses]); // The "..." ensures the original array isn't changed (copy used instead)

  // Function to render a notification
  const renderTeacherNotification = (notification: TeacherNotification) => {
    const schoolworkInfo = notification.schoolwork[0];
    const classInfo = notification.class[0];

    return (
      <div
        key={notification.id}
        className="bg-card border-l-4 border-orange-400 rounded-lg p-4 duration-300 hover:scale-[1.03]"
      >
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold">{schoolworkInfo.name}</h3>
          <p className="text-xs text-muted-foreground ml-2 overflow-hidden">
            {classInfo.name}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {schoolworkInfo?.description ? (
            schoolworkInfo.description
          ) : (
            <i>No description</i>
          )}
        </p>
      </div>
    );
  };

  // Function to add a class to a teacher's account
    const handleAddClass = async () => {
      if (newClassName.trim() === "") {
        toast.error("Invalid class name.");
        return;
      } else {
        if (
          // Check to see if the class is already linked to their account
          teacherClasses?.some(
            (teacherClass) =>
              teacherClass.name === newClassName.trim()
          )
        ) {
          toast.error("Class already exists in your library.");
          return;
        }
  
        try {
          const response = await fetch("/api/teacher_schoolwork/add_class", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              className: newClassName.trim(),
            }),
          });
          if (response.ok) {
            toast.success("Successfully added class!");
            setNewClassName("");
            setDialogOpen(false);
            // Refresh class list by refreshing page
            setTimeout(() => window.location.reload(), 1000); // Gives teacher time to read the toast
          } else {
            console.error("Failed to add class:", response.statusText);
            toast.error(
              "Failed to add class. Please try again later."
            );
          }
        } catch (error) {
          console.error("Error adding class:", error);
          toast.error("Error adding class. Please try again later.");
        }
      }
    };

  // Function to render a teacher's class
  const renderTeacherClass = (teacherClass: TeacherClass) => {
    return (
      <div
        key={teacherClass.id}
        onClick={async () => {
          if (removeMode) {
            const confirmation = window.confirm(
              `Are you sure you want to permanently remove the class '${teacherClass.name}' from your account?`
            );
            if (confirmation) {
              try {
                const response = await fetch(
                  "/api/teacher_schoolwork/remove_class",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ classID: teacherClass.id }),
                  }
                );

                if (response.ok) {
                  toast.success("Class deleted.");
                  setTimeout(() => window.location.reload(), 1000); // Gives the user time to read the toast
                } else {
                  console.error("Failed to delete class:", response.statusText);
                  toast.error(
                    "Failed to delete class. Please try again later."
                  );
                  return;
                }
              } catch (error) {
                console.error("Error deleting class:", error);
                toast.error("Error deleting class. Please try again later.");
                return;
              }
            }
          } else {
            setSelectedTeacherClass(teacherClass);
          }
        }}
        className={`relative border-4 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
          selectedTeacherClass?.id === teacherClass.id && !removeMode
            ? "ring-4 ring-primary"
            : ""
        }  ${
          removeMode ? "hover:ring-4 hover:ring-red-500 hover:opacity-80" : ""
        }`}
      >
        <div className="pr-20">
          <h3 className="text-xl font-semibold">{teacherClass.name}</h3>

          <hr className="mt-2 mb-3 border-muted border-1" />

          <div className="text-sm flex flex-col gap-1 border-l-2 border-muted pl-3">
            <Button
              variant="link"
              className="justify-start pl-0 text-foreground font-normal h-auto py-0"
              asChild
            >
              <a href={`/classes/${teacherClass.id}/schoolwork`}>
                Homework/tests
              </a>
            </Button>
            <Button
              variant="link"
              className="justify-start pl-0 text-foreground font-normal h-auto py-0"
              asChild
            >
              <a href={`/classes/${teacherClass.id}/manage`}>Manage class</a>
            </Button>
          </div>

          {teacherClass.joinCode && (
            <p className="text-xs mt-4 text-muted-foreground">
              Join code: {teacherClass.joinCode}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Sidebar content component
  const SidebarContent = () => {
    if (!selectedTeacherClass) {
      return (
        <div className="space-y-4">
          <div className="flex gap-2 font-semibold">
            <Button
              className="flex-1"
              variant="default"
              onClick={() => setDialogOpen(true)}
            >
              <span className="mr-2">+</span>
              ADD CLASS
            </Button>
            <Button
              className="text-foreground"
              variant={removeMode ? "outline" : "destructive"}
              onClick={() => {
                setRemoveMode(!removeMode);
                setSelectedTeacherClass(null);
              }}
            >
              <span className="mr-2">-</span>
              {removeMode ? "CANCEL" : "REMOVE"}
            </Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 text-center py-12">
            <p className="text-muted-foreground">
              Select a class to view details.
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
            onClick={() => setDialogOpen(true)}
          >
            <span className="mr-2">+</span>
            ADD CLASS
          </Button>
          <Button
            className="text-foreground"
            variant={removeMode ? "outline" : "destructive"}
            onClick={() => {
              setRemoveMode(!removeMode);
              setSelectedTeacherClass(null);
            }}
          >
            <span className="mr-2">-</span>
            {removeMode ? "CANCEL" : "REMOVE"}
          </Button>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">
            {selectedTeacherClass.name}
          </h3>
          <div className="space-y-2 text-sm">
            {selectedTeacherClass.memberCount !== undefined && (
              <div className="flex items-center gap-3">
                <UserRound className="w-4 h-4" strokeWidth={2} />
                <p>Students: {selectedTeacherClass.memberCount}</p>
              </div>
            )}
            {selectedTeacherClass.joinCode && (
              <div className="bg-muted rounded-md p-3 mt-2">
                <p className="text-xs text-muted-foreground mb-1">Join Code</p>
                <p className="font-mono font-bold text-lg">
                  {selectedTeacherClass.joinCode}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <Button
              className="w-full"
              onClick={() =>
                (window.location.href = `/classes/${selectedTeacherClass.id}`)
              }
            >
              View Class
            </Button>
            <Button
              className="w-full bg-[#F8921A] hover:bg-[#DF8319]"
              onClick={async () => {
                const code = selectedTeacherClass?.joinCode ?? "";
                if (!code) return;
                try {
                  await navigator.clipboard.writeText(code);
                  toast.success("Join code copied to clipboard!");
                } catch (err) {
                  console.error("Failed to copy join code: ", err);
                  toast.error("Failed to copy join code to clipboard.");
                }
              }}
            >
              Copy Join Code
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={async () => {
                try {
                  const response = await fetch(
                    "/api/teacher_schoolwork/reset_join_code",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        classID: selectedTeacherClass.id,
                      }),
                    }
                  );

                  if (response.ok) {
                    const newCode = (await response.json()).new_code;
                    selectedTeacherClass.joinCode = newCode;
                    try {
                      await navigator.clipboard.writeText(newCode);
                      toast.success(
                        "Join code reset. New code copied to clipboard!"
                      );
                      setTimeout(() => window.location.reload(), 1000); // Gives the user time to read the toast
                    } catch (err) {
                      console.error("Failed to copy new join code: ", err);
                      toast.error("Join code reset.");
                    }

                    setTimeout(() => window.location.reload(), 1000); // Gives the user time to read the toast
                  } else {
                    toast.error("Failed to reset join code.");
                    const errorData = await response.json();
                    console.error("Join code reset error:", errorData.message);
                  }
                } catch (error) {
                  console.error("Join code reset error (2):", error);
                  toast.error("Failed to reset join code.");
                }
              }}
            >
              Reset Join Code
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-4 mb-12 border-4 rounded-xl border-orange-400">
        <Card className="w-full p-6" style={{ outline: "2px solid primary" }}>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-400/20 flex items-center justify-center">
              <p className="text-xl">🔔</p>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Due Today</h3>
              <p className="text-sm text-muted-foreground">
                List of homeworks and tests due today.
              </p>
            </div>
            <div className="flex items-center h-12">
              <p className="text-xl font-semibold">
                {teacherNotifications.length}
              </p>
            </div>
          </div>
          <Separator className="mb-4" />
          <div className="space-y-3">
            {teacherNotifications && teacherNotifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {teacherNotifications.map((notification) =>
                  renderTeacherNotification(notification)
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No schoolwork due today
              </p>
            )}
          </div>
        </Card>
      </div>
      <div className="flex gap-6 pb-24 xl:pb-0">
        <div className="flex-1">
          <h2 className="text-3xl font-semibold mb-3">My Classes</h2>

          {removeMode && (
            <div className="mb-4 p-4 bg-red-500/10 border-2 border-red-500 rounded-lg">
              <div className="flex items-center gap-4">
                <p className="text-red-500 font-semibold flex items-center gap-2 m-0">
                  ⚠️ Remove Mode - clicking on a class will permanently remove
                  it from your profile
                </p>
                <Button
                  variant="outline"
                  className="mt-0 ml-auto"
                  onClick={() => setRemoveMode(false)}
                >
                  CANCEL
                </Button>
              </div>
            </div>
          )}

          {sortedTeacherClasses && sortedTeacherClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedTeacherClasses.map((classObject) =>
                renderTeacherClass(classObject)
              )}
            </div>
          ) : (
            <div className="mt-5 p-6 text-center text-gray-500">
              <p>You have no classes linked to your profile.</p>
              <Button className="mt-3" onClick={() => setDialogOpen(true)}>
                Add Class
              </Button>
            </div>
          )}
        </div>

        <div className="hidden md:block w-80">
          <SidebarContent />
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Class</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Add a new class to your account.
          </DialogDescription>
          <div className="my-4">
            <label
              className="block text-sm font-medium mb-3"
              htmlFor="newClassInput"
            >
              Class Name
            </label>
            <div className="flex items-center gap-4">
              <Input
                id="newClassInput"
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                required
                placeholder="New class name"
              />
              <Button onClick={handleAddClass}>Add</Button>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button>Done</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                Quick actions and details about your class.
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
