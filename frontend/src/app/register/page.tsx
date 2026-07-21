"use client";

import { useState } from "react";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await registerUser(form);

    if (result.id) {
      setMessage("✅ Registration Successful!");
      setForm({
        name: "",
        email: "",
        password: "",
      });
    } else {
      setMessage(result.detail || "Registration Failed");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-8 rounded-xl w-96 space-y-5"
      >
        <h1 className="text-3xl font-bold text-center text-white">
          Create Account
        </h1>

        <input
          type="text"
          placeholder="Name"
          className="w-full p-3 rounded bg-zinc-800 text-white"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

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
          Register
        </button>

        <p className="text-center text-green-400">
          {message}
        </p>
      </form>
    </div>
  );
}