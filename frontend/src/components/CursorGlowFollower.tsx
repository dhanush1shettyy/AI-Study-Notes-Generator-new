"use client";

import { useEffect, useRef } from "react";

export default function CursorGlowFollower() {
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { x: target.x, y: target.y };

    const handleMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMove);

    // Lower = more lag/trail, higher = snappier
    const EASE = 0.06;

    let rafId: number;
    const animate = () => {
      pos.x += (target.x - pos.x) * EASE;
      pos.y += (target.y - pos.y) * EASE;

      if (blobRef.current) {
        blobRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      }

      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes nebula-drift {
          0%   { background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%; }
          25%  { background-position: 15% -10%, -10% 15%, 10% 10%, -15% -5%; }
          50%  { background-position: -10% 10%, 15% -10%, -15% 5%, 10% 15%; }
          75%  { background-position: 10% 15%, -15% -5%, 5% -15%, -10% 10%; }
          100% { background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%; }
        }
      `}</style>
      <div
        ref={blobRef}
        className="pointer-events-none fixed left-0 top-0 z-0 h-[380px] w-[460px] opacity-90 mix-blend-screen will-change-transform"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 55% 45% at 30% 35%, rgba(6,182,212,0.55) 0%, transparent 70%),
            radial-gradient(ellipse 50% 55% at 68% 40%, rgba(168,85,247,0.5) 0%, transparent 70%),
            radial-gradient(ellipse 50% 50% at 55% 70%, rgba(217,70,239,0.45) 0%, transparent 70%),
            radial-gradient(ellipse 45% 40% at 75% 65%, rgba(249,115,22,0.3) 0%, transparent 70%)
          `,
          backgroundSize: "200% 200%",
          filter: "blur(55px)",
          animation: "nebula-drift 12s ease-in-out infinite",
        }}
      />
    </>
  );
}