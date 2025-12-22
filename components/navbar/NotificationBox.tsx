import { Bell, BellRing } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

interface Notification {
  id: string;
  message: string;
  sent: string;
  read: boolean;
}

// Function to convert a given timestamp to a UX-friendly format
const formatTimestamp = (timestamp: string | null): string => {
  if (!timestamp) return "No date";

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "ERROR";

  // Relative format (e.g. 3 days ago) so users can easily understand when the notification was sent
  const now = new Date();
  const msDifference = now.getTime() - date.getTime();
  if (msDifference <= 0) return "ERROR";

  const seconds = Math.floor(msDifference / 1000);
  if (seconds < 60) return "now";

  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const format = (value: number, unit: string) =>
    `${value} ${unit}${value !== 1 ? "s" : ""} ago`;

  if (minutes < 60) return format(minutes, "minute");
  if (hours < 24) return format(hours, "hour");
  if (days < 7) return format(days, "day");
  if (weeks < 5) return format(weeks, "week");
  if (months < 12) return format(months, "month");
  return format(years, "year");
};

export default function NotificationBox() {
  const [newNotifications, setNewNotifications] = useState<Notification[]>([]);
  const [readNotifications, setReadNotifications] = useState<Notification[]>(
    []
  );
  const [active, setActive] = useState(false);

  useEffect(() => {
    const getNotifications = async () => {
      try {
        const response = await fetch(
          "/api/user/notifications/get_notifications",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          // Sorts notifications by newest first
          const sortBySentDate = (a: Notification, b: Notification) =>
            new Date(b.sent).getTime() - new Date(a.sent).getTime();

          setNewNotifications(
            data.newNotifications?.sort(sortBySentDate) || []
          );
          setReadNotifications(
            data.readNotifications?.sort(sortBySentDate) || []
          );
          setActive(
            Boolean(data.newNotifications && data.newNotifications.length > 0)
          );
        } else {
          console.error("Failed to fetch notifications");
        }
      } catch (error) {
        console.error("Error getting notifications:", error);
      }
    };

    getNotifications();
  }, []);

  async function markNotificationsAsRead() {
    if (newNotifications.length === 0) return;

    try {
      const notificationIDs = newNotifications.map((notif) => notif.id);
      if (!notificationIDs || notificationIDs.length === 0) return;

      const response = await fetch("/api/user/notifications/mark_as_read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIDs }),
      });

      if (!response.ok) {
        console.error("Failed to mark notifications as read");
      } else {
        setActive(false);
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  }

  return (
    <DropdownMenu onOpenChange={markNotificationsAsRead}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Bell
            className={`h-[1.2rem] w-[1.2rem] ${
              active ? "scale-0" : "scale-100"
            }`}
          />
          <BellRing
            className={`absolute h-[1.2rem] w-[1.2rem] ${
              active ? "scale-100" : "scale-0"
            }`}
          />
          <span className="sr-only">View notifications</span>{" "}
          {/* Text for screen readers only - helps with accessibility */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="max-w-[300px] sm:max-w-[400px] md:max-w-[500px] max-h-[300px]"
        align="end"
      >
        {newNotifications && newNotifications.length > 0 ? (
          newNotifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 flex items-center space-x-2 rounded-lg hover:bg-slate-800"
            >
              <div className="h-2 w-2 rounded-full bg-red-600"></div>
              <div>
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-gray-500">
                  {formatTimestamp(notification.sent)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4">
            <p className="text-sm">
              You have no {readNotifications?.length === 0 ? "" : "new"}{" "}
              notifications
            </p>
          </div>
        )}

        {readNotifications && readNotifications.length > 0 && (
          <>
            {readNotifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 flex items-center space-x-2 rounded-lg hover:bg-slate-800"
              >
                <div className="h-2 w-2" />
                <div>
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500">
                    {formatTimestamp(notification.sent)}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}

        <p className="text-sm text-muted-foreground px-4 py-4">
          <i>Note: notifications are automatically deleted after 7 days.</i>
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
