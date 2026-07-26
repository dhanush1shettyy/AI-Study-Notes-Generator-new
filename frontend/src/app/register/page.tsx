"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await registerUser(form);

    if (result.id) {
  setMessage("✅ Registration Successful! Redirecting to login...");

  setForm({
    name: "",
    email: "",
    password: "",
  });

  setTimeout(() => {
    router.push("/login");
  }, 1500);
} else {
      setMessage(result.detail || "Registration Failed");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-black flex items-center justify-center px-4">
      {/* Background Glow */}
<div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"></div>

<div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl"></div>

<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.15),transparent_60%)]"></div>
      <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center">
  <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
    AI Study Notes
  </h1>

  <p className="mt-2 text-zinc-400 text-lg">
    Study Smarter. Learn Faster. Powered by AI.
  </p>
</div>
      
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl p-8 space-y-6 transition-all duration-300"
      >
        <div className="text-center space-y-2">
  <h1 className="text-4xl font-extrabold text-white">
    Create Account
  </h1>

  <p className="text-zinc-300">
    Join AI Study Notes Generator 🚀
  </p>
</div>

        <input
  type="text"
  placeholder="Full Name"
  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-400 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
  value={form.name}
  onChange={(e) =>
    setForm({ ...form, name: e.target.value })
  }
/>

        <input
  type="email"
  placeholder="Email Address"
  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-400 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
  value={form.email}
  onChange={(e) =>
    setForm({ ...form, email: e.target.value })
  }
/>
<input
  type="password"
  placeholder="Password"
  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-400 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
  value={form.password}
  onChange={(e) =>
    setForm({ ...form, password: e.target.value })
  }
/>
        

        <input
  type="password"
  placeholder="Password"
  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-400 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
  value={form.password}
  onChange={(e) =>
    setForm({ ...form, password: e.target.value })
  }
/>

       {message && (
  <p
    className={`text-center text-sm font-medium ${
      message.includes("Successful")
        ? "text-green-400"
        : "text-red-400"
    }`}
  >
    {message}
  </p>
)}
<p className="text-center text-sm text-zinc-300">
  Already have an account?{" "}
  <a
    href="/login"
    className="font-semibold text-indigo-400 hover:text-indigo-300 transition"
  >
    Login
  </a>
</p>
      </form>
    </div>
  );
}