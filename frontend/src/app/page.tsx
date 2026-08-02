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
    <div className="relative min-h-screen bg-[#07080d] text-white font-sans selection:bg-amber-400/30 scroll-smooth">
      {/* Animated background keyframes */}
      <style>{`
        @keyframes drift-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, -40px) scale(1.15); }
        }
        @keyframes drift-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 50px) scale(1.1); }
        }
        @keyframes drift-c {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 30px) scale(0.9); }
        }
      `}</style>

      {/* Grid paper texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Animated ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-32 left-1/4 h-[520px] w-[520px] rounded-full bg-amber-500/20 blur-[170px]"
          style={{ animation: "drift-a 18s ease-in-out infinite" }}
        />
        <div
          className="absolute top-1/3 -right-32 h-[460px] w-[460px] rounded-full bg-teal-500/20 blur-[170px]"
          style={{ animation: "drift-b 22s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-0 left-0 h-[380px] w-[380px] rounded-full bg-fuchsia-500/10 blur-[150px]"
          style={{ animation: "drift-c 26s ease-in-out infinite" }}
        />
      </div>

      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#07080d]/90 shadow-lg shadow-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-400/25 to-amber-400/5 font-serif text-lg font-bold text-amber-300 shadow-lg shadow-amber-500/10">
              SF
            </div>
            <h1 className="font-serif text-2xl font-bold text-white">
              StudyFlow
            </h1>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-zinc-300">
            <a href="#features" className="hover:text-amber-300 transition">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-amber-300 transition">
              How It Works
            </a>
            <a href="/login" className="hover:text-amber-300 transition">
              Login
            </a>
            <a
              href="/register"
              className="rounded-xl bg-amber-400 px-5 py-2 font-semibold text-black shadow-lg shadow-amber-500/20 transition hover:bg-amber-300"
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
          <div className="md:hidden border-t border-white/10 bg-[#07080d]/95 backdrop-blur-xl px-6 py-6 space-y-4">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-zinc-300 hover:text-amber-300 transition"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-zinc-300 hover:text-amber-300 transition"
            >
              How It Works
            </a>
            <a
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-zinc-300 hover:text-amber-300 transition"
            >
              Login
            </a>
            <a
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl bg-amber-400 px-5 py-3 text-center font-semibold text-black transition hover:bg-amber-300"
            >
              Get Started
            </a>
          </div>
        )}
      </nav>

      {/* ================= HERO ================= */}
      <section className="relative z-10 flex min-h-[90vh] items-center justify-center px-8">
        <div className="max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-2 backdrop-blur-md">
            <span className="text-sm text-amber-200">
              ✨ AI Powered Learning Platform
            </span>
          </div>

          <h1 className="font-serif text-6xl md:text-7xl font-bold tracking-tight text-white">
            StudyFlow
          </h1>

          <p className="mx-auto max-w-3xl text-xl md:text-2xl leading-relaxed text-zinc-400">
            Transform your PDFs into beautifully organized{" "}
            <span className="relative inline-block font-semibold text-white">
              <span className="relative z-10">AI-powered study notes</span>
              <span className="absolute inset-x-0 bottom-1 -z-0 h-3 -rotate-1 bg-amber-400/30" />
            </span>{" "}
            within seconds.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-5 pt-4">
            <a
              href="/register"
              className="rounded-xl bg-amber-400 px-8 py-4 font-semibold text-black shadow-lg shadow-amber-500/20 transition hover:scale-105 hover:bg-amber-300"
            >
              🚀 Get Started
            </a>
            <a
              href="/login"
              className="rounded-xl border border-zinc-700 px-8 py-4 font-semibold text-white transition hover:border-amber-400/50 hover:bg-white/5"
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
                  ? "border-teal-400/30 bg-teal-400/10 text-teal-300"
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
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-teal-400"></span>
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
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold">
            Why Choose{" "}
            <span className="text-amber-300">StudyFlow</span>?
          </h2>
          <p className="mt-5 text-lg text-zinc-400">
            Everything you need to study smarter and faster.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 border-l-4 border-l-indigo-400/60 bg-white/[0.03] p-8 shadow-xl shadow-black/30 transition-all duration-300 hover:-translate-y-2">
            <div className="text-5xl">📄</div>
            <h3 className="mt-6 font-serif text-2xl font-bold">Upload PDFs</h3>
            <p className="mt-4 leading-7 text-zinc-400">
              Upload textbooks, handwritten notes, assignments and lecture slides effortlessly.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 border-l-4 border-l-amber-400/60 bg-white/[0.03] p-8 shadow-xl shadow-black/30 transition-all duration-300 hover:-translate-y-2">
            <div className="text-5xl">🤖</div>
            <h3 className="mt-6 font-serif text-2xl font-bold">AI Generated Notes</h3>
            <p className="mt-4 leading-7 text-zinc-400">
              Let AI summarize your study material into clean, structured notes within seconds.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 border-l-4 border-l-teal-400/60 bg-white/[0.03] p-8 shadow-xl shadow-black/30 transition-all duration-300 hover:-translate-y-2">
            <div className="text-5xl">💬</div>
            <h3 className="mt-6 font-serif text-2xl font-bold">AI Chat Assistant</h3>
            <p className="mt-4 leading-7 text-zinc-400">
              Ask questions about your uploaded notes and receive instant AI-powered explanations.
            </p>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold">How It Works</h2>
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
              color: "text-amber-300",
            },
            {
              step: "02",
              title: "Generate Study Notes",
              desc: "Our AI reads through the document and organizes it into clean, structured notes instantly.",
              color: "text-teal-300",
            },
            {
              step: "03",
              title: "Ask Anything",
              desc: "Chat with the AI about your document to clarify concepts and dig deeper into the material.",
              color: "text-fuchsia-300",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-xl shadow-black/30"
            >
              <span className={`font-serif text-5xl font-extrabold ${item.color} opacity-40`}>
                {item.step}
              </span>
              <h3 className="mt-4 text-2xl font-bold">{item.title}</h3>
              <p className="mt-4 leading-7 text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 rounded-3xl border border-white/10 bg-white/[0.03] p-10 shadow-xl shadow-black/30 md:grid-cols-4">
          <div className="text-center">
            <h3 className="font-serif text-4xl font-bold text-amber-300">10x</h3>
            <p className="mt-2 text-zinc-400">Faster Learning</p>
          </div>
          <div className="text-center">
            <h3 className="font-serif text-4xl font-bold text-teal-300">AI</h3>
            <p className="mt-2 text-zinc-400">Powered Notes</p>
          </div>
          <div className="text-center">
            <h3 className="font-serif text-4xl font-bold text-fuchsia-300">PDF & DOCX</h3>
            <p className="mt-2 text-zinc-400">File Support</p>
          </div>
          <div className="text-center">
            <h3 className="font-serif text-4xl font-bold text-amber-300">24/7</h3>
            <p className="mt-2 text-zinc-400">AI Assistance</p>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-center">
        <div className="relative overflow-hidden rounded-3xl border border-amber-400/20 bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-teal-950/30 p-12 shadow-2xl shadow-black/60">
          <div
            className="absolute right-0 top-0 h-20 w-20 bg-gradient-to-bl from-amber-400/40 via-amber-400/10 to-transparent"
            style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
          />
          <h2 className="font-serif text-3xl md:text-4xl font-bold">
            Ready to study smarter?
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Join StudyFlow and turn your documents into knowledge, instantly.
          </p>
          <a
            href="/register"
            className="mt-8 inline-block rounded-xl bg-amber-400 px-8 py-4 font-semibold text-black shadow-lg shadow-amber-500/20 transition hover:scale-105 hover:bg-amber-300"
          >
            🚀 Get Started for Free
          </a>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 border-t border-white/10 py-10 mt-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-white">
              StudyFlow
            </h3>
            <p className="mt-2 text-zinc-500">
              AI-powered study companion built using Next.js, FastAPI & Gemini AI.
            </p>
          </div>
          <p className="text-zinc-500">© 2026 StudyFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}