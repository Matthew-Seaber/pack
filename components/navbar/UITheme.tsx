"use client";

import * as React from "react";
import { Moon, Sun, } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ModeToggle() {
  const { setTheme } = useTheme();

  const themeChange = (theme: string) => {
    setTheme(theme);
    // Refreshes page after updating theme to ensure it updates all UI elements
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>{" "}
          {/* Text for screen readers only - helps with accessibility */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => themeChange("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => themeChange("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => themeChange("high-contrast")}>
          High contrast
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => themeChange("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
