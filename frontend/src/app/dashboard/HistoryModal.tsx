"use client";

import { useEffect, useMemo, useState } from "react";
import { getDocuments, deleteDocument, renameDocument } from "@/lib/api";
import toast from "react-hot-toast";
import {
  FaFileAlt,
  FaTimes,
  FaHistory,
  FaSearch,
  FaPen,
  FaTrash,
  FaCheck,
  FaBan,
} from "react-icons/fa";

interface HistoryModalProps {
  onClose: () => void;
  onSelectDocument: (doc: any) => void;
}

export default function HistoryModal({ onClose, onSelectDocument }: HistoryModalProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    setLoading(true);
    getDocuments()
      .then((data) => setDocuments(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  const filteredDocuments = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((doc) =>
      doc.filename?.toLowerCase().includes(q)
    );
  }, [documents, query]);

  const startRename = (doc: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(doc.id);
    setEditValue(doc.filename);
  };

  const cancelRename = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditValue("");
  };

  const saveRename = async (docId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const trimmed = editValue.trim();

    if (!trimmed) {
      toast.error("Filename can't be empty.");
      return;
    }

    try {
      setSavingId(docId);
      const result = await renameDocument(docId, trimmed);

      if (!result?.id) {
        toast.error(result?.detail || "Failed to rename document.");
        return;
      }

      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, filename: result.filename } : d))
      );
      toast.success("Document renamed.");
      setEditingId(null);
      setEditValue("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to rename document.");
    } finally {
      setSavingId(null);
    }
  };

  const confirmDelete = (docId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(docId);
  };

  const cancelDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setConfirmDeleteId(null);
  };

  const performDelete = async (docId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      setDeletingId(docId);
      const result = await deleteDocument(docId);

      if (result?.detail !== "Document deleted") {
        toast.error(result?.detail || "Failed to delete document.");
        return;
      }

      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      toast.success("Document deleted.");
      setConfirmDeleteId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete document.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl border border-amber-400/20 bg-zinc-900/95 p-8 shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-3 font-serif text-2xl font-bold text-white">
            <FaHistory className="text-amber-300" />
            Upload history
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {!loading && documents.length > 0 && (
          <div className="relative mb-6">
            <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents by filename…"
              className="w-full rounded-xl border border-zinc-700 bg-black/30 py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
            />
          </div>
        )}

        {loading && <p className="text-sm text-zinc-500">Loading history…</p>}

        {!loading && documents.length === 0 && (
          <p className="text-sm text-zinc-500">No documents uploaded yet.</p>
        )}

        {!loading && documents.length > 0 && filteredDocuments.length === 0 && (
          <p className="text-sm text-zinc-500">
            No documents match &ldquo;{query}&rdquo;.
          </p>
        )}

        <div className="space-y-3">
          {filteredDocuments.map((doc) => {
            const isEditing = editingId === doc.id;
            const isConfirmingDelete = confirmDeleteId === doc.id;

            return (
              <div
                key={doc.id}
                onClick={() => !isEditing && !isConfirmingDelete && onSelectDocument(doc)}
                className={`flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left shadow-md shadow-black/20 transition ${
                  !isEditing && !isConfirmingDelete
                    ? "cursor-pointer hover:border-amber-400/40 hover:bg-white/10"
                    : ""
                }`}
              >
                <FaFileAlt className="shrink-0 text-2xl text-amber-300" />

                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveRename(doc.id, e as any);
                        if (e.key === "Escape") cancelRename();
                      }}
                      className="w-full rounded-lg border border-amber-400/40 bg-black/40 px-3 py-1.5 text-sm text-white focus:outline-none"
                    />
                  ) : isConfirmingDelete ? (
                    <p className="text-sm font-semibold text-red-300">
                      Delete &ldquo;{doc.filename}&rdquo;? This can&apos;t be undone.
                    </p>
                  ) : (
                    <>
                      <p className="truncate font-semibold text-white">{doc.filename}</p>
                      <p className="text-sm text-zinc-500">
                        {new Date(doc.uploaded_at).toLocaleString()} · {doc.file_type.toUpperCase()}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={(e) => saveRename(doc.id, e)}
                        disabled={savingId === doc.id}
                        className="rounded-lg border border-teal-400/40 bg-teal-400/10 p-2 text-teal-200 transition hover:bg-teal-400/20 disabled:opacity-50"
                        title="Save"
                      >
                        <FaCheck size={12} />
                      </button>
                      <button
                        onClick={cancelRename}
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:bg-white/10"
                        title="Cancel"
                      >
                        <FaBan size={12} />
                      </button>
                    </>
                  ) : isConfirmingDelete ? (
                    <>
                      <button
                        onClick={(e) => performDelete(doc.id, e)}
                        disabled={deletingId === doc.id}
                        className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {deletingId === doc.id ? "Deleting…" : "Confirm"}
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:bg-white/10"
                        title="Cancel"
                      >
                        <FaBan size={12} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => startRename(doc, e)}
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:border-amber-400/40 hover:text-amber-300"
                        title="Rename"
                      >
                        <FaPen size={12} />
                      </button>
                      <button
                        onClick={(e) => confirmDelete(doc.id, e)}
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:border-red-500/40 hover:text-red-300"
                        title="Delete"
                      >
                        <FaTrash size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}