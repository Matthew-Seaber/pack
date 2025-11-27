"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  AlignLeft,
  Notebook,
  Plus,
  ChevronDownIcon,
} from "lucide-react";
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
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [taskName, setTaskName] = React.useState("");
  const [taskDescription, setTaskDescription] = React.useState("");
  const [taskPriority, setTaskPriority] = React.useState<string>("");
  const [taskSubject, setTaskSubject] = React.useState<string>("");
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const router = useRouter();

  const priorityColours = {
    1: { bg: "bg-red-500/20", text: "#FF6B6B" },
    2: { bg: "bg-orange-500/20", text: "#debb3e" },
    3: { bg: "bg-blue-500/20", text: "#4FC3F7" },
    4: { bg: "bg-green-500/20", text: "#5ac46b" },
  };

  const playCompletionSFX = () => {
    try {
      const audio = new Audio("/sounds/task-complete.mp3");
      audio.volume = 0.1;
      audio.play().catch((error) => {
        console.log("Could not play completion SFX:", error);
      });
    } catch (error) {
      console.log("Could not play completion SFX:", error);
    }
  };

  // Function to categorize a task based on its due date/time
  const categorizeTask = React.useCallback(
    (
      task: Task
    ): "overdue" | "today" | "tomorrow" | "thisWeek" | "later" | "noDate" => {
      if (!task.due) {
        return "noDate";
      }

      const dueDate = new Date(task.due);
      const today = new Date();

      // Due today
      if (
        dueDate.getFullYear() === today.getFullYear() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getDate() === today.getDate()
      ) {
        return "today";
      }

      // Due tomorrow
      if (
        dueDate.getFullYear() === today.getFullYear() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getDate() === today.getDate() + 1
      ) {
        return "tomorrow";
      }

      // Due this week (within 7 days)
      if (
        dueDate > today &&
        dueDate <=
          new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
      ) {
        return "thisWeek";
      }

      // Due later (more than 7 days away)
      if (
        dueDate >
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
      ) {
        return "later";
      }

      // Overdue
      if (dueDate < today) {
        return "overdue";
      }

      return "noDate";
    },
    []
  );

  // Function to add a task to the appropriate due category
  const addTaskToCategory = React.useCallback(
    (task: Task, category: ReturnType<typeof categorizeTask>) => {
      switch (category) {
        case "overdue":
          setTasksOverdue((previous) => [...previous, task]);
          break;
        case "today":
          setTasksDueToday((previous) => [...previous, task]);
          break;
        case "tomorrow":
          setTasksDueTomorrow((previous) => [...previous, task]);
          break;
        case "thisWeek":
          setTasksDueThisWeek((previous) => [...previous, task]);
          break;
        case "later":
          setTasksDueLater((previous) => [...previous, task]);
          break;
        case "noDate":
          setTasksWithoutDueDate((previous) => [...previous, task]);
          break;
        default:
          setTasksWithoutDueDate((previous) => [...previous, task]);
          console.log("Task categorisation error", category);
          break;
      }
    },
    []
  );

  // Function to handle adding a new task
  const handleAddTask = async () => {
    // Validate fields
    if (!taskName.trim()) {
      toast.error("Task name is required.");
      return;
    }

    const finalPriority = taskPriority || "4"; // Sets default priority to lowest if none selected

    try {
      // Combine date and time into a timestampz
      let dueTimestamp: string | null = null;
      const now = new Date();

      if (date) {
        const combinedDate = new Date(date);
        if (time) {
          const [hours, minutes] = time.split(":");
          combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          // Default to end of day if no time is selected
          combinedDate.setHours(23, 59, 59, 999);
        }

        if (combinedDate < now) {
          toast.error("Due date cannot be in the past.");
          return;
        }

        dueTimestamp = combinedDate.toISOString();
      }

      const response = await fetch("/api/tasks/add_task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: taskName.trim(),
          description: taskDescription.trim() || null,
          due: dueTimestamp || null,
          priority: parseInt(finalPriority),
          subject: taskSubject || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Task added!");

        // Add new task to the appropriate section (updates UI without refresh for improved UX)
        const newTask = data.task;
        setTasks((previous) => (previous ? [...previous, newTask] : [newTask]));

        // Categorize the new task
        const category = categorizeTask(newTask);
        addTaskToCategory(newTask, category);

        // Reset form fields
        setTaskName("");
        setTaskDescription("");
        setDate(undefined);
        setTime("");
        setTaskPriority("");
        setTaskSubject("");
        setSheetOpen(false);
      } else {
        console.error("Failed to add task:", response.statusText);
        toast.error("Failed to add task. Please try again later.");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Error adding task. Please try again later.");
    }
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

    // Checks if time is 23:59:59 (i.e. user didn't set a time because there's no option to add seconds)
    const isEndOfDay =
      date.getHours() === 23 &&
      date.getMinutes() === 59 &&
      date.getSeconds() === 59;

    // Include year if it's not due the current year
    if (inputYear !== year) {
      return isEndOfDay
        ? `${day} ${month} ${inputYear}`
        : `${day} ${month} ${inputYear}, ${time}`;
    } else {
      return isEndOfDay ? `${day} ${month}` : `${day} ${month}, ${time}`;
    }
  };

  // Function to render a task (with colours based on its priority)
  const renderTask = (task: Task) => {
    const colours =
      priorityColours[task.priority as keyof typeof priorityColours] ||
      priorityColours[4]; // Fallback to grey if error getting a task's corresponding colour

    return (
      <div
        key={task.id}
        className={`flex items-start justify-between gap-4 ${colours.bg} rounded-md mt-5 pt-5 pb-3 px-6`}
        style={{ color: colours.text }}
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
                <i>
                  {subjectMap.get(task.subject) || "Subject course not found"}
                </i>
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
          style={{ borderColor: colours.text }}
          onClick={async () => {
            try {
              const response = await fetch("/api/tasks/complete_task", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taskID: task.id }),
              });

              if (response.ok) {
                playCompletionSFX();
                toast.success("Task complete!");
                confetti({
                  particleCount: 80,
                  spread: 50,
                  origin: { y: 0.6 },
                  ticks: 100,
                  gravity: 1.2,
                });
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

            const tempTasksOverdue: Task[] = [];
            const tempTasksDueToday: Task[] = [];
            const tempTasksDueTomorrow: Task[] = [];
            const tempTasksDueThisWeek: Task[] = [];
            const tempTasksDueLater: Task[] = [];
            const tempTasksWithoutDueDate: Task[] = [];

            for (const task of tasksData.tasks) {
              const category = categorizeTask(task);

              switch (category) {
                case "overdue":
                  tempTasksOverdue.push(task);
                  break;
                case "today":
                  tempTasksDueToday.push(task);
                  break;
                case "tomorrow":
                  tempTasksDueTomorrow.push(task);
                  break;
                case "thisWeek":
                  tempTasksDueThisWeek.push(task);
                  break;
                case "later":
                  tempTasksDueLater.push(task);
                  break;
                case "noDate":
                  tempTasksWithoutDueDate.push(task);
                  break;
                default:
                  tempTasksWithoutDueDate.push(task);
                  console.log("Task categorisation error", category);
                  break;
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
            console.error(
              "Error getting subjects:",
              subjectsResponse.statusText
            );
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
  }, [router, categorizeTask]);

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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
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
              <Input
                id="name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </div>
            <div className="py-2 flex flex-col gap-3 mb-2">
              <Label className="px-1" htmlFor="description">
                Description
              </Label>
              <Input
                id="description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
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
                    step="60" // Hours and minutes
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
                  <Select value={taskPriority} onValueChange={setTaskPriority}>
                    <SelectTrigger id="priority">
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
                  <Select value={taskSubject} onValueChange={setTaskSubject}>
                    <SelectTrigger id="subject">
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
            <Button onClick={handleAddTask}>Add task</Button>
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
