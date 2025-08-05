"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Signup failed.");
    }
  } catch (error) {
    console.error("Signup error:", error);
    alert("There was a system error. Please try again later.");
  }
}

  return (
    <div className="min-h-screen flex flex-col items-center justify-center drop-shadow-[0_0_100px_rgba(59,130,246,0.6)]">
      <div className="flex items-center mb-8 mt-4">
        <Image
          src="/logo-dark.svg"
          alt="Pack logo"
          width={48}
          height={48}
          className="mr-5"
        />
        <span className="text-3xl font-semibold text-white">Pack</span>
      </div>

      <div className="space-y-3 p-12 bg-[#171717] shadow-xl w-full max-w-sm rounded-xl">
        <div className="pb-3">
          <h1 className="text-2xl font-normal text-white">Welcome!</h1>
          <p className="py-2 text-xs montserrat font-medium text-zinc-400">
            Create your brand new account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <label className="block text-sm font-medium text-[#B4B4B4] mb-3">
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#1C1C1C] text-[#F2F2F2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939] placeholder:text-[#4D4D4D] placeholder:font-semibold"
                placeholder="Freddy"
                autoComplete="username"
              />
            </div>

            <div className="col-span-6">
              <label className="block text-sm font-medium text-[#B4B4B4] mb-3">
                Role
              </label>
              <div className="relative w-full">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="w-full px-3 py-3 pl-4 bg-[#1C1C1C] text-[#F2F2F2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939] appearance-none pr-10"
                >
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <ChevronDown strokeWidth={2.25} color="#F2F2F2" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#B4B4B4] mb-3">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#1C1C1C] text-[#F2F2F2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939] placeholder:text-[#4D4D4D] placeholder:font-semibold"
              placeholder="Freddy123"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#B4B4B4] mb-3">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#1C1C1C] text-[#F2F2F2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939] placeholder:text-[#4D4D4D] placeholder:font-semibold"
              placeholder="freddy@example.com"
              autoComplete="email"
            />
          </div>

          <div className="pb-1">
            <label className="block text-sm font-medium text-[#B4B4B4] mb-3">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-4 pr-12 py-3 bg-[#1C1C1C] text-[#F2F2F2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939] placeholder:text-[#4D4D4D] placeholder:font-bold"
                placeholder="••••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={() => {
                  setShowPassword(!showPassword);
                }}
              >
                <div className="absolute inset-y-0 right-0.5 flex items-center">
                  {showPassword ? (
                    <EyeOff strokeWidth={2} color="#7C7C7C" size={20} />
                  ) : (
                    <Eye strokeWidth={2} color="#7C7C7C" size={20} />
                  )}
                </div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
          >
            Next
          </button>
        </form>

        <p className="text-[0.7rem] montserrat text-zinc-400">
          Already have an account?{" "}
          <a href="/login" className="underline">
            Log in now!
          </a>
        </p>
      </div>

      <div className="fixed bottom-0 pb-3">
        <p className="text-center text-xs font-medium text-[#B4B4B4]">
          By creating an account, you agree to our{" "}
          <br />
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
    </div>
  );
}
