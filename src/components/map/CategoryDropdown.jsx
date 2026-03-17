import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Coffee, BookOpen, Building2, TreePine, Layers, MapPin, Check, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryColors } from "./MapView";

export const categories = [
  { value: "cafe", label: "Café", icon: Coffee },
  { value: "library", label: "Library", icon: BookOpen },
  { value: "coworking", label: "Coworking", icon: Building2 },
  { value: "university", label: "University", icon: Layers },
  { value: "park", label: "Park", icon: TreePine },
  { value: "other", label: "Other", icon: MapPin },
];

export default function CategoryDropdown({ selectedCategories, toggleCategory, showFavorites, setShowFavorites }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeCount = selectedCategories.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all border",
          activeCount > 0
            ? "bg-primary text-primary-foreground border-primary shadow-sm"
            : "bg-card text-foreground border-border hover:bg-secondary"
        )}
      >
        <span>Category</span>
        {activeCount > 0 && (
          <span className="bg-white/30 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {activeCount}
          </span>
        )}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5">
              Pin Legend & Filter
            </p>
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategories.includes(cat.value);
              const color = categoryColors[cat.value];
              return (
                <button
                  key={cat.value}
                  onClick={() => toggleCategory(cat.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                    isActive ? "bg-secondary" : "hover:bg-secondary/60"
                  )}
                >
                  {/* Teardrop color swatch */}
                  <svg width="14" height="18" viewBox="0 0 14 18">
                    <path d="M7 1 C7 1, 1 7, 1 11 C1 14.3 3.7 17 7 17 C10.3 17 13 14.3 13 11 C13 7 7 1 7 1Z"
                      fill={color} stroke="white" strokeWidth="1" />
                  </svg>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-left font-medium">{cat.label}</span>
                  {isActive && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}

            <div className="border-t border-border mt-1 pt-1">
              <button
                onClick={() => { setShowFavorites(!showFavorites); setOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                  showFavorites ? "bg-amber-50 text-amber-700" : "hover:bg-secondary/60"
                )}
              >
                <Bookmark className={cn("h-4 w-4", showFavorites ? "fill-amber-500 text-amber-500" : "text-muted-foreground")} />
                <span className="flex-1 text-left font-medium">Favorites</span>
                {showFavorites && <Check className="h-4 w-4 text-amber-500" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}