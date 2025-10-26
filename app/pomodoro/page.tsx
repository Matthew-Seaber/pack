"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";

function PomodoroPage() {
  const [user, setUser] = React.useState<{ user_id: number } | null>(null);
  const [open, setOpen] = React.useState(false);
  const [focusLength, setFocusLength] = React.useState(25);
  const [breakLength, setBreakLength] = React.useState(5);
  const [timerStatus, setTimerStatus] = React.useState<
    "stopped" | "running" | "paused"
  >("stopped")
  const isDesktop =
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 768px)").matches;

  // Get user data using API
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Error getting user:", error);
      }
    };

    fetchUser();
  }, []);

  // Gets previously saved values from localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFocusLength = localStorage.getItem("pomodoroFocusLength");
      const savedBreakLength = localStorage.getItem("pomodoroBreakLength");

      if (savedFocusLength) {
        setFocusLength(parseInt(savedFocusLength, 10));
      }
      if (savedBreakLength) {
        setBreakLength(parseInt(savedBreakLength, 10));
      }
    }
  }, []);

  const [currentTime, setCurrentTime] = React.useState(focusLength * 60);
  const [mode, setMode] = React.useState<"focus" | "break">("focus");

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const startTimer = React.useCallback(() => {
    const settingsButtons = document.querySelectorAll(
      "#settingsButton"
    ) as NodeListOf<HTMLButtonElement>;

    settingsButtons.forEach((btn) => {
      btn.disabled = true;
      btn.classList.add("bg-gray-600");
    });

    setTimerStatus("running");
    toast.info("Timer started.");
  }, []);

  const sectionComplete = React.useCallback(async () => {
    setTimerStatus("stopped");

    if (mode === "focus") {
      toast.info("Focus session complete. Enjoy your well deserved break!");
      if (user) {
        try {
          const res = await fetch("/api/user_stats/save_stats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.user_id,
              dataToChange: "pomodoro",
              timeRevised: focusLength,
            }),
          });

          if (res.ok) {
            toast.success(
              `${focusLength} minutes have been added to your stats.`
            );
          } else {
            toast.error("Failed to save stats to profile.");
            const errorData = await res.json();
            console.error("Stats saving error:", errorData.message);
          }
        } catch (error) {
          console.error("Stats saving error (2):", error);
          toast.error("Failed to save stats to profile.");
        }
      } else {
        toast.info("Timer ended. Sign in to track your progress.");
      }

      if (breakLength > 0) {
        setMode("break");
        setCurrentTime(breakLength * 60);
      } else {
        setCurrentTime(focusLength * 60);
      }

    } else {
      toast.info("Break over. Time for another productive focus session!");
      setMode("focus");
      setCurrentTime(focusLength * 60);
    }

    startTimer();
  }, [mode, user, focusLength, breakLength, startTimer]);

  React.useEffect(() => {
    if (timerStatus === "stopped") {
      setCurrentTime(mode === "focus" ? focusLength * 60 : breakLength * 60);
    }
  }, [focusLength, breakLength, mode, timerStatus]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerStatus === "running" && currentTime > 0) {
      interval = setInterval(() => {
        setCurrentTime((oldTime) => {
          const newTime = oldTime - 1;

          if (newTime <= 0) {
            sectionComplete();
            return 0;
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerStatus, currentTime, sectionComplete]);

  // Validation for new settings
  const submitSettings = () => {
    let validCounter = 0;

    const focusInput = document.getElementById(
      "focusLengthInput"
    ) as HTMLInputElement;
    const breakInput = document.getElementById(
      "breakLengthInput"
    ) as HTMLInputElement;

    const newFocus = parseInt(focusInput.value, 10);
    const newBreak = parseInt(breakInput.value, 10);

    if (!isNaN(newFocus) && newFocus >= 5 && newFocus <= 180) {
      setFocusLength(newFocus);
      localStorage.setItem("pomodoroFocusLength", newFocus.toString());

      toast.success("Focus length updated.");
      validCounter += 1;
    } else {
      if (focusInput.value.trim() === "") {
        validCounter += 1;
      } else {
        toast.error("Focus time must be between 5 and 180 minutes.");
      }
    }

    if (!isNaN(newBreak) && newBreak >= 0 && newBreak <= 60) {
      setBreakLength(newBreak);
      localStorage.setItem("pomodoroBreakLength", newBreak.toString());

      toast.success("Break length updated.");
      validCounter += 1;
    } else {
      if (breakInput.value.trim() === "") {
        validCounter += 1;
      } else {
        toast.error("Break time must be between 0 and 60 minutes.");
      }
    }

    if (validCounter === 2) {
      setOpen(false);
    }
  };

  const togglePauseTimer = () => {
    const pauseButton = document.getElementById(
      "pauseButton"
    ) as HTMLButtonElement;

    if (pauseButton.innerText === "Pause") {
      pauseButton.innerText = "Resume";
      setTimerStatus("paused");
      toast.info("Timer paused.");
    } else {
      pauseButton.innerText = "Pause";
      setTimerStatus("running");
      toast.info("Timer resumed.");
    }
  };

  const endTimer = async () => {
    const settingsButtons = document.querySelectorAll(
      "#settingsButton"
    ) as NodeListOf<HTMLButtonElement>;

    settingsButtons.forEach((btn) => {
      btn.disabled = false;
      btn.classList.remove("bg-gray-600");
    });

    setTimerStatus("stopped");
    toast.info("Timer stopped.");

    if (user) {
      try {
        const sessionLength = (focusLength - Math.ceil(currentTime / 60));
        console.log("Session length:", sessionLength);

        const res = await fetch("/api/user_stats/save_stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.user_id,
            dataToChange: "pomodoro",
            timeRevised: sessionLength,
          }),
        });

        if (res.ok) {
          toast.success(
            `Great work! ${sessionLength} minutes have been added to your stats.`
          );
        } else {
          toast.error("Failed to save stats to profile.");
          const errorData = await res.json();
          console.error("Stats saving error:", errorData.message);
        }
      } catch (error) {
        console.error("Stats saving error (2):", error);
        toast.error("Failed to save stats to profile.");
      }
    } else {
      toast.info("Timer ended. Sign in to track your progress.");
    }
  };

  return (
    <>
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold mb-4">Pomodoro Timer</h2>
        {isDesktop ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button id="settingsButton">
                <SlidersHorizontal className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Customise the timer&apos;s settings.
              </DialogDescription>
              <div className="my-4">
                <label
                  className="block text-sm font-medium mb-2"
                  htmlFor="focusLengthInput"
                >
                  {/*htmlFor improves accessibility and targets the input when clicked*/}
                  Focus length (in minutes)
                </label>
                <Input
                  type="number"
                  id="focusLengthInput"
                  placeholder={focusLength.toString()}
                />

                <label
                  className="block text-sm font-medium mb-2 mt-5"
                  htmlFor="breakLengthInput"
                >
                  {/*htmlFor improves accessibility and targets the input when clicked*/}
                  Break length (in minutes)
                </label>
                <Input
                  type="number"
                  id="breakLengthInput"
                  placeholder={breakLength.toString()}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant={"outline"}>Cancel</Button>
                </DialogClose>
                <Button onClick={submitSettings}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button id="settingsButton">
                <SlidersHorizontal className="h-6 w-6" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Settings</DrawerTitle>
              </DrawerHeader>
              <DrawerDescription className="ml-4">
                Customise the timer&apos;s settings.
              </DrawerDescription>
              <DrawerFooter>
                <div className="my-4">
                  <label
                    className="block text-sm font-medium mb-2"
                    htmlFor="focusLengthInput"
                  >
                    {/*htmlFor improves accessibility and targets the input when clicked*/}
                    Focus length (in minutes)
                  </label>
                  <Input
                    type="number"
                    id="focusLengthInput"
                    placeholder={focusLength.toString()}
                  />

                  <label
                    className="block text-sm font-medium mb-2 mt-5"
                    htmlFor="breakLengthInput"
                  >
                    {/*htmlFor improves accessibility and targets the input when clicked*/}
                    Break length (in minutes)
                  </label>
                  <Input
                    type="number"
                    id="breakLengthInput"
                    placeholder={breakLength.toString()}
                  />
                </div>
                <Button onClick={submitSettings}>Submit</Button>
                <DrawerClose asChild>
                  <Button variant={"outline"}>Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
      </div>

      <div className="bg-[#1E56E8]/40 rounded-2xl mt-10 py-12 justify-center items-center flex flex-col">
        <h2
          className="text-6xl mb-3 font-medium inter text-center tabular-nums drop-shadow-lg"
          style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)" }}
        >
          {formatTime(currentTime)}
        </h2>
        <p
          className="text-xs text-center drop-shadow-sm"
          style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)" }}
        >
          {mode === "focus" ? `${breakLength} minute breaks` : "Break active."}
        </p>
      </div>

      <div className="flex justify-center gap-4">
        {timerStatus === "stopped" && (
          <Button
            onClick={startTimer}
            id="startButton"
            className="mt-8 p-7 text-md text-white bg-[#2860ee] hover:bg-[#245be6] drop-shadow-lg"
            style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)" }}
          >
            Let&apos;s go!
          </Button>
        )}
        {(timerStatus === "running" || timerStatus === "paused") && (
          <Button
            onClick={togglePauseTimer}
            id="pauseButton"
            className="mt-8 p-7 text-md text-white bg-[#e39300] hover:bg-[#d38220] drop-shadow-lg"
            style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)" }}
          >
            {timerStatus === "running" ? "Pause" : "Resume"}
          </Button>
        )}
        {(timerStatus === "running" || timerStatus === "paused") && (
          <Button
            onClick={endTimer}
            id="endButton"
            className="mt-8 p-7 text-md text-white bg-red-500 hover:bg-[#d54242] drop-shadow-lg"
            style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)" }}
          >
            Stop
          </Button>
        )}
      </div>

      <Toaster />
    </>
  );
}
export default PomodoroPage;
