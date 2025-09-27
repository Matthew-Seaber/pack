"use client";

import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

type Props = {
  userID: string;
  currentEmail: string;
};

export default function EmailFormClient({
  userID,
  currentEmail,
}: Props) {
  const [email, setEmail] = useState<string>("");
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newEmail = email.trim();

    if (!newEmail || newEmail === "") {
      toast.error("Field cannot be empty.");
      return;
    }

    // Same validation as in sign up
    if (!newEmail.includes("@") || !newEmail.includes(".")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      const res = await fetch("/api/user/settings/set_email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, newEmail }),
      });

      if (res.ok) {
        toast.success("Successfully updated your email.");
        setEmail("");
        dialogCloseRef.current?.click();
        setTimeout(() => {
            window.location.reload();
        }, 1000);
      } else {
        const body = await res.json().catch(() => ({}));
        console.error("Update email error:", body);
        toast.error("Error updating email; please try again later.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating email; please try again later.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-4 mb-6">
        <label
          className="block text-sm font-medium mb-2"
          htmlFor="newEmailInput"
        >
          Enter a new email address
        </label>
        <Input
          type="email"
          name="newEmailInput"
          placeholder={currentEmail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <DialogClose asChild ref={dialogCloseRef}>
          <Button
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">
          Submit
        </Button>
      </div>
    </form>
  );
}
