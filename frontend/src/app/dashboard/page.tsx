"use client";

import { useEffect, useState } from "react";
import { getProfile, uploadFile } from "@/lib/api";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
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
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

      setUploadResult(result);
    } finally {
      setLoading(false);
    }
  };

  const copyNotes = () => {
    if (!uploadResult?.notes) return;

    navigator.clipboard.writeText(uploadResult.notes);

    alert("Notes copied!");
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };


    return (
              <div className="relative min-h-screen overflow-hidden bg-[#09090B] text-white">

              <div className="absolute inset-0">

              <div className="absolute -top-60 -left-40 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[150px]" />

              <div className="absolute top-20 right-0 h-[450px] w-[450px] rounded-full bg-blue-600/20 blur-[150px]" />

              <div className="absolute bottom-0 left-1/2 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[120px]" />

</div>

<div className="relative z-10">

      <div className="max-w-6xl mx-auto p-10">

        <div className="flex justify-between items-center mb-10">

          <div>
            <h1 className="text-5xl font-bold">
              📚 AI Study Notes Generator
            </h1>

            <p className="text-gray-400 mt-3">
              Upload your PDF and let Gemini AI generate beautiful study notes.
            </p>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-5 py-3 rounded-lg"
          >
            <FaSignOutAlt />
            Logout
          </button>

        </div>

        {user && (

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">

            <h2 className="text-xl font-semibold mb-2">
              Welcome 👋
            </h2>

            <p>Name: {user.name}</p>

            <p>Email: {user.email}</p>

          </div>

        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">

          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <FaFileUpload />
            Upload Study Material
          </h2>

          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => {
              if (e.target.files) {
                setSelectedFile(e.target.files[0]);
              }
            }}
            className="w-full bg-zinc-800 p-4 rounded-lg"
          />

          <button
            onClick={handleUpload}
            disabled={loading}
            className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 transition p-4 rounded-lg font-semibold"
          >
            {loading
              ? "🤖 Gemini is generating notes..."
              : "Upload & Generate Notes"}
          </button>

        </div>

        {uploadResult && (

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mt-10">

            <h2 className="text-2xl font-bold flex items-center gap-3 mb-5">

              <FaRobot />

              AI Generated Notes

            </h2>

            <div className="text-sm text-gray-400 mb-5">

              <p>📄 {uploadResult.filename}</p>

              <p>{uploadResult.characters} characters extracted</p>

            </div>

            <div className="prose prose-invert max-w-none">

              <ReactMarkdown>

                {uploadResult.notes}

              </ReactMarkdown>

            </div>

            <button
              onClick={copyNotes}
              className="mt-8 flex items-center gap-2 bg-green-600 hover:bg-green-700 px-5 py-3 rounded-lg"
            >

              <FaCopy />

              Copy Notes

            </button>

          </div>

        )}

      </div>

    </div>
  );
}