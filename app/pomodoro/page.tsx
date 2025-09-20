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
  const [open, setOpen] = React.useState(false);
  const isDesktop =
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 768px)").matches;

  let focusLength = 25;
  let breakLength = 5;
  let validCounter = 0;

  return (
    <>
      <div className="container flex justify-between">
        <h2 className="text-2xl font-semibold mb-4">Pomodoro Timer</h2>
        {isDesktop ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
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
                <Button
                  onClick={() => {
                    const focusInput = document.getElementById(
                      "focusLengthInput"
                    ) as HTMLInputElement;
                    const breakInput = document.getElementById(
                      "breakLengthInput"
                    ) as HTMLInputElement;

                    const newFocus = parseInt(focusInput.value, 10);
                    const newBreak = parseInt(breakInput.value, 10);

                    if (!isNaN(newFocus) && newFocus >= 5 && newFocus <= 180) {
                      focusLength = newFocus;

                      toast.success("Focus length updated");
                      validCounter += 1;
                    } else {
                      if (focusInput.value.trim() === "") {
                        validCounter += 1;
                      } else {
                        toast.error(
                          "Focus time must be between 5 and 180 minutes"
                        );
                      }
                    }

                    if (!isNaN(newBreak) && newBreak >= 0 && newBreak <= 60) {
                      breakLength = newBreak;

                      toast.success("Break length updated");
                      validCounter += 1;
                    } else {
                      if (breakInput.value.trim() === "") {
                        validCounter += 1;
                      } else {
                        toast.error("Break time must be between 0 and 60 minutes");
                      }
                    }

                    if (validCounter === 2) {
                      setOpen(false);
                    }

                    validCounter = 0;
                  }}
                >
                  Submit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer>
            <DrawerTrigger asChild>
              <Button>
                <SlidersHorizontal className="h-6 w-6" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Settings</DrawerTitle>
              </DrawerHeader>

              <DrawerDescription>
                Customise the timer&apos;s settings.
              </DrawerDescription>
              <DrawerFooter>
                <Button>Submit</Button>
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
          {focusLength}:00
        </h2>
        <p
          className="text-xs text-center drop-shadow-sm"
          style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)" }}
        >
          {breakLength} minute breaks
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          className="mt-8 p-7 text-md text-white bg-[#2860ee] hover:bg-[#245be6] drop-shadow-lg"
          style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)" }}
        >
          Let&apos;s go!
        </Button>
      </div>

      <Toaster />
    </>
  );
}
export default PomodoroPage;
