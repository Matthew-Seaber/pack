"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";

export default function TasksPage() {
  interface Task {
    id: string;
    name: string;
    description: string;
    due: string;
    priority: number;
  }

  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasksDueToday, setTasksDueToday] = useState<Task[]>([]);
  const [tasksDueTomorrow, setTasksDueTomorrow] = useState<Task[]>([]);
  const [tasksDueThisWeek, setTasksDueThisWeek] = useState<Task[]>([]);
  const [tasksDueLater, setTasksDueLater] = useState<Task[]>([]);
  const [tasksOverdue, setTasksOverdue] = useState<Task[]>([]);
  const [tasksWithoutDueDate, setTasksWithoutDueDate] = useState<Task[]>([]);
  const router = useRouter();

  const priorityColours = {
    1: { bg: "bg-red-500/20", text: "#FF6B6B" },
    2: { bg: "bg-orange-500/20", text: "#debb3e" },
    3: { bg: "bg-blue-500/20", text: "#4FC3F7" },
    4: { bg: "bg-green-500/20", text: "#5ac46b" },
  };

  // Function to render a task (with colours based on its priority)
  const renderTask = (task: Task) => {
    const colors =
      priorityColours[task.priority as keyof typeof priorityColours] ||
      priorityColours[4]; // Fallback to grey if error getting a task's corresponding colour

    return (
      <div
        key={task.id}
        className={`flex justify-between ${colors.bg} rounded-md mt-5 p-6`}
        style={{ color: colors.text }}
      >
        <div>
          <p className="text-md font-medium pb-2">
            {task.name.length > 50 ? task.name.slice(0, 50) + "..." : task.name}
          </p>
          {task.description && (
            <p className="text-sm font-regular">
              <i>
                {task.description.length > 100
                  ? task.description.slice(0, 100) + "..."
                  : task.description}
              </i>
            </p>
          )}
        </div>
      </div>
    );
  };

  // Get user data using API and then get tasks
  React.useEffect(() => {
    const fetchUserAndTasks = async () => {
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
          const tasksResponse = await fetch("/api/tasks", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          if (!tasksResponse.ok) {
            console.error("Error getting tasks:", tasksResponse.statusText);
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
              if (!task.due) { // No due date
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

    fetchUserAndTasks();
  }, [router]);

  if (loading) {
    return (
      <>
        <h2 className="text-2xl font-semibold mb-3">Tasks</h2>
        <p>Keep on top of your to-do list.</p>

        <h2 className="mt-6 mb-3 text-sm">
          <i>Loading tasks...</i>
        </h2>
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-semibold mb-3">Tasks</h2>
      <p>Keep on top of your to-do list.</p>

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
