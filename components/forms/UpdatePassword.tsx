"use client";

import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

type Props = {
  userID: string;
};

export default function PasswordFormClient({
  userID,
}: Props) {
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const [oldPassword, setOldPassword] = useState<string>("");
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  const commonPasswordList = [
    "password1!",
    "Password1!",
    "password123!",
    "Password123!",
    "Qwerty123!",
  ]; // Common passwords which meet all other password requirements
  const numberList = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]; // List of numbers the password must contain
  const letterList = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ]; // List of letters the password must contain
  const specialCharacters = ["!", "@", "#", "$", "%", "^", "&", "*"]; // List of special characters the password must contain

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newPassword = password.trim();

    if (!newPassword || newPassword === "" || !oldPassword || oldPassword === "" || !passwordConfirm || passwordConfirm === "") {
      toast.error("Field(s) cannot be empty.");
      return;
    }

    if (newPassword !== passwordConfirm) {
      toast.error("New passwords do not match.");
      return;
    }

    const containsNumber = numberList.some((num) => password.includes(num)); // Using "num" since "number" is reserved in TS
    const containsLetter = letterList.some((letter) =>
      password.toLowerCase().includes(letter)
    );
    const containsSpecialCharacter = specialCharacters.some((character) =>
      password.includes(character)
    );

    // Same validation as in sign up
    if (password.length < 8) {
      // Validation for password length
      toast.error("Password must be at least 8 characters long.");
      return;
    } else if (commonPasswordList.includes(password)) {
      // Validation for password strength #1
      toast.error("Your password is a common password.");
      return;
    } else if (password.includes(" ")) {
      // Validation for password strength #2
      toast.error("Password cannot contain spaces.");
      return;
    } else if (
      !containsNumber ||
      !containsLetter ||
      !containsSpecialCharacter
    ) {
      // Validation for password strength #3
      toast.error(
        "Password must contain a combination of letters, numbers, and special characters."
      );
      return;
    }

    try {
      const res = await fetch("/api/user/settings/set_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, newPassword, oldPassword }),
      });

      if (res.ok) {
        toast.success("Successfully updated your password.");
        setPassword("");
        setOldPassword("");
        dialogCloseRef.current?.click();
        setTimeout(() => {
            window.location.reload();
        }, 1000);
      } else {
        const body = await res.json().catch(() => ({}));
        console.error("Update password error:", body);
        toast.error("Error updating password; please try again later.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating password; please try again later.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="my-4">
        <label
          className="block text-sm font-medium mb-2"
          htmlFor="oldPasswordInput"
        >
          Enter your current password
        </label>
        <Input
          type="password"
          name="oldPasswordInput"
          placeholder="********"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
      </div>
      <div className="mt-7 mb-4">
        <label
          className="block text-sm font-medium mb-2"
          htmlFor="newPasswordInput"
        >
          Enter a new password
        </label>
        <Input
          type="password"
          name="newPasswordInput"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="mt-4 mb-6">
        <label
          className="block text-sm font-medium mb-2"
          htmlFor="newPasswordConfirmInput"
        >
          Confirm your new password
        </label>
        <Input
          type="password"
          name="newPasswordConfirmInput"
          placeholder="Repeat new password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />
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
