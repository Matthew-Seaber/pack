import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabaseMainAdmin } from "@/lib/supabaseMainAdmin";
import UpdateEmailForm from "@/components/forms/UpdateEmail";
import UpdatePasswordForm from "@/components/forms/UpdatePassword";
import UpdateProgressEmailsForm from "@/components/forms/UpdateProgressEmails";
import LogoutButton from "@/components/forms/LogoutButton";
import { Toaster } from "sonner"

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  let studentInfo = null;

  if (user.role === "Student") {
    studentInfo = await getStudentInfo();
  }

  async function getStudentInfo() {
    try {
      const { data: studentInfo, error: fetchError } = await supabaseMainAdmin
        .from("students")
        .select("progress_emails")
        .eq("user_id", user!.user_id)
        .single();

      if (fetchError || !studentInfo) {
        console.error("Error getting user stats:", fetchError);
        return {
          progressEmails: "ERROR",
        };
      }

      return {
        progressEmails: studentInfo.progress_emails ?? "ERROR",
      };
    } catch (error) {
      console.error("Failed to get student info:", error);

      return {
        progressEmails: "ERROR",
      };
    }
  }

  return (
    <>
      <h2 className="text-2xl font-semibold mb-3">Settings</h2>
      <p>Manage your account&apos;s settings and preferences here.</p>
      <h3 className="pt-10 text-lg font-semibold">Account details</h3>

      <div
        className="flex justify-between bg-[#42AAFF]/20 rounded-md mt-5 p-6"
        style={{ color: "#A6E4FF" }}
      >
        <div>
          <p className="text-md font-medium pb-2">Your email</p>
          <p className="text-sm font-regular">
            <i>{user.email}</i>
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-2">
              <SquarePen strokeWidth={2.5} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Email Settings</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Change your account&apos;s email address.
            </DialogDescription>
            <UpdateEmailForm userID={user.user_id} currentEmail={user.email} />
          </DialogContent>
        </Dialog>
      </div>

      <div
        className="flex justify-between bg-[#42AAFF]/20 rounded-md mt-4 p-6"
        style={{ color: "#A6E4FF" }}
      >
        <div>
          <p className="text-md font-medium pb-2">Your password</p>
          <p className="text-sm font-regular">
            <i>**********</i>
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-2">
              <SquarePen strokeWidth={2.5} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Password Settings</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Change your account&apos;s password.
            </DialogDescription>
            <UpdatePasswordForm userID={user.user_id} />
          </DialogContent>
        </Dialog>
      </div>

      <h3 className="pt-10 text-lg font-semibold">Preferences</h3>
      {user.role === "Student" ? (
        <div
          className="flex justify-between bg-[#42AAFF]/20 rounded-md mt-5 p-6"
          style={{ color: "#A6E4FF" }}
        >
          <div>
            <p className="text-md font-medium pb-2">Progress emails</p>
            <p className="text-sm font-regular">
              <i>
                {studentInfo?.progressEmails === "ERROR"
                  ? "ERROR"
                  : studentInfo?.progressEmails === true
                  ? "Enabled"
                  : "Disabled"}
              </i>
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-2">
                <SquarePen strokeWidth={2.5} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Progress Email Settings</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Customise your progress emails.
              </DialogDescription>
              <UpdateProgressEmailsForm
                userID={user.user_id}
                state={
                  studentInfo?.progressEmails === true ? "Enabled" : "Disabled"
                }
              />
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <p className="text-lg font-semibold">
          No current teacher preferences. Please check back later.
        </p>
      )}

      <Toaster />

      <div className="mt-10 mb-5">
        <LogoutButton />
      </div>
    </>
  );
}
