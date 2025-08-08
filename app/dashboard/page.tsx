import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const user = await getUser();

  if (!user) { // Backup since middleware should ensure the user exists and is logged in
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
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {greeting}, {user.first_name}!
      </h1>
      <p>
        We hope you&apos;re having a great day!
      </p>
    </div>
  );
}
