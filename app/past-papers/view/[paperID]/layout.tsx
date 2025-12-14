import type { ReactNode } from "react";

export default function FullScreenLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-black">
      {children}
    </div>
  );
}
