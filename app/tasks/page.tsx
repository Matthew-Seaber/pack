"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, AlignLeft, Notebook, Plus, ChevronDownIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Sheet,
  SheetClose,
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";

export default function TasksPage() {
  interface Task {
    id: string;
    name: string;
    description: string | null;
    due: string | null;
    priority: number;
    subject: string | null;
  }

  interface Subject {
    id: string;
    name: string;
  }

  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [subjectMap, setSubjectMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [tasksDueToday, setTasksDueToday] = useState<Task[]>([]);
  const [tasksDueTomorrow, setTasksDueTomorrow] = useState<Task[]>([]);
  const [tasksDueThisWeek, setTasksDueThisWeek] = useState<Task[]>([]);
  const [tasksDueLater, setTasksDueLater] = useState<Task[]>([]);
  const [tasksOverdue, setTasksOverdue] = useState<Task[]>([]);
  const [tasksWithoutDueDate, setTasksWithoutDueDate] = useState<Task[]>([]);
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [time, setTime] = React.useState<string>(""); // Default to empty (no time)
  const router = useRouter();

  const priorityColours = {
    1: { bg: "bg-red-500/20", text: "#FF6B6B" },
    2: { bg: "bg-orange-500/20", text: "#debb3e" },
    3: { bg: "bg-blue-500/20", text: "#4FC3F7" },
    4: { bg: "bg-green-500/20", text: "#5ac46b" },
  };

  // Function to convert a given timestamp to a UX-friendly format
  const formatTimestamp = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const year = now.getFullYear();
    const inputYear = date.getFullYear();

    const day = date.getDate();
    const month = date.toLocaleDateString("en-GB", { month: "short" });
    const time = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Include year if it's not due the current year
    if (inputYear !== year) {
      return `${day} ${month} ${inputYear}, ${time}`;
    } else {
      return `${day} ${month}, ${time}`;
    }
  };

  // Function to render a task (with colours based on its priority)
  const renderTask = (task: Task) => {
    const colors =
      priorityColours[task.priority as keyof typeof priorityColours] ||
      priorityColours[4]; // Fallback to grey if error getting a task's corresponding colour

    return (
      <div
        key={task.id}
        className={`flex items-start justify-between gap-4 ${colors.bg} rounded-md mt-5 pt-5 pb-3 px-6`}
        style={{ color: colors.text }}
      >
        <div className="flex-1 min-w-0">
          <p
            className="text-md font-medium pb-4"
            style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
          >
            {task.name.length > 60 ? task.name.slice(0, 60) + "..." : task.name}
          </p>
          {task.due && (
            <div className="flex items-center gap-3 pb-2">
              <Clock className="w-5 h-5" />
              <p className="text-sm font-regular">
                <i>{formatTimestamp(task.due)}</i>
              </p>
            </div>
          )}
          {task.subject && (
            <div className="flex items-center gap-3 pb-2">
              <Notebook className="w-5 h-5" />
                <p
                  className="text-sm font-regular"
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  <i>{subjectMap.get(task.subject) || "Subject course not found"}</i>
                </p>
            </div>
          )}
          {task.description && (
            <div className="flex items-start gap-3 pb-3">
              <AlignLeft className="w-5 h-5 flex-shrink-0 mt-0.2" />
              <p
                className="text-sm font-regular"
                style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
              >
                <i>
                  {task.description.length > 75
                    ? task.description.slice(0, 75) + "..."
                    : task.description}
                </i>
              </p>
            </div>
          )}
        </div>
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full border-2 cursor-pointer hover:bg-white/20 transition-colors"
          style={{ borderColor: colors.text }}
          onClick={async () => {
            try {
              const response = await fetch("/api/tasks/complete_task", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taskID: task.id }),
              });

              if (response.ok) {
                toast.success("Task complete!");
                // Refreshes all task lists and UI to ensure consistency before and after the transaction
                setTasks((previous) =>
                  previous ? previous.filter((tsk) => tsk.id !== task.id) : null
                );
                setTasksDueToday((previous) =>
                  previous.filter((tsk) => tsk.id !== task.id)
                );
                setTasksDueTomorrow((previous) =>
                  previous.filter((tsk) => tsk.id !== task.id)
                );
                setTasksDueThisWeek((previous) =>
                  previous.filter((tsk) => tsk.id !== task.id)
                );
                setTasksDueLater((previous) =>
                  previous.filter((tsk) => tsk.id !== task.id)
                );
                setTasksOverdue((previous) =>
                  previous.filter((tsk) => tsk.id !== task.id)
                );
                setTasksWithoutDueDate((previous) =>
                  previous.filter((tsk) => tsk.id !== task.id)
                );
              } else {
                console.error("Failed to complete task:", response.statusText);
                toast.error("Failed to complete task. Please try again later.");
              }
            } catch (error) {
              console.error("Error completing task:", error);
              toast.error("Error completing task. Please try again later.");
            }
          }}
        />
      </div>
    );
  };

  // Get user data using API and then get tasks
  React.useEffect(() => {
    const fetchUserAndTasksAndSubjects = async () => {
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
          const tasksResponse = await fetch("/api/tasks/get_tasks", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          if (!tasksResponse.ok) {
            console.error("Error getting tasks:", tasksResponse.statusText);
            toast.error("Error getting your tasks. Please try again later.");
            setTasks(null);
          } else {
            const tasksData = await tasksResponse.json();
            setTasks(tasksData.tasks);

            const today = new Date();
            const tempTasksOverdue: Task[] = [];
            const tempTasksDueToday: Task[] = [];
            const tempTasksDueTomorrow: Task[] = [];
            const tempTasksDueThisWeek: Task[] = [];
            const tempTasksDueLater: Task[] = [];
            const tempTasksWithoutDueDate: Task[] = [];

            for (const task of tasksData.tasks) {
              const dueDate = new Date(task.due);
              if (!task.due) {
                // No due date
                tempTasksWithoutDueDate.push(task);
                continue;
              }

              if (
                // Due today
                dueDate.getFullYear() === today.getFullYear() &&
                dueDate.getMonth() === today.getMonth() &&
                dueDate.getDate() === today.getDate()
              ) {
                tempTasksDueToday.push(task);
              } else if (
                // Due tomorrow
                dueDate.getFullYear() === today.getFullYear() &&
                dueDate.getMonth() === today.getMonth() &&
                dueDate.getDate() === today.getDate() + 1
              ) {
                tempTasksDueTomorrow.push(task);
              } else if (
                // Due this week
                dueDate > today &&
                dueDate <=
                  new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate() + 7
                  )
              ) {
                tempTasksDueThisWeek.push(task);
              } else if (
                dueDate >
                new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate() + 7
                )
              ) {
                // Due later
                tempTasksDueLater.push(task);
              } else if (dueDate < today) {
                // Overdue
                tempTasksOverdue.push(task);
              } else {
                // No due date
                tempTasksWithoutDueDate.push(task);
              }
            }

            setTasksDueToday(tempTasksDueToday);
            setTasksDueTomorrow(tempTasksDueTomorrow);
            setTasksDueThisWeek(tempTasksDueThisWeek);
            setTasksDueLater(tempTasksDueLater);
            setTasksOverdue(tempTasksOverdue);
            setTasksWithoutDueDate(tempTasksWithoutDueDate);
          }

          const subjectsResponse = await fetch("/api/subjects/get_subjects", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          if (!subjectsResponse.ok) {
            console.error("Error getting subjects:", subjectsResponse.statusText);
            toast.error("Error getting your subjects. Please try again later.");
            setSubjects(null);
          } else {
            const subjectsData = await subjectsResponse.json();
            setSubjects(subjectsData.subjects);
            
            // Create a map of 'subject_id's to 'course_name's for quick lookup when rendering tasks
            const map = new Map<string, string>();
            subjectsData.subjects.forEach((subject: Subject) => {
              map.set(subject.id, subject.name);
            });
            setSubjectMap(map);
          }
        } else {
          // User not logged in
          console.log("No user logged in.");
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Error getting user or tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndTasksAndSubjects();
  }, [router]);

  if (loading) {
    return (
      <>
        <h2 className="text-2xl font-semibold mb-3">Tasks</h2>
        <p>Keep on top of your to-do list.</p>

        <h2 className="mt-6 mb-3 text-sm">
          <Spinner className="inline mr-2" />
          <i>Loading tasks...</i>
        </h2>
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-semibold mb-3">Tasks</h2>
      <p>Keep on top of your to-do list.</p>

      <Sheet>
        <SheetTrigger asChild>
          <Fab className="hover:rotate-180 transition-transform duration-700">
            <Plus />
          </Fab>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add task</SheetTitle>
            <SheetDescription>Add a new task to your list</SheetDescription>
          </SheetHeader>
          <div className="py-3">
            <div className="py-2 flex flex-col gap-3 mb-2">
              <Label className="px-1" htmlFor="name">
                Name *
              </Label>
              <Input id="name" />
            </div>
            <div className="py-2 flex flex-col gap-3 mb-2">
              <Label className="px-1" htmlFor="description">
                Description
              </Label>
              <Input id="description" />
            </div>
            <div className="py-2 mb-2">
              <div className="flex gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="datePicker" className="px-1">
                    Due date
                  </Label>
                  <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        id="datePicker"
                        className="w-32 justify-between font-normal"
                      >
                        {date ? date.toLocaleDateString() : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-auto max-w-fit">
                      <DialogHeader>
                        <DialogTitle>Select a due date</DialogTitle>
                      </DialogHeader>
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                          setDate(selectedDate);
                          setCalendarOpen(false);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="timePicker" className="px-1">
                    Due time
                  </Label>
                  <Input
                    type="time"
                    id="timePicker"
                    step="1"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </div>
              </div>
            </div>
            <div className="py-2 mb-2">
              <div className="flex gap-4">
                <div className="flex flex-col gap-3">
                  <Label className="px-1" htmlFor="priority">
                    Priority
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-3">
                  <Label className="px-1" htmlFor="subject">
                    Subject
                  </Label>
                  <Select>
                    <SelectTrigger>
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
            <Button>Add task</Button>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {tasks && tasks.length > 0 ? (
        <>
          {tasksOverdue.length > 0 && (
            <h3 className="pt-10 text-lg font-semibold">Overdue</h3>
          )}

          {tasksOverdue.length > 0 && tasksOverdue.map(renderTask)}

          <h3 className="pt-10 text-lg font-semibold">Today</h3>

          {tasksDueToday.length === 0 && (
            <div className="mt-5 p-6 text-center text-gray-500">
              <p>No remaining tasks due today! 🥳</p>
            </div>
          )}

          {tasksDueToday.length > 0 && tasksDueToday.map(renderTask)}

          {tasksDueTomorrow.length > 0 && (
            <h3 className="pt-10 text-lg font-semibold">Tomorrow</h3>
          )}

          {tasksDueTomorrow.length > 0 && tasksDueTomorrow.map(renderTask)}

          {tasksDueThisWeek.length > 0 && (
            <h3 className="pt-10 text-lg font-semibold">Later this week</h3>
          )}

          {tasksDueThisWeek.length > 0 && tasksDueThisWeek.map(renderTask)}

          {tasksDueLater.length > 0 && (
            <h3 className="pt-10 text-lg font-semibold">In the future</h3>
          )}

          {tasksDueLater.length > 0 && tasksDueLater.map(renderTask)}

          {tasksWithoutDueDate.length > 0 && (
            <h3 className="pt-10 text-lg font-semibold">No date</h3>
          )}

          {tasksWithoutDueDate.length > 0 &&
            tasksWithoutDueDate.map(renderTask)}
        </>
      ) : (
        <div className="mt-5 p-6 text-center text-gray-500">
          <p>You have no remaining tasks! 🥳</p>
        </div>
      )}
      <Toaster />
    </>
  );
}
