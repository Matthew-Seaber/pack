"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SlidersHorizontal } from "lucide-react";

function PomodoroPage() {
    const [open, setOpen] = React.useState(false);
    const isDesktop = typeof window !== 'undefined' && window.matchMedia("(min-width: 768px)").matches;

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
                        <DialogTitle>
                        Settings
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Customise the timer&apos;s settings.
                    </DialogDescription>
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
                        <DrawerTitle>
                        Settings
                        </DrawerTitle>
                    </DrawerHeader>
                    <DrawerDescription>
                        Customise the timer&apos;s settings.
                    </DrawerDescription>
                </DrawerContent>
            </Drawer>
        )}
      </div>

      <div className="bg-[#1E56E8]/40 rounded-2xl mt-10 p-10 justify-center items-center flex flex-col mx-auto aspect-[3/2] w-80">
        <h2
          className="text-6xl mb-3 font-medium inter text-center tabular-nums drop-shadow-lg"
          style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)" }}
        >
          20:00
        </h2>
        <p
          className="text-xs text-center drop-shadow-sm"
          style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)" }}
        >
          5 minute breaks
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          asChild
          className="mt-8 text-white bg-[#2860ee] hover:bg-[#245be6] jus drop-shadow-lg"
          style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)" }}
        >
          <a>Let&apos;s go!</a>
        </Button>
      </div>
    </>
  );
}
export default PomodoroPage;
