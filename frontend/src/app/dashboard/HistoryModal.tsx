"use client";

import { useEffect, useState } from "react";
import { getDocuments } from "@/lib/api";
import { FaFileAlt, FaTimes } from "react-icons/fa";


interface HistoryModalProps {
  onClose: () => void;
  onSelectDocument: (doc: any) => void;
}

export default function HistoryModal({ onClose, onSelectDocument }: HistoryModalProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocuments()
      .then((data) => setDocuments(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">📚 Upload History</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {loading && <p className="text-gray-400">Loading history...</p>}

        {!loading && documents.length === 0 && (
          <p className="text-gray-400">No documents uploaded yet.</p>
        )}

        <div className="space-y-3">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              className="w-full flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10 hover:border-indigo-500/40"
            >
              <FaFileAlt className="text-2xl text-indigo-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{doc.filename}</p>
                <p className="text-sm text-gray-400">
                  {new Date(doc.uploaded_at).toLocaleString()} · {doc.file_type.toUpperCase()}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}