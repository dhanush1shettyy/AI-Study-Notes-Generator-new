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
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const router = useRouter();

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (form.password.length < 8) {
    setMessage("Password must be at least 8 characters long");
    return;
  }
  if (!/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
    setMessage("Password must contain both letters and numbers");
    return;
  }
  if (form.password !== confirmPassword) {
    setMessage("Passwords do not match");
    return;
  }

  const result = await registerUser(form);

  if (result.id) {
    setMessage("✅ Registration Successful! Redirecting to login...");
    setForm({ name: "", email: "", password: "" });
    setConfirmPassword("");
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  } else {
    // FastAPI validation errors come back as an array of objects; plain
    // errors (like "Email already registered") come back as a string.
    let errorMessage = "Registration Failed";

    if (typeof result.detail === "string") {
      errorMessage = result.detail;
    } else if (Array.isArray(result.detail) && result.detail.length > 0) {
      errorMessage = result.detail[0].msg || errorMessage;
    }

    setMessage(errorMessage);
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
          <h1 className="font-serif text-4xl font-bold text-white">Create account</h1>
          <p className="text-zinc-400">Join StudyFlow 🚀</p>
        </div>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full rounded-xl border border-zinc-700 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all duration-300 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email Address"
          className="w-full rounded-xl border border-zinc-700 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all duration-300 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-xl border border-zinc-700 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all duration-300 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full rounded-xl border border-zinc-700 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all duration-300 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full rounded-xl bg-amber-400 py-3 font-bold text-black shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-[1.02] hover:bg-amber-300 active:scale-[0.98]"
        >
          Create Account
        </button>

        {message && (
          <p
            className={`text-center text-sm font-medium ${
              message.includes("Successful") ? "text-teal-300" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-amber-300 hover:text-amber-200 transition">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}