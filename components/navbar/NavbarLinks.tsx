"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function NavbarLinks() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check if role is cached in sessionStorage (resets on tab close)
    const cachedRole = sessionStorage.getItem("userRole"); // User is likely to have only a student or teacher account, meaning this information can be cached for quicker access

    if (cachedRole) {
      setUserRole(cachedRole);
      console.log("Navbar using cached role:", cachedRole);
    } else {
      // Fetch role using 'user' API
      const fetchUserRole = async () => {
        try {
          const response = await fetch("/api/user");
          if (response.ok) {
            const data = await response.json();
            const role = data.role;
            setUserRole(role);
            // Cache the role in sessionStorage for next time
            sessionStorage.setItem("userRole", role);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      };

      fetchUserRole();
    }
  }, []);

  return (
    <div className="flex gap-12 items-center absolute left-1/2 transform -translate-x-1/2">
      <Link href="/calendar" className="hover:text-primary transition-colors">
        Calendar
      </Link>
      {userRole === "Student" && (
        <>
          <Link
            href="/subjects"
            className="hover:text-primary transition-colors"
          >
            Subjects
          </Link>
          <Link
            href="/schoolwork"
            className="hover:text-primary transition-colors"
          >
            Schoolwork
          </Link>
          <Link
            href="/tasks"
            className="hover:text-primary transition-colors"
          >
            Tasks
          </Link>
        </>
      )}
    </div>
  );
}

export default NavbarLinks;
