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
import { Toaster, toast } from "sonner";

function LinksDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex gap-4 max-w-[100px]">
          <UserIcon />
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
