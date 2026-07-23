"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "offline">("checking");

  useEffect(() => {
    console.log("useEffect is running");

    const checkBackend = async () => {
      console.log("Calling backend...");

      try {
        const res = await fetch("http://127.0.0.1:8000/health");
        console.log("Status:", res.status);

        if (res.ok) {
          setBackendStatus("connected");
        } else {
          setBackendStatus("offline");
        }
      } catch (error) {
        console.error(error);
        setBackendStatus("offline");
      }
    };

    checkBackend();
  }, []);
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-3xl w-full flex flex-col items-center text-center space-y-12">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-sm backdrop-blur-md mb-4">
            <span className="text-sm font-medium tracking-wide text-zinc-300">
              New Version Available ✨
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          StudyFlow AI
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl leading-relaxed">
           Transform your PDFs into beautifully organized
           <span className="text-white font-semibold">
            {" "}AI-powered study notes{" "}
           </span>
           within seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mt-10">

           <a
             href="/register"
             className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition font-semibold shadow-lg"
           >
             Get Started
           </a>

           <a
             href="/login"
             className="px-8 py-4 rounded-xl border border-zinc-700 hover:border-indigo-500 hover:bg-zinc-900 transition font-semibold"
           >
             Login
           </a>

          </div>
      </div>

        {/* Status Indicator */}
        <div className="pt-8">
          <div
            className={`inline-flex items-center space-x-3 px-6 py-3 rounded-2xl border backdrop-blur-md transition-all duration-500 ease-out ${backendStatus === "checking"
              ? "bg-zinc-800/50 border-zinc-700/50 text-zinc-300"
              : backendStatus === "connected"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)]"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_30px_-5px_rgba(244,63,94,0.15)]"
              }`}
          >
            <div className="relative flex h-3 w-3">
              {backendStatus === "checking" && (
                <span className="animate-spin rounded-full h-3 w-3 border-2 border-zinc-500 border-t-zinc-300"></span>
              )}
              {backendStatus === "connected" && (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </>
              )}
              {backendStatus === "offline" && (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              )}
            </div>
            <span className="font-semibold tracking-wide">
              {backendStatus === "checking"
                ? "Checking Backend..."
                : backendStatus === "connected"
                  ? "Backend Connected"
                  : "Backend Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[#0a0a0a]">
        <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
      </div>
    </div>
  );
}
