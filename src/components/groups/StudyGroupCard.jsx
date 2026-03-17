import React from "react";
import { Bookmark, Users, MapPin, Clock, Lock, UserCheck, Globe, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const joinTypeConfig = {
  open: { label: "Open", icon: Globe, color: "bg-emerald-100 text-emerald-700" },
  signup: { label: "Sign up", icon: UserCheck, color: "bg-blue-100 text-blue-700" },
  apply: { label: "Apply", icon: Mail, color: "bg-amber-100 text-amber-700" },
  invite_only: { label: "Invite only", icon: Lock, color: "bg-gray-100 text-gray-600" },
};

export default function StudyGroupCard({ group, memberCount, isBookmarked, onBookmark, onClick }) {
  const jt = joinTypeConfig[group.join_type] || joinTypeConfig.open;
  const JtIcon = jt.icon;
  const isFull = group.max_size && memberCount >= group.max_size;
  const fillPct = group.max_size ? Math.min(100, Math.round((memberCount / group.max_size) * 100)) : null;

  return (
    <div
      onClick={onClick}
      className="bg-card rounded-2xl border border-border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium", jt.color)}>
              <JtIcon className="h-3 w-3" />{jt.label}
            </span>
            {group.subject && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">{group.subject}</span>
            )}
            {isFull && <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">Full</span>}
          </div>
          <h3 className="font-bold text-base truncate">{group.title}</h3>
          {group.description && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{group.description}</p>}

          <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-muted-foreground">
            {group.date_time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {format(new Date(group.date_time), "EEE, MMM d · HH:mm")}
                {group.end_time && ` – ${format(new Date(group.end_time), "HH:mm")}`}
              </span>
            )}
            {group.status === "cancelled" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">Cancelled</span>
            )}
            {group.location_name && (
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{group.location_name}</span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {memberCount}{group.max_size ? ` / ${group.max_size}` : ""} Teilnehmer
            </span>
          </div>

          {fillPct !== null && (
            <div className="mt-2.5">
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", isFull ? "bg-destructive" : "bg-primary")}
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onBookmark(); }}
          className="p-2 rounded-xl hover:bg-secondary transition-colors flex-shrink-0"
        >
          <Bookmark className={cn("h-4 w-4", isBookmarked ? "fill-primary text-primary" : "text-muted-foreground")} />
        </button>
      </div>
    </div>
  );
}