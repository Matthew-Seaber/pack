"use client";

import DarkMode from "./UITheme";
import Logo from "./Logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

function MainNavbar() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch('/api/user');
        setIsAuthenticated(response.ok);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }

      setAuthLoading(false);
    };

    checkAuthentication();
  }, []);

  return (
    <nav className="border-b">
      <div className="container flex justify-between flex-wrap py-6 gap-4">
        <Logo />

        <div className="flex gap-4 items-center flex-shrink-0">
          <DarkMode />
          {authLoading ? (
            <Skeleton className="w-36 h-10" />
          ) : isAuthenticated ? (
            <Button asChild size="lg">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild size="lg">
                <Link href="/login">Log in</Link>
              </Button>

              <Button asChild size="lg">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default MainNavbar;
