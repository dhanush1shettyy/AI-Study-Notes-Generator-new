"use client";

import { useEffect, useState } from "react";
import HistoryModal from "./HistoryModal";
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
} from "react-icons/fa";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [uploadedDoc, setUploadedDoc] = useState<any>(null);

  const [note, setNote] = useState<any>(null);
  const [generatingNotes, setGeneratingNotes] = useState(false);

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

      const result = await generateNotes(uploadedDoc.id);

      if (!result.id) {
        toast.error(result.detail || "Failed to generate notes.");
        return;
      }

      setNote(result);
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
    setMessages([]);

    try {
      const notes = await getNotesForDocument(doc.id);
      if (Array.isArray(notes) && notes.length > 0) {
        setNote(notes[0]);
      }

      const history = await getChatHistory(doc.id);
      if (Array.isArray(history)) {
        const converted = history.map((m: any) => ({
          role: m.role === "user" ? "user" : "ai",
          text: m.content,
        }));
        setMessages(converted);
      }

      toast.success(`Loaded ${doc.filename}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load document history.");
    }
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-zinc-950 to-indigo-950 text-white">
      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute -top-60 -left-40 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[160px]" />
        <div className="absolute top-20 right-0 h-[450px] w-[450px] rounded-full bg-blue-600/20 blur-[160px]" />
        <div className="absolute bottom-0 left-1/2 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Study Notes Generator
            </h1>
            <p className="text-gray-400 mt-3 text-lg">
              Upload your study material and generate clean, structured notes in seconds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 rounded-xl bg-zinc-800 px-6 py-3 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:bg-zinc-700"
            >
              📚 History
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:bg-red-600"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl">
            <h2 className="mb-3 text-2xl font-bold">👋 Welcome Back</h2>
            <p className="text-gray-300">
              <span className="font-semibold">Name:</span> {user.name}
            </p>
            <p className="text-gray-300">
              <span className="font-semibold">Email:</span> {user.email}
            </p>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600/20 to-indigo-900/20 border border-indigo-500/20 backdrop-blur-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Uploaded Files</p>
                <h2 className="text-3xl font-bold mt-2">
                  {stats.total_documents}
                </h2>
              </div>
              <FaFileAlt className="text-4xl text-indigo-400" />
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/20 backdrop-blur-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Notes Generated</p>
                <h2 className="text-3xl font-bold mt-2">
                  {stats.total_notes}
                </h2>
              </div>
              <FaStickyNote className="text-4xl text-purple-400" />
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-green-600/20 to-green-900/20 border border-green-500/20 backdrop-blur-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">AI Status</p>
                <h2 className="text-3xl font-bold mt-2 text-green-400">
                  Ready
                </h2>
              </div>
              <FaCheckCircle className="text-4xl text-green-400" />
            </div>
          </div>
        </div>

        {/* Upload Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-xl">
          <h2 className="mb-6 text-3xl font-bold flex items-center gap-3">
            <FaFileUpload />
            Upload Study Material
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
            className={`rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 cursor-pointer ${
              dragging
                ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]"
                : "border-zinc-700 bg-zinc-900/40"
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
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-2xl font-bold">
                Drag &amp; Drop your PDF or DOCX here
              </h3>
              <p className="mt-2 text-gray-400">
                or click to browse your computer
              </p>
            </label>
          </div>

          {selectedFile && (
            <div className="mt-4 rounded-xl bg-zinc-900 p-4 border border-zinc-700">
              <p className="font-semibold">Selected File</p>
              <p className="text-gray-400 mt-1">{selectedFile.name}</p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 text-lg font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:hover:scale-100"
          >
            {uploading ? "⬆️ Uploading..." : "⬆️ Upload Document"}
          </button>

          {uploading && (
            <div className="mt-6">
              <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-400">
                {progress}% Completed
              </p>
            </div>
          )}

          {uploadedDoc && !uploading && (
            <div className="mt-8 rounded-2xl border border-indigo-500/20 bg-zinc-900 p-6">
              <p className="text-gray-300 mb-4">
                📄 <span className="font-semibold">{uploadedDoc.filename}</span>{" "}
                uploaded. Ready to generate study notes.
              </p>

              <button
                onClick={handleGenerateNotes}
                disabled={generatingNotes}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-bold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
              >
                {generatingNotes ? "🤖 Generating notes..." : "✨ Generate Study Notes"}
              </button>

              {generatingNotes && (
                <div className="mt-6 flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                  <p className="text-gray-400">
                    Extracting text and organizing it into notes...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notes Result */}
        {note && (
          <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FaRobot />
                  Study Notes
                </h3>
                <p className="text-sm text-gray-400">
                  📄 {uploadedDoc?.filename}
                </p>
              </div>
              <span className="rounded-full bg-indigo-600/20 px-4 py-2 text-sm text-indigo-300">
                Ready
              </span>
            </div>

            <div className="prose prose-invert max-w-none p-8">
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>

            <div className="flex flex-wrap gap-4 px-8 pb-8">
              <button
                onClick={copyNotes}
                className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:bg-green-700"
              >
                <FaCopy />
                Copy to Clipboard
              </button>

              <button
                onClick={downloadPDF}
                className="rounded-xl bg-red-600 px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:bg-red-700"
              >
                📄 Download PDF
              </button>
            </div>
          </div>
        )}

        {/* Ask AI About Document */}
        {uploadedDoc && (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">
                💬 Ask AI About This Document
              </h2>

              <button
                onClick={newChat}
                className="rounded-xl bg-zinc-800 px-5 py-2 font-semibold transition hover:bg-zinc-700"
              >
                + New Chat
              </button>
            </div>

            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about the uploaded document..."
              className="w-full h-32 resize-none rounded-xl border border-zinc-700 bg-zinc-900 p-4 focus:border-indigo-500 focus:outline-none"
            />

            <button
              onClick={handleAskQuestion}
              disabled={asking || !question.trim()}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 font-bold transition hover:scale-[1.02] disabled:opacity-50"
            >
              {asking ? "🤖 AI is Thinking..." : "Ask AI"}
            </button>

            {asking && (
              <div className="mt-6 rounded-2xl border border-indigo-500/20 bg-zinc-900 p-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                  <div>
                    <h3 className="font-bold text-lg">
                      Analyzing your document...
                    </h3>
                    <p className="text-gray-400">
                      Finding the most relevant answer from your uploaded document.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {messages.length > 0 && (
              <div className="mt-8 space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl p-5 ${
                      msg.role === "user"
                        ? "bg-indigo-600/20 border border-indigo-500"
                        : "bg-zinc-900 border border-zinc-700"
                    }`}
                  >
                    <p className="font-bold mb-2">
                      {msg.role === "user" ? "🧑 You" : "🤖 AI"}
                    </p>
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showHistory && (
        <HistoryModal
          onClose={() => setShowHistory(false)}
          onSelectDocument={handleSelectHistoryDocument}
        />
      )}
    </div>
  );
}