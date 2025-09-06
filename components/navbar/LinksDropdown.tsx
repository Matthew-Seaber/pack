"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
// import { LuAlignLeft } from "react-icons/lu";
import Link from "next/link";
import { Button } from "../ui/button";
import UserIcon from "./UserIcon";
import { links } from "@/utils/links";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster, toast } from "sonner";
import { useEffect, useState } from "react";

function LinksDropdown() {
  const [firstName, setFirstName] = useState<string>(""); // Empty until GET request returns name
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          setFirstName(userData.first_name || ""); // Empty if GET request doesn't contain first name
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }

      setAuthLoading(false);
    };

    fetchUserData();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex gap-4 max-w-[200px]">
          {authLoading ? (
            <>
              <Skeleton className="w-16 h-5" />
              <Skeleton className="w-5 h-5 rounded-full" />
            </>
          ) : (
            <>
              <p>{firstName}</p>
              <UserIcon />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-30" align="start" sideOffset={10}>
        <DropdownMenuItem>
          <Link href="/pricing" className="capitalize w-full">
            🚀 UPGRADE
          </Link>
        </DropdownMenuItem>
        {links.map((link) => {
          return (
            <DropdownMenuItem key={link.href}>
              <Link href={link.href} className="capitalize w-full">
                {link.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <button
            className="transform-none w-full text-left" // 'w-full' makes sure the entire button is clickable (not just test), as the normal button component isn't being used here
            onClick={async () => {
              toast.info("Logging out...");
              await fetch("/api/logout", { method: "POST" });
              window.location.href = "/";
            }}
          >
            Log out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
      <Toaster />
    </DropdownMenu>
  );
}

export default LinksDropdown;
