"use client";

import { useEffect, useState } from "react";
import HistoryModal from "./HistoryModal";
import Flashcards from "./Flashcards";
import SettingsModal from "./SettingsModal";
import {
  getProfile,
  uploadPDF,
  generateNotes,
  askQuestion,
  getStats,
  getNotesForDocument,
  getChatHistory,
} from "@/lib/api";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import {
  FaFileUpload,
  FaRobot,
  FaCopy,
  FaSignOutAlt,
  FaFileAlt,
  FaStickyNote,
  FaCheckCircle,
  FaHistory,
  FaPaperPlane,
  FaDownload,
  FaEdit,
  FaSave,
  FaUndo,
  FaCog,
} from "react-icons/fa";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [uploadedDoc, setUploadedDoc] = useState<any>(null);

  const [note, setNote] = useState<any>(null);
  const [generatingNotes, setGeneratingNotes] = useState(false);
  const [noteStyle, setNoteStyle] = useState<"concise" | "detailed" | "exam">("detailed");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [draftNotes, setDraftNotes] = useState("");

  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);

  const [stats, setStats] = useState({
    total_documents: 0,
    total_notes: 0,
    total_chat_messages: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    getProfile().then(setUser);
    refreshStats();
  }, [router]);

  const refreshStats = async () => {
    try {
      const result = await getStats();
      setStats(result);
    } catch (error) {
      console.error("Failed to load stats", error);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    try {
      setUploading(true);
      setProgress(10);
      setNote(null);
      setMessages([]);

      timer = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? prev : prev + 10));
      }, 300);

      const result = await uploadPDF(selectedFile);

      if (!result.id) {
        toast.error(result.detail || "Upload failed.");
        return;
      }

      setUploadedDoc(result);
      setProgress(100);
      toast.success("File uploaded successfully!");

      await refreshStats();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong during upload.");
    } finally {
      if (timer) clearInterval(timer);
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);
    }
  };

  const handleGenerateNotes = async () => {
    if (!uploadedDoc?.id) return;

    try {
      setGeneratingNotes(true);

      const result = await generateNotes(uploadedDoc.id, noteStyle);

      if (!result.id) {
        toast.error(result.detail || "Failed to generate notes.");
        return;
      }

      setNote(result);
      setIsEditingNotes(false);
      toast.success("Study notes generated!");

      await refreshStats();
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate notes.");
    } finally {
      setGeneratingNotes(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    if (!uploadedDoc?.id) {
      toast.error("Please upload a document first.");
      return;
    }

    try {
      setAsking(true);

      const result = await askQuestion(uploadedDoc.id, question);

      if (!result.content) {
        toast.error(result.detail || "Failed to get AI response.");
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "user", text: question },
        { role: "ai", text: result.content },
      ]);

      setQuestion("");
      await refreshStats();
    } catch (error) {
      console.error(error);
      toast.error("Failed to get AI response.");
    } finally {
      setAsking(false);
    }
  };

  const handleSelectHistoryDocument = async (doc: any) => {
    setShowHistory(false);
    setUploadedDoc(doc);
    setNote(null);
    setIsEditingNotes(false);
    setMessages([]);

    try {
      const notes = await getNotesForDocument(doc.id);
      if (Array.isArray(notes) && notes.length > 0) {
        setNote(notes[0]);
      }

      const history = await getChatHistory(doc.id);
      if (Array.isArray(history)) {
        const converted = history.map((m: any) => ({
          role: (m.role === "user" ? "user" : "ai") as "user" | "ai",
          text: m.content as string,
        }));
        setMessages(converted);
      }

      toast.success(`Loaded ${doc.filename}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load document history.");
    }
  };

  const startEditingNotes = () => {
    setDraftNotes(note?.content || "");
    setIsEditingNotes(true);
  };

  const cancelEditingNotes = () => {
    setIsEditingNotes(false);
    setDraftNotes("");
  };

  const saveEditedNotes = () => {
    setNote((prev: any) => ({ ...prev, content: draftNotes }));
    setIsEditingNotes(false);
    toast.success("Notes updated for this session.");
    // Note: this saves locally only. Reloading or reopening from History
    // will show the original AI-generated version unless a backend
    // update endpoint is wired up.
  };

  const copyNotes = () => {
    if (!note?.content) return;
    navigator.clipboard.writeText(note.content);
    toast.success("Notes copied successfully!");
  };

  const downloadPDF = () => {
    if (!note?.content) return;

    const pdf = new jsPDF();
    const lines = pdf.splitTextToSize(note.content, 180);

    pdf.setFont("helvetica");
    pdf.setFontSize(12);
    pdf.text(lines, 15, 20);
    pdf.save("StudyFlow_AI_Notes.pdf");
  };

  const newChat = () => {
    setMessages([]);
    setQuestion("");
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="relative min-h-screen bg-[#07080d] text-white">
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

      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-[520px] w-[520px] rounded-full bg-amber-500/20 blur-[170px]" />
        <div className="absolute top-1/3 -right-32 h-[460px] w-[460px] rounded-full bg-teal-500/20 blur-[170px]" />
        <div className="absolute bottom-0 left-0 h-[380px] w-[380px] rounded-full bg-fuchsia-500/10 blur-[150px]" />
      </div>

      {/* ============ TOP BAR ============ */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07080d]/90 shadow-lg shadow-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-400/25 to-amber-400/5 font-serif text-xl font-bold text-amber-300 shadow-lg shadow-amber-500/10">
              SF
            </div>
            <div className="leading-tight">
              <p className="font-serif text-lg font-bold">StudyFlow</p>
              <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
                Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-200 shadow-md shadow-black/20 transition hover:border-amber-400/50 hover:bg-white/10"
            >
              <FaCog className="text-amber-300" />
              Settings
            </button>

            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-200 shadow-md shadow-black/20 transition hover:border-amber-400/50 hover:bg-white/10"
            >
              <FaHistory className="text-amber-300" />
              History
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 shadow-md shadow-black/20 transition hover:bg-red-500/20"
            >
              <FaSignOutAlt />
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10 md:px-10">
        {/* ============ HERO ============ */}
        <section className="relative mb-10 overflow-hidden rounded-3xl border border-amber-400/20 bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-teal-950/30 p-10 shadow-2xl shadow-black/60 md:p-14">
          {/* page-corner fold */}
          <div
            className="absolute right-0 top-0 h-20 w-20 bg-gradient-to-bl from-amber-400/40 via-amber-400/10 to-transparent"
            style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
          />

          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </p>

          <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight md:text-6xl">
            Turn material into{" "}
            <span className="relative inline-block">
              <span className="relative z-10">clear notes</span>
              <span className="absolute inset-x-0 bottom-2 -z-0 h-4 -rotate-1 bg-amber-400/40 md:h-6" />
            </span>
            .
          </h1>

          <p className="mt-6 max-w-xl text-base text-zinc-400 md:text-lg">
            Upload a PDF or DOCX, generate structured notes in seconds, and
            ask the AI anything about it.
          </p>

          {user && (
            <p className="mt-6 text-sm text-zinc-500">
              Signed in as{" "}
              <span className="text-zinc-300">{user.email}</span>
            </p>
          )}
        </section>

        {/* ============ STATS ============ */}
        <section className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 to-transparent p-6 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:shadow-indigo-500/10">
            <FaFileAlt className="mb-4 text-2xl text-indigo-300" />
            <p className="font-serif text-4xl font-bold">
              {stats.total_documents}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Documents uploaded</p>
          </div>

          <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 to-transparent p-6 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:shadow-amber-500/10">
            <FaStickyNote className="mb-4 text-2xl text-amber-300" />
            <p className="font-serif text-4xl font-bold">
              {stats.total_notes}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Notes generated</p>
          </div>

          <div className="rounded-2xl border border-teal-400/20 bg-gradient-to-br from-teal-500/10 to-transparent p-6 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:shadow-teal-500/10">
            <FaCheckCircle className="mb-4 text-2xl text-teal-300" />
            <p className="font-serif text-4xl font-bold text-teal-300">
              Ready
            </p>
            <p className="mt-1 text-sm text-zinc-500">AI status</p>
          </div>
        </section>

        {/* ============ UPLOAD ============ */}
        <section className="mb-10 border-l-2 border-dashed border-amber-400/30 pl-6">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-7 shadow-2xl shadow-black/40 md:p-9">
            <h2 className="mb-6 flex items-center gap-3 font-serif text-2xl font-bold md:text-3xl">
              <FaFileUpload className="text-amber-300" />
              Upload study material
            </h2>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);

                if (e.dataTransfer.files.length > 0) {
                  setSelectedFile(e.dataTransfer.files[0]);
                }
              }}
              className={`rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
                dragging
                  ? "scale-[1.01] border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-500/10"
                  : "border-zinc-700 bg-black/30"
              }`}
            >
              <input
                type="file"
                accept=".pdf,.docx"
                id="fileUpload"
                hidden
                onChange={(e) => {
                  if (e.target.files) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />

              <label htmlFor="fileUpload" className="cursor-pointer">
                <FaFileAlt className="mx-auto mb-4 text-4xl text-zinc-600" />
                <h3 className="text-lg font-semibold text-zinc-200">
                  Drag &amp; drop a PDF or DOCX
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  or click to browse your computer
                </p>
              </label>
            </div>

            {selectedFile && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-800 bg-black/40 px-4 py-3">
                <p className="text-sm text-zinc-300">{selectedFile.name}</p>
                <span className="text-xs text-zinc-500">selected</span>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 py-3.5 text-sm font-bold text-black shadow-lg shadow-amber-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:bg-none disabled:text-zinc-400 disabled:shadow-none"
            >
              {uploading ? "Uploading…" : "Upload document"}
            </button>

            {uploading && (
              <div className="mt-5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-200 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  {progress}% complete
                </p>
              </div>
            )}

            {uploadedDoc && !uploading && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5 shadow-inner">
                <p className="mb-4 text-sm text-zinc-300">
                  <span className="font-semibold text-white">
                    {uploadedDoc.filename}
                  </span>{" "}
                  is ready. Generate structured notes from it.
                </p>

                <div className="mb-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Note style
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { value: "concise", label: "Concise" },
                        { value: "detailed", label: "Detailed" },
                        { value: "exam", label: "Exam-focused" },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setNoteStyle(option.value)}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                          noteStyle === option.value
                            ? "border-amber-400/60 bg-amber-400/15 text-amber-200"
                            : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateNotes}
                  disabled={generatingNotes}
                  className="w-full rounded-xl border border-teal-400/40 bg-gradient-to-r from-teal-400/20 to-teal-400/5 py-3 text-sm font-bold text-teal-200 shadow-md shadow-teal-500/10 transition hover:from-teal-400/30 hover:to-teal-400/10 disabled:opacity-50"
                >
                  {generatingNotes ? "Generating notes…" : "Generate study notes"}
                </button>

                {generatingNotes && (
                  <div className="mt-5 flex items-center gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
                    <p className="text-sm text-zinc-500">
                      Reading the document and organizing key points…
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ============ NOTES RESULT ============ */}
        {note && (
          <section className="mb-10 border-l-2 border-dashed border-amber-400/30 pl-6">
            <div className="overflow-hidden rounded-3xl border border-amber-400/20 bg-gradient-to-b from-zinc-900/70 to-black/50 shadow-2xl shadow-amber-500/5">
              <div className="flex items-center justify-between border-b border-white/10 bg-amber-400/10 px-6 py-4 md:px-8">
                <div className="flex items-center gap-3">
                  <FaRobot className="text-lg text-amber-300" />
                  <div>
                    <h3 className="font-serif text-lg font-bold md:text-xl">
                      Study notes
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {uploadedDoc?.filename}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!isEditingNotes && (
                    <span className="rounded-full border border-teal-400/40 bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-200 shadow-sm shadow-teal-500/10">
                      Ready
                    </span>
                  )}
                  {!isEditingNotes ? (
                    <button
                      onClick={startEditingNotes}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/10"
                    >
                      <FaEdit />
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={saveEditedNotes}
                        className="flex items-center gap-2 rounded-lg border border-teal-400/40 bg-teal-400/10 px-3 py-1.5 text-xs font-semibold text-teal-200 transition hover:bg-teal-400/20"
                      >
                        <FaSave />
                        Save
                      </button>
                      <button
                        onClick={cancelEditingNotes}
                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/10"
                      >
                        <FaUndo />
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isEditingNotes ? (
                <div className="p-8 md:p-10">
                  <textarea
                    value={draftNotes}
                    onChange={(e) => setDraftNotes(e.target.value)}
                    className="h-96 w-full resize-y rounded-xl border border-amber-400/30 bg-black/30 p-4 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
                    placeholder="Edit your notes (Markdown supported)…"
                  />
                  <p className="mt-2 text-xs text-zinc-500">
                    Editing this session only — save, then copy or download
                    to keep your changes.
                  </p>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none p-8 prose-headings:font-serif md:p-10">
                  <ReactMarkdown>{note.content}</ReactMarkdown>
                </div>
              )}

              <div className="flex flex-wrap gap-3 border-t border-white/10 px-8 py-6 md:px-10">
                <button
                  onClick={copyNotes}
                  disabled={isEditingNotes}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-zinc-200 shadow-md shadow-black/20 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaCopy />
                  Copy to clipboard
                </button>

                <button
                  onClick={downloadPDF}
                  disabled={isEditingNotes}
                  className="flex items-center gap-2 rounded-lg border border-amber-400/40 bg-gradient-to-r from-amber-400/20 to-amber-400/5 px-5 py-2.5 text-sm font-semibold text-amber-200 shadow-md shadow-amber-500/10 transition hover:from-amber-400/30 hover:to-amber-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaDownload />
                  Download PDF
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ============ ASK AI ============ */}
        {uploadedDoc && (
          <section className="border-l-2 border-dashed border-amber-400/30 pl-6">
            <div className="rounded-3xl border border-teal-400/15 bg-gradient-to-b from-zinc-900/60 to-teal-950/20 p-7 shadow-2xl shadow-black/40 md:p-9">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold md:text-3xl">
                  Ask about this document
                </h2>

                <button
                  onClick={newChat}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300 shadow-sm transition hover:bg-white/10"
                >
                  New chat
                </button>
              </div>

              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask anything about the uploaded document…"
                className="h-28 w-full resize-none rounded-xl border border-zinc-700 bg-black/30 p-4 text-sm placeholder:text-zinc-600 focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
              />

              <button
                onClick={handleAskQuestion}
                disabled={asking || !question.trim()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 py-3.5 text-sm font-bold text-black shadow-lg shadow-amber-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:bg-none disabled:text-zinc-400 disabled:shadow-none"
              >
                <FaPaperPlane className="text-xs" />
                {asking ? "Thinking…" : "Ask AI"}
              </button>

              {asking && (
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-5">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">
                      Reading your document
                    </p>
                    <p className="text-xs text-zinc-500">
                      Finding the most relevant answer.
                    </p>
                  </div>
                </div>
              )}

              {messages.length > 0 && (
                <div className="mt-6 space-y-3">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`rounded-xl p-5 shadow-md shadow-black/20 ${
                        msg.role === "user"
                          ? "border border-amber-400/25 bg-amber-400/5"
                          : "border border-teal-400/15 bg-black/30"
                      }`}
                    >
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        {msg.role === "user" ? "You" : "AI"}
                      </p>
                      <div className="prose prose-invert max-w-none prose-p:my-2">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ============ FLASHCARDS ============ */}
        {uploadedDoc && (
          <div className="mt-10">
            <Flashcards documentId={uploadedDoc.id} filename={uploadedDoc.filename} />
          </div>
        )}
      </div>

      {showHistory && (
        <HistoryModal
          onClose={() => setShowHistory(false)}
          onSelectDocument={handleSelectHistoryDocument}
        />
      )}

      {showSettings && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
          onProfileUpdated={(updatedUser) => setUser(updatedUser)}
        />
      )}
    </div>
  );
}