import DarkMode from "./UITheme";
import Logo from "./Logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function MainNavbar() {
  return (
    <nav className="border-b">
      <div className="container flex justify-between items-center flex-wrap py-6 gap-4">
        <Logo />

        <div className="flex gap-4 items-center flex-shrink-0">
          <DarkMode />
          <Button variant="outline" asChild size="lg">
            <Link href="/login">Log in</Link>
          </Button>

          <Button asChild size="lg">
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

export default MainNavbar;
