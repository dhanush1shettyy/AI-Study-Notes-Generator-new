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

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-amber-400/20 bg-zinc-900/70 backdrop-blur-2xl shadow-2xl shadow-black/60 p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-400/25 to-amber-400/5 font-serif text-xl font-bold text-amber-300 shadow-lg shadow-amber-500/10">
            SF
          </div>
          <h1 className="font-serif text-4xl font-bold text-white">
            {step === "email" && "Forgot Password"}
            {step === "code" && "Enter Code"}
            {step === "reset" && "Reset Password"}
          </h1>
          <p className="text-zinc-400">
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
              className="w-full rounded-xl border border-zinc-700 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all duration-300 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-400 py-3 font-bold text-black shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-[1.02] hover:bg-amber-300 active:scale-[0.98] disabled:opacity-50"
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
              className="w-full rounded-xl border border-zinc-700 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all duration-300 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-400 py-3 font-bold text-black shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-[1.02] hover:bg-amber-300 active:scale-[0.98] disabled:opacity-50"
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
              className="w-full text-sm text-zinc-400 hover:text-amber-300 transition"
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
              className="w-full rounded-xl border border-zinc-700 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all duration-300 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full rounded-xl border border-zinc-700 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all duration-300 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-400 py-3 font-bold text-black shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-[1.02] hover:bg-amber-300 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {message && (
          <p
            className={`text-center text-sm font-medium ${
              message.includes("✅") ? "text-teal-300" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-sm text-zinc-400">
          Remembered your password?{" "}
          <a href="/login" className="font-semibold text-amber-300 hover:text-amber-200 transition">
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
}