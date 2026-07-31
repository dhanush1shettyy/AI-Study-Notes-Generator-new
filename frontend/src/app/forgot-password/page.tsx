"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword, verifyResetCode, resetPassword } from "@/lib/api";

type Step = "email" | "code" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const parseError = (result: any, fallback: string) => {
    if (typeof result.detail === "string") return result.detail;
    if (Array.isArray(result.detail) && result.detail.length > 0) {
      return result.detail[0].msg || fallback;
    }
    return fallback;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!email.trim()) {
      setMessage("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const result = await forgotPassword(email);

      if (result.detail) {
        setMessage(parseError(result, "Failed to send code"));
        return;
      }

      setMessage(result.message || "Code sent. Check your email.");
      setStep("code");
    } catch (error) {
      console.error(error);
      setMessage("Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!code.trim()) {
      setMessage("Please enter the code sent to your email");
      return;
    }

    try {
      setLoading(true);
      const result = await verifyResetCode(email, code);

      if (result.detail) {
        setMessage(parseError(result, "Invalid code"));
        return;
      }

      setMessage("");
      setStep("reset");
    } catch (error) {
      console.error(error);
      setMessage("Failed to verify code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setMessage("Password must be at least 8 characters and include a letter and a number");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const result = await resetPassword({ email, code, new_password: newPassword });

      if (result.message === "Password reset successfully") {
        setMessage("✅ Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setMessage(parseError(result, "Failed to reset password"));
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-black flex items-center justify-center px-4">
      <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.15),transparent_60%)]"></div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-white">
            {step === "email" && "Forgot Password"}
            {step === "code" && "Enter Code"}
            {step === "reset" && "Reset Password"}
          </h1>
          <p className="text-zinc-300">
            {step === "email" && "Enter your email to receive a reset code."}
            {step === "code" && `We sent a code to ${email}. Enter it below.`}
            {step === "reset" && "Choose your new password."}
          </p>
        </div>

        {step === "email" && (
          <form onSubmit={handleSendCode} className="space-y-6">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-400 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Code"}
            </button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <input
              type="text"
              placeholder="Enter Code"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-400 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setMessage("");
              }}
              className="w-full text-sm text-zinc-400 hover:text-zinc-300 transition"
            >
              ← Use a different email
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <input
              type="password"
              placeholder="New Password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-400 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-400 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {message && (
          <p
            className={`text-center text-sm font-medium ${
              message.includes("✅") ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-sm text-zinc-300">
          Remembered your password?{" "}
          <a href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
}