"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-6 p-8 bg-[#171717] rounded-2xl shadow-xl w-full max-w-sm">
        <div className="">
          <h1 className="text-2xl font-semibold text-white">Welcome!</h1>
          <p className="text-sm text-zinc-400">Create your brand new account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <label className="block text-sm font-medium text-[#B4B4B4] mb-1">
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#1C1C1C] text-[#F2F2F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939]"
                placeholder="Freddy"
                autoComplete="username"
              />
            </div>

            <div className="col-span-6">
              <label className="block text-sm font-medium text-[#B4B4B4] mb-1">
                Role
              </label>
              <div className="relative w-full">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="w-full px-3 py-2 pl-2 bg-[#1C1C1C] text-[#F2F2F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939] appearance-none pr-10"
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
            <label className="block text-sm font-medium text-[#B4B4B4] mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#1C1C1C] text-[#F2F2F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939]"
              placeholder="Freddy123"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#B4B4B4] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#1C1C1C] text-[#F2F2F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939]"
              placeholder="freddy@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#B4B4B4] mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-3 pr-10 py-2 bg-[#1C1C1C] text-[#F2F2F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939]"
                placeholder="••••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={() => {
                  /* toggle visibility… */
                }}
              >
                <svg width="20" height="20" className="text-zinc-500">
                  {/* eye icon */}
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
          >
            Next
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <a href="/signup" className="underline">
            Log in now!
          </a>
        </p>
      </div>
    </div>
  );
}
