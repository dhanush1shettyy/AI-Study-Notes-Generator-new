"use client";

import { useEffect, useRef } from "react";

export default function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!ref.current) return;
      ref.current.style.setProperty("--x", `${e.clientX}px`);
      ref.current.style.setProperty("--y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-10 transition-opacity duration-300"
      style={{
        background:
          "radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(251,191,36,0.08), rgba(45,212,191,0.05), transparent 70%)",
      }}
    />
  );
}