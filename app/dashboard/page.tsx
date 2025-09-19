import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Dashboard() {
  const user = await getUser();

  if (!user) {
    // Backup since middleware should ensure the user exists and is logged in
    redirect("/login");
  }

  const hour = new Date().getHours();
  let greeting;

  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 18) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }

  return (
    <>
      <div className="mb-10">
        {/* Header */}
        <h1 className="text-4xl font-semibold mb-5">
          {greeting}, {user.first_name}!
        </h1>
        <p>Here&apos;s everything you need to know...</p>
      </div>
      <div>
        {/* Main content */}
        {user.role === "Student" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Card
              className="md:col-span-1 md:row-span-2 flex flex-col p-4"
              style={{ outline: "2px solid #1E56E8" }}
            >
              <p className="text-sm text-muted-foreground text-center mb-4">
                UP NEXT
              </p>
              <h2 className="text-3xl font-medium">Music Lesson</h2>
              <Separator className="my-2 w-1/4" />
              <div className="flex gap-2 mt-1">
                <Badge
                  backgroundColour="rgba(255, 204, 63, 0.36)"
                  textColour="#FFDB49"
                  className="w-auto px-3 py-1"
                >
                  Music
                </Badge>
                <Badge
                  backgroundColour="rgba(223, 97, 210, 0.36)"
                  textColour="#FF66DD"
                  className="w-auto px-3 py-1"
                >
                  ⛳ In-person
                </Badge>
              </div>
              <div className="my-4 space-y-3 text-sm font-medium">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" strokeWidth={2.5} />
                  <p>School, Room C02</p>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" strokeWidth={2.5} />
                  <p>Starts: 10:45 AM</p>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" strokeWidth={2.5} />
                  <p>Ends: 11:45 AM</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                FROM TEACHER: This lesson we&apos;ll cover some of pop&apos;s
                most inspiring musicians with special guest Miss Carpenter, an
                upcoming artist in the local area! If you want to support her,
                she&apos;s performing her new single “Espresso” at the village
                hall next Tuesday.
              </p>
              <Button
                asChild
                className="mt-4 text-white bg-[#1E56E8] hover:bg-[#1850df] drop-shadow-lg"
                style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)" }}
              >
                <a href="/calendar">Open Calendar</a>
              </Button>
            </Card>
            <Card
              className="flex flex-col p-4"
              style={{ outline: "2px solid #FF5842" }}
            >
              <p className="text-sm text-muted-foreground text-center mb-4">
                UPCOMING TESTS
              </p>
            </Card>
            <Card
              className="flex flex-col p-4"
              style={{ outline: "2px solid #42FF6B" }}
            >
              <p className="text-sm text-muted-foreground text-center mb-4">
                UPCOMING HOMEWORK
              </p>
            </Card>
            <Card
              className="flex flex-col p-4"
              style={{ outline: "2px solid #42E3FF" }}
            >
              <p className="text-sm text-muted-foreground text-center mb-4">
                YOUR STATS
              </p>
            </Card>
            <Card
              className="flex flex-col p-4"
              style={{ outline: "2px solid #FFD338" }}
            >
              <p className="text-sm text-muted-foreground text-center mb-4">
                RECOMMENDED REVISION
              </p>
            </Card>
            <Card
              className="flex flex-col p-4"
              style={{ outline: "2px solid #B342FF" }}
            >
              <p className="text-sm text-muted-foreground text-center mb-4">
                TO DO LIST
              </p>
            </Card>
            <Card
              className="flex flex-col p-4"
              style={{ outline: "2px solid #EAA080" }}
            >
              <p className="text-sm text-muted-foreground text-center mb-4">
                QUOTE OF THE WEEK
              </p>
              <div
                className="bg-[#FFCC91]/20 rounded-md p-3"
                style={{ color: "#FFE0A6" }}
              >
                <p className="text-[13px] font-regular italic mb-2">
                  &quot;Confidence is the most beautiful thing you can
                  possess.&quot;
                </p>
                <p
                  className="text-xs font-thin"
                  style={{ transform: "translateX(3px)" }}
                >
                  - Sabrina Carpenter
                </p>
              </div>
            </Card>
            <Card
              className="flex flex-col p-4"
              style={{ outline: "2px solid #5E42FF" }}
            >
              <p className="text-sm text-muted-foreground text-center mb-4">
                POMODORO TIMER
              </p>
              <h2 className="my-3 text-6xl font-medium inter text-center tabular-nums">
                20:00
              </h2>
              <p className="text-xs text-center">5 minute breaks</p>
              <Button
                asChild
                className="mt-8 text-white bg-[#544EE9] hover:bg-[#4c46e1] drop-shadow-lg"
                style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)" }}
              >
                <a href="/pomodoro">Let&apos;s go!</a>
              </Button>
            </Card>
          </div>
        ) : user.role === "Teacher" ? (
          <p>3</p>
        ) : (
          <h2>Error with your role. Please contact support.</h2>
        )}
      </div>
    </>
  );
}
