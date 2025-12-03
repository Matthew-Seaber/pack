"use client";

import { Button } from "@/components/ui/button";

export default function LogoutButton() {

  const handleLogout = async () => {
    // Clear cached user role
    sessionStorage.removeItem("userRole");

    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/"; // Hard redirect to home page
  };

  return (
    <Button type="button" onClick={handleLogout}>
      Log out
    </Button>
  );
}
