"use client";

import { useEffect, useState } from "react";
import { getProfile, uploadFile } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [user, setUser] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
      router.push("/login");
      return;
    }

    setToken(savedToken);

getProfile().then((data) => {
  setUser(data);
});
  }, [router]);
  const handleUpload = async () => {
  if (!selectedFile) return;

  const result = await uploadFile(selectedFile);

  setUploadResult(result);
};

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">
          AI Study Notes Generator
        </h1>

        <button
          onClick={logout}
          className="bg-red-600 px-5 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="bg-zinc-900 rounded-xl p-8">

        <h2 className="text-2xl mb-6">
          Dashboard
        </h2>

        <div className="mb-8">
  <p className="text-green-400 font-semibold">
    ✅ Logged in successfully
  </p>

  {user && (
    <div className="mt-3 text-gray-300">
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  )}
</div>

        <div className="space-y-5">

  <input
    type="file"
    accept=".pdf,.docx"
    onChange={(e) => {
      if (e.target.files) {
        setSelectedFile(e.target.files[0]);
      }
    }}
    className="w-full bg-zinc-800 p-3 rounded"
  />

  <button
    onClick={handleUpload}
    className="w-full bg-indigo-600 p-4 rounded"
  >
    Upload File
  </button>

  {uploadResult && (
    <div className="bg-zinc-800 rounded p-4 mt-5">

      <h3 className="font-bold mb-2">
        {uploadResult.filename}
      </h3>

      <p>
        Characters: {uploadResult.characters}
      </p>

      <h4 className="mt-4 font-semibold">
        Preview
      </h4>

      <pre className="whitespace-pre-wrap text-sm mt-2">
        {uploadResult.preview}
      </pre>

      <button
        className="mt-6 w-full bg-green-600 p-3 rounded"
      >
        🤖 Generate AI Notes
      </button>

    </div>
  )}

</div>

      </div>
    </div>
  );
}