import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container min-h-[60vh] flex flex-col items-center justify-center">
      <div className="text-center space-y-6">
        <div className="text-8xl font-bold text-primary">404</div>
        <h1 className="text-3xl mono font-semibold text-foreground">
          Page Not Found
        </h1>

        <p className="text-lg text-muted-foreground max-w-md">
          The page you&apos;re looking for doesn&apos;t exist. If you believe
          this is an error, please contact us below.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
          <Button asChild size="lg">
            <Link href="/">Go Home</Link>
          </Button>

          <Button variant="outline" asChild size="lg">
            <Link href="/support">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
