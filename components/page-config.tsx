"use client";

import { usePathname } from "next/navigation";
import Providers from "../app/providers";
import Navbar from "./navbar/Navbar";

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

  // On all other pages, render with providers and navbar
  return (
    <Providers>
      <Navbar />
      <main className="container py-10">{children}</main>
    </Providers>
  );
}
