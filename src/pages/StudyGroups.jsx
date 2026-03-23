import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, X, Users } from "lucide-react";
import Navbar from "@/components/nav/Navbar";
import StudyGroupCard from "@/components/groups/StudyGroupCard";

// Demo data - bis Backend funktioniert
const DEMO_GROUPS = [
  {
    id: "1",
    title: "Mathe Lerngruppe",
    description: "Gemeinsames Lernen für Analysis und Lineare Algebra",
    subject: "Mathematik",
    date_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    location_name: "Café Einstein",
    location_address: "Einsteinstraße 42, München",
    host_name: "Max Müller",
    host_email: "max@example.com",
    join_type: "open",
    max_size: 8,
    status: "upcoming",
    enable_chat: true,
  },
  {
    id: "2",
    title: "Physik Klausurvorbereitung",
    description: "Vorbereitung für die Physik-Klausur Anfang April",
    subject: "Physik",
    date_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    location_name: "TU München Bibliothek",
    location_address: "Arcisstraße 21, München",
    host_name: "Sarah Schmidt",
    host_email: "sarah@example.com",
    join_type: "signup",
    max_size: 6,
    status: "upcoming",
    enable_chat: false,
  },
  {
    id: "3",
    title: "Programmieren in Python",
    description: "Anfänger-freundlich, für alle die Programmieren lernen wollen",
    subject: "Informatik",
    date_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    location_name: "Coworking Space Munich",
    location_address: "Sendlinger Straße 10, München",
    host_name: "Alex Johnson",
    host_email: "alex@example.com",
    join_type: "open",
    max_size: null,
    status: "upcoming",
    enable_chat: true,
  },
];

const DEMO_MEMBERS = [
  { id: "m1", group_id: "1", user_email: "max@example.com", user_name: "Max Müller", status: "confirmed", role: "host" },
  { id: "m2", group_id: "1", user_email: "anna@example.com", user_name: "Anna Weber", status: "confirmed", role: "member" },
  { id: "m5", group_id: "1", user_email: "ben@example.com", user_name: "Ben Fischer", status: "confirmed", role: "member" },
  { id: "m3", group_id: "2", user_email: "sarah@example.com", user_name: "Sarah Schmidt", status: "confirmed", role: "host" },
  { id: "m6", group_id: "2", user_email: "julia@example.com", user_name: "Julia Lange", status: "confirmed", role: "member" },
  { id: "m4", group_id: "3", user_email: "alex@example.com", user_name: "Alex Johnson", status: "confirmed", role: "host" },
  { id: "m7", group_id: "3", user_email: "demo@example.com", user_name: "Demo User", status: "confirmed", role: "member" },
];

export default function StudyGroups() {
  const [user, setUser] = useState({
    email: "demo@example.com",
    full_name: "Demo User",
  });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    joinType: [],
    category: [],
    availability: "all",
    dateFrom: "",
    dateTo: "",
    hideCancelled: false,
  });
  const [sortBy, setSortBy] = useState("date_asc");

  const getMemberCount = (groupId) =>
    DEMO_MEMBERS.filter((m) => m.group_id === groupId && m.status === "confirmed").length;

  const filtered = useMemo(() => {
    let result = [...DEMO_GROUPS];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.title?.toLowerCase().includes(q) ||
          g.subject?.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "date_asc") return new Date(a.date_time) - new Date(b.date_time);
      if (sortBy === "date_desc") return new Date(b.date_time) - new Date(a.date_time);
      return 0;
    });

    return result;
  }, [searchQuery, sortBy]);

  const bookmarkIds = new Set();

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="pt-[64px]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" /> StudySessions
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Finde Leute mit denen du gemeinsam in München lernst
              </p>
            </div>
            <Button className="rounded-xl gap-2">
              <Plus className="h-4 w-4" /> Erstelle eine StudySession
            </Button>
          </div>

          {/* Search + Sort */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Titel, Thema, Beschreibung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-card text-sm"
            >
              <option value="date_asc">Datum ↑</option>
              <option value="date_desc">Datum ↓</option>
            </select>
          </div>

          {/* Results */}
          <p className="text-xs text-muted-foreground mb-4">
            {filtered.length} Session{filtered.length !== 1 ? "s" : ""} gefunden
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">Keine StudySession gefunden</p>
              <p className="text-sm mt-1">
                Versuche deine Filter anzupassen oder erstelle ein eigenes Treffen!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((group) => (
                <StudyGroupCard
                  key={group.id}
                  group={group}
                  memberCount={getMemberCount(group.id)}
                  isBookmarked={bookmarkIds.has(group.id)}
                  onBookmark={() => console.log("Bookmark:", group.id)}
                  onClick={() => setSelectedGroup(group)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}