import type { ReactNode } from "react";
import Providers from "@/app/providers";

export default function FullScreenLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <Providers><div className="min-h-screen flex bg-background">{children}</div></Providers>;
}
