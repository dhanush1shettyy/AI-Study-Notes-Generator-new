"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "connected" | "offline"
  >("checking");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/health");
        setBackendStatus(res.ok ? "connected" : "offline");
      } catch {
        setBackendStatus("offline");
      }
    };

    checkBackend();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30 scroll-smooth">
      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            StudyFlow AI
          </h1>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-zinc-300">
            <a href="#features" className="hover:text-white transition">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white transition">
              How It Works
            </a>
            <a href="/login" className="hover:text-white transition">
              Login
            </a>
            <a
              href="/register"
              className="rounded-xl bg-indigo-600 px-5 py-2 hover:bg-indigo-700 transition text-white"
            >
              Get Started
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span
              className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                mobileMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                mobileMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl px-6 py-6 space-y-4">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-zinc-300 hover:text-white transition"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-zinc-300 hover:text-white transition"
            >
              How It Works
            </a>
            <a
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-zinc-300 hover:text-white transition"
            >
              Login
            </a>
            <a
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl bg-indigo-600 px-5 py-3 text-center hover:bg-indigo-700 transition text-white"
            >
              Get Started
            </a>
          </div>
        )}
      </nav>

      {/* ================= HERO ================= */}
      <section className="flex min-h-[90vh] items-center justify-center px-8">
        <div className="max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
            <span className="text-sm text-zinc-300">
              ✨ AI Powered Learning Platform
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            StudyFlow AI
          </h1>

          <p className="mx-auto max-w-3xl text-xl md:text-2xl leading-relaxed text-zinc-400">
            Transform your PDFs into beautifully organized
            <span className="font-semibold text-white"> AI-powered study notes </span>
            within seconds.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-5 pt-4">
            <a
              href="/register"
              className="rounded-xl bg-indigo-600 px-8 py-4 font-semibold shadow-lg transition hover:scale-105 hover:bg-indigo-700"
            >
              🚀 Get Started
            </a>
            <a
              href="/login"
              className="rounded-xl border border-zinc-700 px-8 py-4 font-semibold transition hover:border-indigo-500 hover:bg-zinc-900"
            >
              Login
            </a>
          </div>

          {/* Backend Status */}
          <div className="pt-6">
            <div
              className={`inline-flex items-center gap-3 rounded-2xl border px-6 py-3 backdrop-blur-md transition-all duration-500
              ${
                backendStatus === "checking"
                  ? "border-zinc-700 bg-zinc-800/50 text-zinc-300"
                  : backendStatus === "connected"
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-rose-500/20 bg-rose-500/10 text-rose-400"
              }
              `}
            >
              <div className="relative flex h-3 w-3">
                {backendStatus === "checking" && (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-300"></span>
                )}
                {backendStatus === "connected" && (
                  <>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                  </>
                )}
                {backendStatus === "offline" && (
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500"></span>
                )}
              </div>
              <span className="font-semibold">
                {backendStatus === "checking"
                  ? "Checking Backend..."
                  : backendStatus === "connected"
                  ? "Backend Connected"
                  : "Backend Offline"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              StudyFlow AI
            </span>
            ?
          </h2>
          <p className="mt-5 text-lg text-zinc-400">
            Everything you need to study smarter and faster.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-indigo-500">
            <div className="text-5xl">📄</div>
            <h3 className="mt-6 text-2xl font-bold">Upload PDFs</h3>
            <p className="mt-4 leading-7 text-zinc-400">
              Upload textbooks, handwritten notes, assignments and lecture slides effortlessly.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-purple-500">
            <div className="text-5xl">🤖</div>
            <h3 className="mt-6 text-2xl font-bold">AI Generated Notes</h3>
            <p className="mt-4 leading-7 text-zinc-400">
              Let AI summarize your study material into clean, structured notes within seconds.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-cyan-500">
            <div className="text-5xl">💬</div>
            <h3 className="mt-6 text-2xl font-bold">AI Chat Assistant</h3>
            <p className="mt-4 leading-7 text-zinc-400">
              Ask questions about your uploaded notes and receive instant AI-powered explanations.
            </p>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
          <p className="mt-5 text-lg text-zinc-400">
            From upload to understanding, in three simple steps.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Upload Your Document",
              desc: "Drag and drop a PDF or DOCX file — textbooks, slides, or handwritten scans all work.",
              color: "text-indigo-400",
            },
            {
              step: "02",
              title: "Generate Study Notes",
              desc: "Our AI reads through the document and organizes it into clean, structured notes instantly.",
              color: "text-purple-400",
            },
            {
              step: "03",
              title: "Ask Anything",
              desc: "Chat with the AI about your document to clarify concepts and dig deeper into the material.",
              color: "text-cyan-400",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
            >
              <span className={`text-5xl font-extrabold ${item.color} opacity-40`}>
                {item.step}
              </span>
              <h3 className="mt-4 text-2xl font-bold">{item.title}</h3>
              <p className="mt-4 leading-7 text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl md:grid-cols-4">
          <div className="text-center">
            <h3 className="text-4xl font-bold text-indigo-400">10x</h3>
            <p className="mt-2 text-zinc-400">Faster Learning</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-bold text-purple-400">AI</h3>
            <p className="mt-2 text-zinc-400">Powered Notes</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-bold text-cyan-400">PDF & DOCX</h3>
            <p className="mt-2 text-zinc-400">File Support</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-bold text-emerald-400">24/7</h3>
            <p className="mt-2 text-zinc-400">AI Assistance</p>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-cyan-600/10 p-12 backdrop-blur-xl">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to study smarter?
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Join StudyFlow AI and turn your documents into knowledge, instantly.
          </p>
          <a
            href="/register"
            className="mt-8 inline-block rounded-xl bg-indigo-600 px-8 py-4 font-semibold shadow-lg transition hover:scale-105 hover:bg-indigo-700"
          >
            🚀 Get Started for Free
          </a>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10 py-10 mt-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              StudyFlow AI
            </h3>
            <p className="mt-2 text-zinc-500">
              AI-powered study companion built using Next.js, FastAPI & Gemini AI.
            </p>
          </div>
          <p className="text-zinc-500">© 2026 StudyFlow AI. All rights reserved.</p>
        </div>
      </footer>

      {/* ================= BACKGROUND ================= */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0a0a0a]">
        <div className="absolute top-0 h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.18),rgba(255,255,255,0))]" />
        <div className="absolute bottom-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>
    </div>
  );
}