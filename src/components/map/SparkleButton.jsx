import React, { useState } from "react";

export default function SparkleButton({ onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-xl"
        style={{ boxShadow: hovered ? "0 0 20px rgba(168,85,247,0.5)" : undefined }}
      >
        ✨
      </button>
      {hovered && (
        <div className="absolute right-14 top-1/2 -translate-y-1/2 bg-card border border-border rounded-xl px-3 py-2 shadow-xl text-xs font-medium text-foreground whitespace-nowrap pointer-events-none z-10">
          Surprise me! ✨
          <div className="text-muted-foreground text-xs mt-0.5">Zufälliger vorschlag zu den ausgewählten Filtern passend</div>
        </div>
      )}
    </div>
  );
}