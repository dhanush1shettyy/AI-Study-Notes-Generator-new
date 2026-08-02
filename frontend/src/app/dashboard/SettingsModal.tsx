"use client";

import { useState } from "react";
import { updateProfile, changePassword } from "@/lib/api";
import toast from "react-hot-toast";
import { FaTimes, FaUserCog, FaSave, FaLock } from "react-icons/fa";

interface SettingsModalProps {
  user: { id: number; name: string; email: string } | null;
  onClose: () => void;
  onProfileUpdated: (user: { id: number; name: string; email: string }) => void;
}

export default function SettingsModal({ user, onClose, onProfileUpdated }: SettingsModalProps) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const parseError = (result: any, fallback: string) => {
    if (typeof result?.detail === "string") return result.detail;
    if (Array.isArray(result?.detail) && result.detail.length > 0) {
      return result.detail[0].msg || fallback;
    }
    return fallback;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Name and email can't be empty.");
      return;
    }

    try {
      setSavingProfile(true);
      const result = await updateProfile({ name: name.trim(), email: email.trim() });

      if (!result?.id) {
        toast.error(parseError(result, "Failed to update profile."));
        return;
      }

      onProfileUpdated(result);
      toast.success("Profile updated.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Fill in all password fields.");
      return;
    }

    if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      toast.error("New password must be at least 8 characters with a letter and a number.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match.");
      return;
    }

    try {
      setSavingPassword(true);
      const result = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      if (result?.message !== "Password changed successfully") {
        toast.error(parseError(result, "Failed to change password."));
        return;
      }

      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border border-amber-400/20 bg-zinc-900/95 p-8 shadow-2xl shadow-black/60">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-3 font-serif text-2xl font-bold text-white">
            <FaUserCog className="text-amber-300" />
            Account settings
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Profile info */}
        <form onSubmit={handleSaveProfile} className="mb-8 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Profile
          </p>

          <div>
            <label className="mb-1.5 block text-xs text-zinc-400">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-black/30 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-zinc-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-black/30 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-amber-300 disabled:opacity-50"
          >
            <FaSave />
            {savingProfile ? "Saving…" : "Save profile"}
          </button>
        </form>

        <div className="mb-8 border-t border-white/10" />

        {/* Change password */}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <FaLock className="text-teal-300" />
            Change password
          </p>

          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-teal-400/60 focus:ring-1 focus:ring-teal-400/30"
          />

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-teal-400/60 focus:ring-1 focus:ring-teal-400/30"
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-teal-400/60 focus:ring-1 focus:ring-teal-400/30"
          />

          <button
            type="submit"
            disabled={savingPassword}
            className="flex items-center gap-2 rounded-xl border border-teal-400/40 bg-teal-400/10 px-5 py-2.5 text-sm font-bold text-teal-200 transition hover:bg-teal-400/20 disabled:opacity-50"
          >
            <FaLock />
            {savingPassword ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}