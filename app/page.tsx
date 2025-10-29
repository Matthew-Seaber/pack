import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { NumberTicker } from "@/components/ui/number-ticker";
import { SparklesText } from "@/components/ui/sparkles-text";
import { Particles } from "@/components/ui/particles";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function HomePage() {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center min-h-[80vh]">
        <div className="order-1 lg:order-none">
          <h1 className="text-4xl font-semibold">The Future of</h1>
          <h1 className="text-4xl font-semibold mt-3">Education is Here</h1>
          <p className="text-sm mt-3" style={{ color: "#7D7D7D" }}>
            Level up your learning today, and boost your exam grades to new
            heights! 🚀
          </p>
        </div>
        <div className="lg:col-span-2 flex flex-col lg:flex-row justify-between gap-7 order-1 lg:order-none">
          <div className="relative w-full max-w-4xl aspect-[16/10]">
            <Image
              src="/images/Macbook Mockup - Calendar.png"
              alt="Screenshot of the calendar page on a Macbook"
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 700px"
            />
          </div>
          <div className="relative w-full max-w-48 aspect-[9/19] mx-auto lg:mx-0">
            <Image
              src="/images/iPhone Mockup - Calendar.png"
              alt="Screenshot of the calendar page on an iPhone"
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 40vw, 160px"
            />
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-col items-center">
        <p>SCROLL</p>
        <div className="flex justify-center mt-3 space-x-1">
          <ChevronDown className="animate-bounce" />
          <ChevronDown className="animate-bounce" />
          <ChevronDown className="animate-bounce" />
        </div>
      </div>

      <div className="mt-24 mb-24">
        <div className="text-center mb-16">
          <SparklesText className="mb-8">
            Supercharge Your Study Sessions
          </SparklesText>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to ace your exams, all in one place.
          </p>
        </div>

        <BentoGrid className="mb-16">
          <BentoCard
            name="Smart Insights"
            className="col-span-3 lg:col-span-1"
            background={
              <>
                <Particles
                  className="absolute inset-0"
                  quantity={100}
                  ease={80}
                  color="#8B5CF6"
                  refresh
                />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent pointer-events-none" />
              </>
            }
            Icon={Calendar}
            description="Receive personalised recommendations tailored to your subjects' specifications"
            href="/subjects"
            cta="Get Started"
          />
          <BentoCard
            name="Pomodoro Timer"
            className="col-span-3 lg:col-span-1"
            background={
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative flex items-center justify-center w-full h-full">
                  <div className="flex items-center justify-center rounded-full bg-purple-500/20 backdrop-blur-sm p-4 z-10">
                    <Clock className="h-8 w-8 text-purple-500 animate-pulse" />
                  </div>

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div
                      className="h-20 w-20 rounded-full border-2 border-purple-500/30 animate-ping"
                      style={{ animationDuration: "2s" }}
                    />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div
                      className="h-32 w-32 rounded-full border-2 border-pink-500/20 animate-ping"
                      style={{
                        animationDuration: "3s",
                        animationDelay: "0.5s",
                      }}
                    />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div
                      className="h-44 w-44 rounded-full border-2 border-purple-500/10 animate-ping"
                      style={{ animationDuration: "4s", animationDelay: "1s" }}
                    />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent" />
              </div>
            }
            Icon={Clock}
            description="Stay focused on revision with our free, customisable Pomodoro timer"
            href="/pomodoro"
            cta="Start Timer"
          />
          <BentoCard
            name="Progress Tracking"
            className="col-span-3 lg:col-span-1"
            background={
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-primary/10 to-transparent">
                  <div className="absolute bottom-4 left-4 right-4 h-24 rounded-lg bg-gradient-to-t from-pink-500/30 to-transparent">
                    <div className="flex items-end justify-around h-full px-2 pb-2 gap-1">
                      <div
                        className="w-full bg-pink-500/40 rounded-sm"
                        style={{ height: "40%" }}
                      />
                      <div
                        className="w-full bg-pink-500/40 rounded-sm"
                        style={{ height: "65%" }}
                      />
                      <div
                        className="w-full bg-pink-500/40 rounded-sm"
                        style={{ height: "50%" }}
                      />
                      <div
                        className="w-full bg-pink-500/50 rounded-sm"
                        style={{ height: "85%" }}
                      />
                      <div
                        className="w-full bg-pink-500/60 rounded-sm animate-pulse"
                        style={{ height: "100%" }}
                      />
                    </div>
                  </div>
                </div>
                <TrendingUp className="h-32 w-32 text-pink-500/20" />
              </div>
            }
            Icon={TrendingUp}
            description="Monitor your progress on every level and increase your productivity like never before"
            href="/dashboard"
            cta="View Stats"
          />
        </BentoGrid>

        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 p-12">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
          <div className="relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <NumberTicker
                  value={3}
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
                />
                <div className="text-sm text-muted-foreground">
                  Active Students
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  100%
                </div>
                <div className="text-sm text-muted-foreground">
                  Satisfaction Rate
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-primary bg-clip-text text-transparent">
                  6
                </div>
                <div className="text-sm text-muted-foreground">
                  UK Exam Boards
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                  30
                </div>
                <div className="text-sm text-muted-foreground">
                  Subjects Supported
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 border-2 border-background" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-background" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-primary border-2 border-background" />
            </div>
            <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
              <span className="text-sm font-medium">
                Join a couple of students achieving their dreams!
              </span>
              <ChevronRight className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
            </AnimatedShinyText>
          </Link>
        </div>
      </div>

      <div className="w-full flex justify-center mt-24 py-8 border-t border-border">
        <p className="text-xs font-medium text-[#B4B4B4]">
          By accessing this website, you agree to our{" "}
          <a
            href="/terms"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </>
  );
}

export default HomePage;
