"use client";

import { useEffect, useState } from "react";
import { generateFlashcards, getFlashcardsForDocument } from "@/lib/api";
import toast from "react-hot-toast";
import { FaClone, FaChevronLeft, FaChevronRight, FaSyncAlt } from "react-icons/fa";

interface FlashcardsProps {
  documentId: number;
  filename?: string;
}

interface FlashcardItem {
  id: number;
  question: string;
  answer: string;
}

export default function Flashcards({ documentId, filename }: FlashcardsProps) {
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setCards([]);
    setCurrentIndex(0);
    setFlipped(false);
    loadFlashcards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      const result = await getFlashcardsForDocument(documentId);
      setCards(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const result = await generateFlashcards(documentId, 10);

      if (!Array.isArray(result)) {
        toast.error(result?.detail || "Failed to generate flashcards.");
        return;
      }

      setCards(result);
      setCurrentIndex(0);
      setFlipped(false);
      toast.success("Flashcards generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate flashcards.");
    } finally {
      setGenerating(false);
    }
  };

  const goNext = () => {
    if (cards.length === 0) return;
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const goPrev = () => {
    if (cards.length === 0) return;
    setFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const currentCard = cards[currentIndex];

  return (
    <section className="border-l-2 border-dashed border-amber-400/30 pl-6">
      <div className="rounded-3xl border border-fuchsia-400/15 bg-gradient-to-b from-zinc-900/60 to-fuchsia-950/10 p-7 shadow-2xl shadow-black/40 md:p-9">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-3 font-serif text-2xl font-bold md:text-3xl">
            <FaClone className="text-fuchsia-300" />
            Flashcards
          </h2>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 rounded-lg border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-2 text-sm font-semibold text-fuchsia-200 transition hover:bg-fuchsia-400/20 disabled:opacity-50"
          >
            <FaSyncAlt className={generating ? "animate-spin" : ""} />
            {generating
              ? "Generating…"
              : cards.length > 0
              ? "Regenerate"
              : "Generate flashcards"}
          </button>
        </div>

        {loading && <p className="text-sm text-zinc-500">Loading flashcards…</p>}

        {!loading && cards.length === 0 && !generating && (
          <p className="text-sm text-zinc-500">
            No flashcards yet{filename ? ` for ${filename}` : ""}. Generate a
            set to start reviewing.
          </p>
        )}

        {!loading && generating && cards.length === 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-5">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-fuchsia-400 border-t-transparent" />
            <p className="text-sm text-zinc-500">
              Reading the document and writing flashcards…
            </p>
          </div>
        )}

        {!loading && currentCard && (
          <div>
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Card {currentIndex + 1} of {cards.length}
            </p>

            <div
              className="mx-auto h-64 w-full max-w-xl cursor-pointer [perspective:1200px]"
              onClick={() => setFlipped((f) => !f)}
            >
              <div
                className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
                style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
              >
                {/* Front */}
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-amber-400/25 bg-gradient-to-br from-zinc-900 to-black p-8 text-center shadow-xl [backface-visibility:hidden]">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-300">
                    Question
                  </p>
                  <p className="font-serif text-lg leading-snug text-white md:text-xl">
                    {currentCard.question}
                  </p>
                  <p className="absolute bottom-4 text-xs text-zinc-600">
                    Click to flip
                  </p>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-teal-400/25 bg-gradient-to-br from-teal-950 to-black p-8 text-center shadow-xl [backface-visibility:hidden]"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-teal-300">
                    Answer
                  </p>
                  <p className="text-base leading-relaxed text-zinc-200 md:text-lg">
                    {currentCard.answer}
                  </p>
                  <p className="absolute bottom-4 text-xs text-zinc-600">
                    Click to flip back
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={goPrev}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/10"
              >
                <FaChevronLeft />
                Prev
              </button>
              <button
                onClick={goNext}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/10"
              >
                Next
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}