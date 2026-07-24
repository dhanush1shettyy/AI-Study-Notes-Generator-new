"use client";

import { useEffect, useState } from "react";
import { getProfile, uploadFile, askQuestion } from "@/lib/api";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import {
  FaFileUpload,
  FaRobot,
  FaCopy,
  FaSignOutAlt,
} from "react-icons/fa";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);

  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    getProfile().then(setUser);
  }, [router]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);

      const result = await uploadFile(selectedFile);
      console.log(result);
      setUploadResult(result);
    } finally {
      setLoading(false);
    }
  };

const handleAskQuestion = async () => {
  if (!question.trim()) return;
  console.log(uploadResult.document.length);
console.log(question);
  if (!uploadResult?.preview) {
    alert("Please upload a document first.");
    return;
  }

  try {
    setAsking(true);

   const result = await askQuestion(
  uploadResult.document,
  question
);

setMessages((prev) => [
  ...prev,
  {
    role: "user",
    text: question,
  },
  {
    role: "ai",
    text: result.answer,
  },
]);

setQuestion("");
  } catch (error) {
    console.error(error);
    alert("Failed to get AI response.");
  } finally {
    setAsking(false);
  }
};

  const copyNotes = () => {
    if (!uploadResult?.notes) return;

    navigator.clipboard.writeText(uploadResult.notes);

    alert("✅ Notes copied!");
  };

const downloadPDF = () => {
  if (!uploadResult?.notes) return;

  const doc = new jsPDF();

  const lines = doc.splitTextToSize(uploadResult.notes, 180);

  doc.setFont("helvetica");

  doc.setFontSize(12);

  doc.text(lines, 15, 20);

  doc.save("StudyFlow_AI_Notes.pdf");
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

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:bg-red-600"
          >
            <FaSignOutAlt />
            Logout
          </button>

        </div>

        {/* User Card */}

        {user && (

          <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl">

            <h2 className="mb-3 text-2xl font-bold">
              👋 Welcome Back
            </h2>

            <p className="text-gray-300">
              <span className="font-semibold">Name:</span> {user.name}
            </p>

            <p className="text-gray-300">
              <span className="font-semibold">Email:</span> {user.email}
            </p>

          </div>

        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

  <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 hover:scale-105 transition">

    <p className="text-gray-400 text-sm">
      Uploaded File
    </p>

    <h2 className="text-2xl font-bold mt-2">
      {uploadResult ? "1" : "0"}
    </h2>

  </div>

  <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 hover:scale-105 transition">

    <p className="text-gray-400 text-sm">
      Characters
    </p>

    <h2 className="text-2xl font-bold mt-2">
      {uploadResult?.characters || 0}
    </h2>

  </div>

  <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 hover:scale-105 transition">

    <p className="text-gray-400 text-sm">
      Status
    </p>

    <h2 className="text-2xl font-bold mt-2 text-green-400">
      Ready
    </h2>

  </div>

</div>


        {/* Upload Card */}

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-xl">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-3xl font-bold flex items-center gap-3">
              🤖 Ask AI
            </h2>

            <button
              onClick={newChat}
              className="rounded-xl bg-zinc-800 px-5 py-2 font-semibold hover:bg-zinc-700 transition"
            >
              + New Chat
            </button>

          </div>

            <FaFileUpload />

            Upload Study Material

          

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

  <label
    htmlFor="fileUpload"
    className="cursor-pointer"
  >

    <div className="text-6xl mb-4">
      📄
    </div>

    <h3 className="text-2xl font-bold">
      Drag & Drop your PDF here
    </h3>

    <p className="mt-2 text-gray-400">
      or click to browse your computer
    </p>

  </label>

</div>

          {selectedFile && (
            <div className="mt-4 rounded-xl bg-zinc-900 p-4 border border-zinc-700">
              <p className="font-semibold">
                Selected File
              </p>

              <p className="text-gray-400 mt-1">
                {selectedFile.name}
              </p>
            </div>
         )}

          <button
            onClick={handleUpload}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 text-lg font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
          >
            {loading
              ? "🤖 Generating notes..."
              : "✨ Generate Study Notes"}
          </button>

          {loading && (
            <div className="mt-8 rounded-2xl border border-indigo-500/20 bg-zinc-900 p-8 text-center animate-pulse">
              <div className="mx-auto h-12 w-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>

              <h3 className="mt-6 text-xl font-bold">
                Creating your study notes...
              </h3>

              <p className="mt-2 text-gray-400">
                Extracting text, analyzing the document and organizing everything into clean notes.
              </p>
            </div>
          )}

        </div>

        {/* AI Notes */}

        {uploadResult && (

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-xl">

            <h2 className="mb-6 flex items-center gap-3 text-3xl font-bold">

              <FaRobot />

              AI Generated Notes

            </h2>

            <div className="mb-6 rounded-xl bg-zinc-900/60 p-4 text-gray-300">

              <p>📄 <strong>{uploadResult.filename}</strong></p>

              <p>{uploadResult.characters} characters extracted</p>

              <p className="mt-2">
               AI Notes Successfully Generated
              </p>

            </div>

            <div className="prose prose-invert max-w-none rounded-xl bg-zinc-950/50 p-6">

              <ReactMarkdown>
                {uploadResult.notes}
              </ReactMarkdown>

            </div>
            <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black shadow-2xl">

              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">

                <div>
                  <h3 className="text-xl font-bold">
                  📚 Study Notes
                </h3>

                <p className="text-sm text-gray-400">
                  AI generated summary
                </p>
              </div>

              <span className="rounded-full bg-indigo-600/20 px-4 py-2 text-sm text-indigo-300">
                Ready
              </span>

            </div>

            <div className="prose prose-invert max-w-none p-8">

              <ReactMarkdown>
                {uploadResult.notes}
              </ReactMarkdown>

            </div>

          </div>

            <div className="mt-8 flex flex-wrap gap-4">

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


{/* Ask AI About Document */}

<div className="mt-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-xl">

  <div className="flex items-center justify-between mb-6">

  <h2 className="text-3xl font-bold">
    💬 Ask AI About This Document
  </h2>

  <button
    onClick={newChat}
    className="rounded-xl bg-zinc-800 px-5 py-2 font-semibold transition hover:bg-zinc-700"
  >
    ✨ New Chat
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
    disabled={asking}
    className="mt-5 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 font-bold transition hover:scale-[1.02]"
  >
    {asking ? "Thinking..." : "Ask AI"}
  </button>

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

          <ReactMarkdown>
            {msg.text}
          </ReactMarkdown>

        </div>

      </div>

    ))}

  </div>

)}

</div>

          </div>

        )}

      </div>

    </div>
  );
}