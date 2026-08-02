"use client";

import { useState } from "react";
import { loginUser } from "@/lib/api";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await loginUser(form);

   if (result.access_token) {
  localStorage.setItem("token", result.access_token);

  console.log("Saved token:", localStorage.getItem("token"));

  setMessage("✅ Login Successful!");

  setTimeout(() => {
    window.location.href = "/dashboard";
}, 500);
} else {
      setMessage(result.detail || "Login Failed");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07080d] flex items-center justify-center px-4">
      <style>{`
        @keyframes drift-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, -40px) scale(1.15); }
        }
        @keyframes drift-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 50px) scale(1.1); }
        }
      `}</style>

      {/* Grid texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Animated glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-amber-500/20 blur-[150px]"
          style={{ animation: "drift-a 18s ease-in-out infinite" }}
        />
        <div
          className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-teal-500/20 blur-[150px]"
          style={{ animation: "drift-b 22s ease-in-out infinite" }}
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-3xl border border-amber-400/20 bg-zinc-900/70 backdrop-blur-2xl shadow-2xl shadow-black/60 p-8 space-y-6"
      >
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-400/25 to-amber-400/5 font-serif text-xl font-bold text-amber-300 shadow-lg shadow-amber-500/10">
            SF
          </div>
          <h1 className="font-serif text-4xl font-bold text-white">
            Welcome back
          </h1>
          <p className="text-zinc-400">
            Login to continue generating AI study notes.
          </p>
        </div>

        <input
          type="email"
          placeholder="Email Address"
          className="w-full rounded-xl border border-zinc-700 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all duration-300 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-xl border border-zinc-700 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all duration-300 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          type="submit"
          className="w-full rounded-xl bg-amber-400 py-3 font-bold text-black shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-[1.02] hover:bg-amber-300 active:scale-[0.98]"
        >
          Login
        </button>

       {message && (
  <p
    className={`text-center text-sm font-medium ${
      message.includes("Successful")
        ? "text-teal-300"
        : "text-red-400"
    }`}
  >
    {message}
  </p>
)}

<p className="text-center text-sm">
  <a href="/forgot-password" className="font-semibold text-amber-300 hover:text-amber-200 transition">
    Forgot Password?
  </a>
</p>
<p className="text-center text-sm text-zinc-400">
  Don&apos;t have an account?{" "}
  <a
    href="/register"
    className="font-semibold text-amber-300 hover:text-amber-200 transition"
  >
    Create one
  </a>
</p>
      </form>
    </div>
  );
}