import React from "react";
import { Input } from "@/components/ui/input";
import { Wifi, Plug, X, Coffee, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import CategoryDropdown from "./CategoryDropdown";

const amenities = [
  { value: "has_wifi", label: "WiFi", icon: Wifi },
  { value: "has_outlets", label: "Outlets", icon: Plug },
  { value: "has_beverages", label: "Beverages", icon: Coffee },
  { value: "has_food", label: "Food", icon: UtensilsCrossed },
];

export default function SearchFilterBar({
  searchQuery, setSearchQuery,
  selectedCategories, toggleCategory,
  selectedAmenities, toggleAmenity,
  showFavorites, setShowFavorites,
}) {
  return (
    <div className="absolute top-[72px] left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[680px] z-[1000]">
      <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 p-3 flex flex-col gap-2.5">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <Input
            placeholder="Search study spots in Munich..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-8 h-10 bg-secondary/50 border-0 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-primary"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryDropdown
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            showFavorites={showFavorites}
            setShowFavorites={setShowFavorites}
          />
          <div className="w-px h-6 bg-border" />
          {amenities.map((am) => {
            const Icon = am.icon;
            const isActive = selectedAmenities.includes(am.value);
            return (
              <button
                key={am.value}
                onClick={() => toggleAmenity(am.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border",
                  isActive
                    ? "bg-accent text-accent-foreground border-accent shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {am.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}