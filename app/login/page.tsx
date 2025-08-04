"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Login incorrect. Please check your username and password.");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("There was a system error. Please try again later.");
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-6 p-8 bg-[#171717] rounded-2xl shadow-xl w-full max-w-sm">
        <div className="">
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <p className="text-sm text-zinc-400">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#B4B4B4] mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#1C1C1C] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939]"
              placeholder="Freddy123"
              autoComplete="username"
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
                className="w-full pl-3 pr-10 py-2 bg-[#1C1C1C] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939]"
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
            Sign in
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="underline">
            Sign up now!
          </a>
        </p>
      </div>
    </div>
  );
}
