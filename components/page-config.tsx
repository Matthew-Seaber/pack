"use client";

import { usePathname } from "next/navigation";
import Providers from "../app/providers";
import Navbar from "./navbar/Navbar";
import MainNavbar from "./navbar/MainNavbar";

export default function ConditionalContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // On login and signup page, only render the children without providers/navbar
  if (pathname === "/login" || pathname === "/signup") {
    return <>{children}</>;
  }

  const authenticatedPages = ["/dashboard"];
  const isAuthenticatedPage = authenticatedPages.includes(pathname);

  if (isAuthenticatedPage) {
    return (
      <Providers>
        <Navbar />
        <main className="max-w-[1600px] mx-auto px-6 py-10">{children}</main>
      </Providers>
    );
  }

  // Different navbar for users who aren't logged in or accessing publically-available pages
  return (
    <Providers>
      <MainNavbar />
      <main className="max-w-[1600px] mx-auto px-6 py-10">{children}</main>
    </Providers>
  );
}
