import React, { useState } from "react";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

const joinTypes = [
  { value: "open", label: "Open" },
  { value: "signup", label: "Sign up" },
  { value: "apply", label: "Apply" },
  { value: "invite_only", label: "Invite only" },
];

const categories = [
  { value: "cafe", label: "Café" },
  { value: "library", label: "Library" },
  { value: "coworking", label: "Coworking" },
  { value: "university", label: "University" },
  { value: "park", label: "Park" },
  { value: "online", label: "Online" },
  { value: "other", label: "Other" },
];

export default function GroupFilters({ filters, setFilters }) {
  const [expanded, setExpanded] = useState(false);

  const toggleJoinType = (v) =>
    setFilters((f) => ({ ...f, joinType: f.joinType.includes(v) ? f.joinType.filter((x) => x !== v) : [...f.joinType, v] }));

  const toggleCategory = (v) =>
    setFilters((f) => ({ ...f, category: f.category.includes(v) ? f.category.filter((x) => x !== v) : [...f.category, v] }));

  const hasActive = filters.joinType.length > 0 || filters.category.length > 0 || filters.availability !== "all" || filters.dateFrom || filters.dateTo || filters.hideCancelled;

  const clearAll = () => setFilters({ joinType: [], category: [], availability: "all", dateFrom: "", dateTo: "", hideCancelled: false });

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setExpanded((e) => !e)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all",
            expanded || hasActive ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-muted-foreground hover:bg-secondary"
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          Filters
          {(() => {
            const count = filters.joinType.length + filters.category.length + (filters.availability !== "all" ? 1 : 0) + (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0);
            return count > 0 ? <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 ml-1">{count}</span> : null;
          })()}
        </button>

        {["all", "available"].map((v) => (
          <button
            key={v}
            onClick={() => setFilters((f) => ({ ...f, availability: v }))}
            className={cn(
              "px-3 py-2 rounded-xl text-sm font-medium border transition-all",
              filters.availability === v ? "bg-accent text-accent-foreground border-accent" : "bg-card border-border text-muted-foreground hover:bg-secondary"
            )}
          >
            {v === "all" ? "All" : "Spots available"}
          </button>
        ))}
        <button
          onClick={() => setFilters((f) => ({ ...f, hideCancelled: !f.hideCancelled }))}
          className={cn(
            "px-3 py-2 rounded-xl text-sm font-medium border transition-all",
            filters.hideCancelled ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-muted-foreground hover:bg-secondary"
          )}
        >
          Hide cancelled
        </button>

        {hasActive && (
          <button onClick={clearAll} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-3 p-4 bg-card rounded-2xl border border-border space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Join Type</p>
            <div className="flex flex-wrap gap-2">
              {joinTypes.map((jt) => (
                <button
                  key={jt.value}
                  onClick={() => toggleJoinType(jt.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm border transition-all",
                    filters.joinType.includes(jt.value) ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {jt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Location Type</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => toggleCategory(cat.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm border transition-all",
                    filters.category.includes(cat.value) ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Date Range</p>
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">From</span>
                <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                  className="px-2 py-1.5 rounded-lg border border-border bg-background text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">To</span>
                <input type="date" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
                  className="px-2 py-1.5 rounded-lg border border-border bg-background text-sm" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}