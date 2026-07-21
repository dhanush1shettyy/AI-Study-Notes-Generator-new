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
} else {
      setMessage(result.detail || "Login Failed");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-8 rounded-xl w-96 space-y-5"
      >
        <h1 className="text-3xl font-bold text-center text-white">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded bg-zinc-800 text-white"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded bg-zinc-800 text-white"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition p-3 rounded text-white font-semibold"
        >
          Login
        </button>

        <p className="text-center text-green-400">
          {message}
        </p>
      </form>
    </div>
  );
}