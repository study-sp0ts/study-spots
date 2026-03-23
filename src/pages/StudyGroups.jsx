import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, X, Users, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Navbar from "@/components/nav/Navbar";
import StudyGroupCard from "@/components/groups/StudyGroupCard";
import StudyGroupDetail from "@/components/groups/StudyGroupDetail";
import CreateGroupModal from "@/components/groups/CreateGroupModal";
import GroupFilters from "@/components/groups/GroupFilters";

export default function StudyGroups() {
  const [user, setUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ joinType: [], category: [], availability: "all", dateFrom: "", dateTo: "", hideCancelled: false });
  const [sortBy, setSortBy] = useState("date_asc");
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      console.log("Auth failed, continuing without user");
    });
  }, []);

  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["studyGroups"],
    queryFn: async () => {
      try {
        return await base44.entities.StudyGroup.list();
      } catch (error) {
        console.log("Base44 StudyGroup list failed, showing empty list");
        return [];
      }
    },
  });

  const { data: members = [] } = useQuery({
    queryKey: ["studyGroupMembers"],
    queryFn: async () => {
      try {
        return await base44.entities.StudyGroupMember.list();
      } catch (error) {
        console.log("Base44 StudyGroupMember list failed");
        return [];
      }
    },
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ["groupBookmarks"],
    queryFn: async () => {
      try {
        return await base44.entities.StudyGroupBookmark.list();
      } catch (error) {
        console.log("Base44 StudyGroupBookmark list failed");
        return [];
      }
    },
    enabled: !!user,
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (groupId) => {
      const existing = bookmarks.find((b) => b.group_id === groupId && b.user_email === user.email);
      if (existing) {
        await base44.entities.StudyGroupBookmark.delete(existing.id);
      } else {
        await base44.entities.StudyGroupBookmark.create({ group_id: groupId, user_email: user.email });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groupBookmarks"] }),
  });

  const getMemberCount = (groupId) => members.filter((m) => m.group_id === groupId && m.status === "confirmed").length;

  const filtered = useMemo(() => {
    const now = new Date();
    let result = [...groups].filter((g) => {
      // Hide groups that ended more than 1h ago (unless date filter shows past)
      if (!filters.dateFrom || new Date(filters.dateFrom) >= now) {
        const endTime = g.end_time ? new Date(g.end_time) : new Date(new Date(g.date_time).getTime() + 3 * 60 * 60 * 1000);
        if (now > new Date(endTime.getTime() + 60 * 60 * 1000)) return false;
      }
      if (filters.hideCancelled && g.status === "cancelled") return false;
      return true;
    });
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((g) => g.title?.toLowerCase().includes(q) || g.subject?.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q));
    }
    if (filters.joinType.length > 0) result = result.filter((g) => filters.joinType.includes(g.join_type));
    if (filters.category.length > 0) result = result.filter((g) => filters.category.includes(g.category));
    if (filters.dateFrom) result = result.filter((g) => new Date(g.date_time) >= new Date(filters.dateFrom));
    if (filters.dateTo) result = result.filter((g) => new Date(g.date_time) <= new Date(filters.dateTo + "T23:59:59"));
    if (filters.availability === "available") {
      result = result.filter((g) => !g.max_size || getMemberCount(g.id) < g.max_size);
    }
    result.sort((a, b) => {
      if (sortBy === "date_asc") return new Date(a.date_time) - new Date(b.date_time);
      if (sortBy === "date_desc") return new Date(b.date_time) - new Date(a.date_time);
      return 0;
    });
    return result;
  }, [groups, members, searchQuery, filters, sortBy]);

  const bookmarkIds = new Set(bookmarks.filter((b) => b.user_email === user?.email).map((b) => b.group_id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="pt-[64px]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-primary" /> StudySessions</h1>
              <p className="text-sm text-muted-foreground mt-1">Finde Leute mit denen du gemeinsam in München lernst</p>
            </div>
            <Button onClick={() => {
              if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
              setShowCreate(true);
            }} className="rounded-xl gap-2">
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
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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

          <GroupFilters filters={filters} setFilters={setFilters} />

          {/* Results */}
          <p className="text-xs text-muted-foreground mb-4">{filtered.length} Session{filtered.length !== 1 ? "s" : ""} gefunden</p>

          {groupsLoading ? (
            <div className="text-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">StudySessions werden geladen...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">Keine StudySession gefunden</p>
              <p className="text-sm mt-1">Versuche deine Filter anzupassen oder erstelle ein eigenes Treffen!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((group) => (
                <StudyGroupCard
                  key={group.id}
                  group={group}
                  memberCount={getMemberCount(group.id)}
                  isBookmarked={bookmarkIds.has(group.id)}
                  onBookmark={() => user && bookmarkMutation.mutate(group.id)}
                  onClick={() => setSelectedGroup(group)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedGroup && (
        <StudyGroupDetail
          group={selectedGroup}
          user={user}
          members={members}
          isBookmarked={bookmarkIds.has(selectedGroup.id)}
          onBookmark={() => user && bookmarkMutation.mutate(selectedGroup.id)}
          onClose={() => setSelectedGroup(null)}
          onRefresh={(updatedGroup) => {
            queryClient.invalidateQueries({ queryKey: ["studyGroups"] });
            queryClient.invalidateQueries({ queryKey: ["studyGroupMembers"] });
            if (updatedGroup) setSelectedGroup(updatedGroup);
          }}
          allLocations={[]}
        />
      )}

      {showCreate && (
        <CreateGroupModal
          user={user}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["studyGroups"] });
            queryClient.invalidateQueries({ queryKey: ["studyGroupMembers"] });
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}