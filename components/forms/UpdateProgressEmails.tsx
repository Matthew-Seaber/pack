"use client";

import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

type Props = {
  userID: string;
  state: string;
};

export default function EmailFormClient({ userID, state }: Props) {
  const [newState, setNewState] = useState<string>(state);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("/api/user/settings/set_progress_emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, newState }),
      });

      if (res.ok) {
        toast.success("Successfully updated your progress email settings.");
        dialogCloseRef.current?.click();
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const body = await res.json().catch(() => ({}));
        console.error("Update progress emails permission error:", body);
        toast.error(
          "Error updating progress emails permission; please try again later."
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(
        "Error updating progress emails permission; please try again later."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="my-4">
        <div className="flex justify-between mb-6">
          <label
            className="block text-sm font-medium"
            htmlFor="newProgressEmailsInput"
          >
            Emails
          </label>
          <Switch
            name="newProgressEmailsInput"
            checked={newState === "Enabled"}
            onCheckedChange={(checked) =>
              setNewState(checked ? "Enabled" : "Disabled")
            }
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <DialogClose asChild ref={dialogCloseRef}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
