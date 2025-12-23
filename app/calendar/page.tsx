"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ChevronDownIcon,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Fab } from "@/components/ui/fab";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

export default function CalendarPage() {
  interface CalendarEvent {
    id: string;
    name: string;
    description: string | null;
    start: string;
    end: string;
    type:
      | "Revision/Homework"
      | "Exam"
      | "School/Lesson"
      | "Work"
      | "Break"
      | "Appointment/Club"
      | "Food"
      | "Lesson"
      | "Staff Meeting"
      | "Parent Meeting"
      | "Marking"
      | "Lesson Prep/Planning"
      | "Supervision"
      | "Other";
    subject_id: string | null;
    location_type: "In-person" | "Virtual" | null;
    location: string | null;
  }

  interface Subject {
    id: string;
    name: string;
  }

  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [calendarOpen1, setCalendarOpen1] = React.useState(false);
  const [calendarOpen2, setCalendarOpen2] = React.useState(false);
  const [eventName, setEventName] = React.useState("");
  const [eventDescription, setEventDescription] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    new Date()
  );
  const [startTime, setStartTime] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<Date | undefined>(new Date());
  const [endTime, setEndTime] = React.useState<string>("");
  const [eventType, setEventType] = React.useState<string>("");
  const [eventSubject, setEventSubject] = React.useState<string>("");
  const [eventLocationType, setEventLocationType] = React.useState<string>("");
  const [eventLocation, setEventLocation] = React.useState<string>("");
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [startOfWeek, setStartOfWeek] = React.useState<Date>(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dayOfWeek = now.getDay();

    if (dayOfWeek !== 0) {
      now.setDate(now.getDate() - dayOfWeek);
    }

    return now;
  });
  const [theme, setTheme] = React.useState<string | null>(null);
  const [currentMinutes, setCurrentMinutes] = React.useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });
  const router = useRouter();

  // Gets theme from localStorage and listens for changes
  React.useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    setTheme(storedTheme);
  }, []);

  React.useEffect(() => {
    if (theme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, [theme]);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const hours = [
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
  ];
  const eventTypeColours = {
    "Revision/Homework": { border: "border-[#1EFF78]", bg: "bg-[#1EFF78]/30" },
    Exam: { border: "border-[#1EFFFF]", bg: "bg-[#1EFFFF]/30" },
    "School/Lesson": { border: "border-[#1EA0FF]", bg: "bg-[#1EA0FF]/30" },
    Work: { border: "border-[#FFA51E]", bg: "bg-[#FFA51E]/30" },
    Break: { border: "border-[#D21EFF]", bg: "bg-[#D21EFF]/30" },
    "Appointment/Club": { border: "border-[#FF541E]", bg: "bg-[#FF541E]/30" },
    Food: { border: "border-[#FFC01E]", bg: "bg-[#FFC01E]/30" },
    Lesson: { border: "border-[#FFC01E]", bg: "bg-[#FFC01E]/30" },
    "Staff Meeting": { border: "border-[#x]", bg: "bg-[#x]/30" },
    "Parent Meeting": { border: "border-[#x]", bg: "bg-[#x]/30" },
    Marking: { border: "border-[#x]", bg: "bg-[#x]/30" },
    "Lesson Prep/Planning": { border: "border-[#x]", bg: "bg-[#x]/30" },
    Supervision: { border: "border-[#x]", bg: "bg-[#x]/30" },
    Other: { border: "border-[#A91EFF]", bg: "bg-[#A91EFF]/30" },
  };

  const month = startOfWeek.toLocaleDateString("en-GB", { month: "long" });
  const year = startOfWeek.getFullYear();

  const handlePreviousWeek = () => {
    setStartOfWeek((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setStartOfWeek((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  };

  const handlePreviousDay = () => {
    setStartOfWeek((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setStartOfWeek((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 1);
      return newDate;
    });
  };

  const handleJumpToToday = () => {
    setStartOfWeek(() => {
      const newDate = new Date();
      newDate.setHours(0, 0, 0, 0);
      const dayOfWeek = newDate.getDay();

      if (dayOfWeek !== 0) {
        newDate.setDate(newDate.getDate() - dayOfWeek);
      }

      return newDate;
    });
  };

  React.useEffect(() => {
    const onTKeyDown = (e: KeyboardEvent) => {
      if (e.key === "T" || e.key === "t") handleJumpToToday();
    };

    window.addEventListener("keydown", onTKeyDown);
    return () => {
      window.removeEventListener("keydown", onTKeyDown);
    };
  }, []);

  React.useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    };

    const interval = setInterval(updateCurrentTime, 1 * 60 * 1000); // Updates current time line every 1 minute
    return () => clearInterval(interval);
  }, []);

  // Function to handle adding a new calendar event
  const handleAddEvent = async () => {
    // Validate fields
    if (!eventName.trim()) {
      toast.error("Event name is required.");
      return;
    }

    const finalLocationType = eventLocationType || 0; // Sets default location type to 0 if none selected

    try {
      // Combine start date and time into a timestampz
      let startTimestamp: string | null = null;
      let endTimestamp: string | null = null;

      if (startDate) {
        const combinedDate = new Date(startDate);
        if (startTime) {
          const [hours, minutes] = startTime.split(":");
          combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          // Default to end of day if no time is selected
          combinedDate.setHours(23, 59, 59, 999);
        }

        startTimestamp = combinedDate.toISOString();
      } else {
        toast.error("Start date is required.");
        return;
      }

      if (endDate) {
        const combinedDate = new Date(endDate);
        if (endTime) {
          const [hours, minutes] = endTime.split(":");
          combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          // Default to end of day if no time is selected
          combinedDate.setHours(23, 59, 59, 999);
        }

        endTimestamp = combinedDate.toISOString();
      } else {
        toast.error("Start date is required.");
        return;
      }

      if (startTimestamp >= endTimestamp) {
        toast.error("End date/time must be after the start date/time.");
        return;
      }

      const response = await fetch("/api/calendar/add_event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eventName.trim(),
          description: eventDescription.trim() || null,
          start: startTimestamp,
          end: endTimestamp,
          type: eventType || null,
          subjectID: eventSubject || null,
          locationType: finalLocationType || 0,
          location: eventLocation?.trim() || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Event added!");

        const newEvent = data.event;
        setEvents((previous) =>
          previous ? [...previous, newEvent] : [newEvent]
        );

        // Reset form fields
        setEventName("");
        setEventDescription("");
        setStartDate(new Date());
        setStartTime("");
        setEndDate(new Date());
        setEndTime("");
        setEventType("");
        setEventSubject("");
        setEventLocationType("");
        setEventLocation("");
        setSheetOpen(false);

        setTimeout(() => window.location.reload(), 500); // Gives the user time to read the toast
      } else {
        console.error("Failed to add event:", response.statusText);
        toast.error("Failed to add event. Please try again later.");
      }
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error("Error adding event. Please try again later.");
    }
  };

  // Function to convert a given timestamp to a UX-friendly format
  const formatTimestamp = (timestamp: string, type: number): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const year = now.getFullYear();
    const inputYear = date.getFullYear();

    const day = date.getDate();
    const shortMonth = date.toLocaleDateString("en-GB", { month: "short" });
    const time = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    if (type === 1) {
      // Include year if it's not due the current year
      if (inputYear !== year) {
        return `${day} ${shortMonth} ${inputYear}, ${time}`;
      } else {
        return `${day} ${shortMonth}, ${time}`;
      }
    } else if (type === 2) {
      return `${day} ${month} ${inputYear}`;
    } else {
      return `${day} ${month} ${inputYear}`;
    }
  };
  // Function to render events for a given day (with colours based on their type)
  const renderDay = (day: Date) => {
    if (!events) return null;

    const eventsToRender = events.filter(
      (e) => new Date(e.start).toDateString() === day.toDateString()
    );

    return eventsToRender.map((event) => {
      const hourHeight = 60; // Height for each hour (in pixels)
      const colours =
        eventTypeColours[event.type as keyof typeof eventTypeColours] ||
        eventTypeColours["Other"]; // Fallback to "Other" if error getting an event's corresponding colour

      const startTime = new Date(event.start);
      const endTime = new Date(event.end);
      const now = new Date();

      const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
      const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();

      const distanceFromTop = startMinutes * (hourHeight / 60);
      const eventHeight = (endMinutes - startMinutes) * (hourHeight / 60) - 4; // Adds a small gap between events for visual clarity

      const isPastEvent = endTime < now;

      return (
        <div
          key={event.id}
          className={`absolute left-0 right-0 flex items-start justify-between border-l-4 ${
            colours.border
          } ${colours.bg} rounded-md p-2 text-foreground/97 mr-1 ${
            isPastEvent ? "opacity-50" : ""
          }`}
          style={{ top: `${distanceFromTop}px`, height: `${eventHeight}px` }}
        >
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold"
              style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
            >
              {event.name.length > 30
                ? event.name.slice(0, 30) + "..."
                : event.name}
            </p>
            {event.location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                <p className="text-xs">{event.location}</p>
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  // Get user data using API and then get events
  React.useEffect(() => {
    const fetchEventsAndSubjects = async () => {
      try {
        // Gets calendar events via API call
        const eventsResponse = await fetch("/api/calendar/get_events", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!eventsResponse.ok) {
          console.error("Error getting events:", eventsResponse.statusText);
          toast.error(
            "Error getting your calendar events. Please try again later."
          );
          setEvents(null);
        } else {
          const responseData = await eventsResponse.json();
          setUserRole(responseData.userRole);
          setEvents(responseData.events);
        }

        const subjectsResponse = await fetch("/api/subjects/get_subjects", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!subjectsResponse.ok) {
          console.error("Error getting subjects:", subjectsResponse.statusText);
          toast.error("Error getting your subjects. Please try again later.");
          setSubjects(null);
        } else {
          const subjectsData = await subjectsResponse.json();
          setSubjects(subjectsData.subjects);
        }
      } catch (error) {
        console.error("Error getting events or subjects:", error);
        toast.error(
          "Error getting your calendar data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEventsAndSubjects();
  }, [router]);

  if (loading) {
    return (
      <>
        <h2 className="text-2xl font-semibold mb-3">Calendar</h2>
        <p>Keep on top of your study and personal life.</p>

        <h2 className="mt-6 mb-3 text-sm">
          <Spinner className="inline mr-2" />
          <i>Loading calendar...</i>
        </h2>
      </>
    );
  }

  return (
    <>
      <h2 className="text-3xl mb-3">
        <span className="font-semibold text-foreground/95">{month}</span>{" "}
        <span className="font-normal text-foreground/90">{year}</span>
      </h2>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Fab className="hover:rotate-180 transition-transform duration-700 z-10">
            <Plus />
          </Fab>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add event</SheetTitle>
            <SheetDescription>
              Add a new event to your calendar
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <div className="flex flex-col gap-3 mb-5">
              <Label className="px-1" htmlFor="name">
                Name *
              </Label>
              <Input
                id="name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3 mb-5">
              <Label className="px-1" htmlFor="description">
                Description
              </Label>
              <Input
                id="description"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
              />
            </div>
            <div className="mb-5">
              <div className="flex gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="datePicker1" className="px-1">
                    Start date *
                  </Label>
                  <Dialog open={calendarOpen1} onOpenChange={setCalendarOpen1}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        id="datePicker1"
                        className="w-32 justify-between font-normal"
                      >
                        {startDate
                          ? startDate.toLocaleDateString()
                          : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-auto max-w-fit">
                      <DialogHeader>
                        <DialogTitle>Select start date</DialogTitle>
                      </DialogHeader>
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(selectedDate) => {
                          setStartDate(selectedDate);
                          setCalendarOpen1(false);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="timePicker1" className="px-1">
                    Start time *
                  </Label>
                  <Input
                    type="time"
                    id="timePicker1"
                    step="60" // Hours and minutes
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="datePicker2" className="px-1">
                    End date *
                  </Label>
                  <Dialog open={calendarOpen2} onOpenChange={setCalendarOpen2}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        id="datePicker2"
                        className="w-32 justify-between font-normal"
                      >
                        {endDate ? endDate.toLocaleDateString() : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-auto max-w-fit">
                      <DialogHeader>
                        <DialogTitle>Select end date</DialogTitle>
                      </DialogHeader>
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(selectedDate) => {
                          setEndDate(selectedDate);
                          setCalendarOpen2(false);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="timePicker2" className="px-1">
                    End time *
                  </Label>
                  <Input
                    type="time"
                    id="timePicker2"
                    step="60" // Hours and minutes
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </div>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex gap-4">
                <div className="flex flex-col gap-3 flex-1">
                  <Label
                    className="px-1 whitespace-nowrap"
                    htmlFor="locationType"
                  >
                    Location type
                  </Label>
                  <Select
                    value={eventLocationType}
                    onValueChange={setEventLocationType}
                  >
                    <SelectTrigger id="locationType">
                      <SelectValue placeholder="None selected" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In-person">In-person</SelectItem>
                      <SelectItem value="Virtual">Virtual</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  <Label className="px-1" htmlFor="Location">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={eventLocation}
                    placeholder="Empty"
                    onChange={(e) => setEventLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="mb-5">
              <div className="flex gap-4">
                <div className="flex flex-col gap-3 flex-1">
                  <Label className="px-1" htmlFor="type">
                    Category
                  </Label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Other" />
                    </SelectTrigger>
                    <SelectContent>
                      {userRole === "Student" ? (
                        <>
                          <SelectItem value="Revision/Homework">
                            Revision/Homework
                          </SelectItem>
                          <SelectItem value="Exam">Exam</SelectItem>
                          <SelectItem value="School/Lesson">
                            School/Lesson
                          </SelectItem>
                          <SelectItem value="Work">Work</SelectItem>
                          <SelectItem value="Break">Break</SelectItem>
                          <SelectItem value="Appointment/Club">
                            Appointment/Club
                          </SelectItem>
                          <SelectItem value="Food">Food</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </>
                      ) : userRole === "Teacher" ? (
                        <>
                          <SelectItem value="Lesson">Lesson</SelectItem>
                          <SelectItem value="Staff Meeting">
                            Staff Meeting
                          </SelectItem>
                          <SelectItem value="Parent Meeting">
                            Parent Meeting
                          </SelectItem>
                          <SelectItem value="Marking">Marking</SelectItem>
                          <SelectItem value="Lesson Prep/Planning">
                            Lesson Prep/Planning
                          </SelectItem>
                          <SelectItem value="Supervision">
                            Supervision
                          </SelectItem>
                          <SelectItem value="Break">Break</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </>
                      ) : null}
                    </SelectContent>
                  </Select>
                </div>
                {userRole === "Student" && (
                  <div className="flex flex-col gap-3 flex-1">
                    <Label className="px-1" htmlFor="subject">
                      Subject
                    </Label>
                    <Select
                      value={eventSubject}
                      onValueChange={setEventSubject}
                    >
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects && subjects.length > 0 ? (
                          subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-subjects" disabled>
                            No subjects available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button className="mt-2 sm:mt-0" onClick={handleAddEvent}>
              Add event
            </Button>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Desktop calendar page controls */}
      <div className="hidden md:flex items-center justify-between mb-3 text-foreground/95">
        <Button variant="outline" onClick={handlePreviousWeek}>
          <ChevronLeft />
          Previous Week
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={handleJumpToToday}>
                Jump to today
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <KbdGroup>
                <Kbd>T</Kbd>
              </KbdGroup>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button variant="outline" onClick={handleNextWeek}>
          Next Week
          <ChevronRight />
        </Button>
      </div>

      {/* Mobile calendar page controls */}
      <div className="md:hidden flex items-center justify-between mb-3 text-foreground/95">
        <Button variant="outline" size="sm" onClick={handlePreviousDay}>
          <ChevronLeft />
          Previous
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={handleJumpToToday}>
                Jump to today
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <KbdGroup>
                <Kbd>T</Kbd>
              </KbdGroup>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button variant="outline" size="sm" onClick={handleNextDay}>
          Next
          <ChevronRight />
        </Button>
      </div>

      {/* Mobile: 2-day view */}
      <div className="md:hidden overflow-y-auto h-[calc(100vh-16rem)] border border-border rounded-lg">
        <div className="flex">
          <div className="flex flex-col pt-14 flex-shrink-0 w-12 sticky left-0 bg-background z-10">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[60px] px-1 text-[10px] text-muted-foreground flex items-start justify-center border-r border-border"
              >
                {hour}
              </div>
            ))}
          </div>
          {daysOfWeek.slice(0, 2).map((day, idx) => {
            const index = idx;
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + index + 1);
            const dayOfMonth = dayDate.getDate();
            const isToday =
              dayDate.toDateString() === new Date().toDateString();

            return (
              <div key={index} className="flex-1 border-l border-border">
                <div
                  className={`h-14 flex flex-col px-2 py-1 justify-end border-b border-border sticky top-0 z-10 ${
                    isToday
                      ? theme === "dark"
                        ? "bg-[#0A1731]"
                        : theme === "light"
                        ? "bg-[#DEE8FC]"
                        : "bg-background"
                      : "bg-background"
                  }`}
                >
                  <div className="text-[10px] font-medium text-muted-foreground">
                    {day.slice(0, 3).toUpperCase()}
                  </div>
                  {/* e.g. MON, TUE etc. */}
                  <div
                    className={`text-xl font-semibold text-foreground/97 ${
                      isToday ? "text-primary" : ""
                    }`}
                  >
                    {dayOfMonth}
                  </div>
                </div>
                <div
                  className="relative"
                  style={{ height: `${hours.length * 60}px` }}
                >
                  {hours.map(
                    (
                      _,
                      hourIndex // Draws horizontal hour lines
                    ) => (
                      <div
                        key={hourIndex}
                        className="absolute left-0 right-0 border-t border-border/50"
                        style={{ top: `${hourIndex * 60}px`, height: "60px" }}
                      />
                    )
                  )}
                  {isToday && (
                    <div
                      className="absolute left-0 right-0 border-t-2 border-slate-200 z-20"
                      style={{ top: `${currentMinutes}px` }}
                    ></div>
                  )}
                  <div className="relative h-full">{renderDay(dayDate)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop: week view */}
      <div className="hidden md:block overflow-y-auto h-[calc(100vh-16rem)] border border-border rounded-lg">
        <div className="flex">
          <div className="flex flex-col pt-14 flex-shrink-0 sticky left-0 bg-background z-10">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[60px] px-2 text-xs text-muted-foreground flex items-start border-r border-border"
              >
                {hour}
              </div>
            ))}
          </div>
          {daysOfWeek.map((day, index) => {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + index + 1);
            const dayOfMonth = dayDate.getDate();
            const isToday =
              dayDate.toDateString() === new Date().toDateString();

            return (
              <div key={index} className="flex-1 border-l border-border">
                <div
                  className={`h-18 flex flex-col px-3 py-1 justify-end border-b border-border sticky top-0 z-10 ${
                    isToday
                      ? theme === "dark"
                        ? "bg-[#0A1731]"
                        : theme === "light"
                        ? "bg-[#DEE8FC]"
                        : "bg-background"
                      : "bg-background"
                  }`}
                >
                  <div className="text-sm font-medium text-muted-foreground">
                    {day.slice(0, 3).toUpperCase()}
                  </div>
                  {/* e.g. MON, TUE etc. */}
                  <div
                    className={`text-3xl font-semibold text-foreground/97 ${
                      isToday ? "text-primary" : ""
                    }`}
                    title={formatTimestamp(dayDate.toISOString(), 2)}
                  >
                    {dayOfMonth}
                  </div>
                </div>
                <div
                  className="relative"
                  style={{ height: `${hours.length * 60}px` }}
                >
                  {hours.map(
                    (
                      _,
                      hourIndex // Draws horizontal hour lines
                    ) => (
                      <div
                        key={hourIndex}
                        className="absolute left-0 right-0 border-t border-border/50"
                        style={{ top: `${hourIndex * 60}px`, height: "60px" }}
                      />
                    )
                  )}
                  {isToday && (
                    <div
                      className="absolute left-0 right-0 border-t-2 border-slate-200 z-20"
                      style={{ top: `${currentMinutes}px` }}
                    ></div>
                  )}
                  <div className="relative h-full">{renderDay(dayDate)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Toaster />
    </>
  );
}
