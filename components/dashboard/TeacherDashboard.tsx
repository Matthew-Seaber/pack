"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

  const sortedTeacherClasses = sortClassesByName([...teacherClasses]);

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

  // Function to render a teacher's class
  const renderTeacherClass = (teacherClass: TeacherClass) => {
    return (
      <div
        key={teacherClass.id}
        onClick={() => setSelectedTeacherClass(teacherClass)}
        className={`relative border-4 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
          selectedTeacherClass?.id === teacherClass.id
            ? "ring-2 ring-primary"
            : ""
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
            <Button className="flex-1" variant="default">
              <span className="mr-2">+</span>
              ADD CLASS
            </Button>
            <Button className="text-foreground" variant="destructive">
              <span className="mr-2">-</span>
              REMOVE
            </Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 text-center py-12">
            <p className="text-muted-foreground">
              Select a class to view details.
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
          <Button className="flex-1" variant="default">
            <span className="mr-2">+</span>
            ADD CLASS
          </Button>
          <Button className="text-foreground" variant="destructive">
            <span className="mr-2">-</span>
            REMOVE
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
            <Button variant="destructive" className="w-full">
              Reset Join Code
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
                No items due today
              </p>
            )}
          </div>
        </Card>
      </div>
      <div className="flex gap-6 pb-24 xl:pb-0">
        <div className="flex-1">
          <h2 className="text-3xl font-semibold mb-3">My Classes</h2>

          {sortedTeacherClasses && sortedTeacherClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedTeacherClasses.map((classObject) =>
                renderTeacherClass(classObject)
              )}
            </div>
          ) : (
            <div className="mt-5 p-6 text-center text-gray-500">
              <p>You have no classes linked to your profile.</p>
              <Button className="mt-3">Add Class</Button>
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
