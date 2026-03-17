import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Bookmark, MapPin, User, Coffee, BookOpen, Building2, TreePine, Layers, LogOut, Users, Clock, Pencil, UserPlus, Check, X, AlertCircle } from "lucide-react";
import StudyGroupDetail from "@/components/groups/StudyGroupDetail";
import LocationDetail from "@/components/map/LocationDetail";
import { cn } from "@/lib/utils";
import { format, isPast } from "date-fns";

const categoryConfig = {
  cafe: { label: "Café", icon: Coffee, color: "bg-amber-100 text-amber-700" },
  library: { label: "Library", icon: BookOpen, color: "bg-blue-100 text-blue-700" },
  coworking: { label: "Coworking", icon: Building2, color: "bg-purple-100 text-purple-700" },
  university: { label: "University", icon: Layers, color: "bg-emerald-100 text-emerald-700" },
  park: { label: "Park", icon: TreePine, color: "bg-green-100 text-green-700" },
  other: { label: "Other", icon: MapPin, color: "bg-gray-100 text-gray-700" },
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("spots");
  const [openGroupId, setOpenGroupId] = useState(null);
  const [openLocationId, setOpenLocationId] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPicUrl, setEditPicUrl] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setEditName(u?.full_name || "");
      setEditBio(u?.bio || "");
      setEditPicUrl(u?.profile_picture || "");
    }).catch(() => {});
  }, []);

  const { data: allLocations = [] } = useQuery({ queryKey: ["studyLocations"], queryFn: () => [] });
  const { data: favorites = [] } = useQuery({ queryKey: ["favorites"], queryFn: () => JSON.parse(localStorage.getItem('favorites') || '[]') });
  const { data: allGroups = [] } = useQuery({ queryKey: ["studyGroups"], queryFn: () => [] });
  const { data: myMemberships = [] } = useQuery({ queryKey: ["studyGroupMembers"], queryFn: () => [] });
  const { data: groupBookmarks = [] } = useQuery({ queryKey: ["groupBookmarks"], queryFn: () => [] });
  const { data: friendRequests = [] } = useQuery({ queryKey: ["friendRequests", user?.email], queryFn: () => [] });
  const { data: sentRequests = [] } = useQuery({ queryKey: ["sentRequests", user?.email], queryFn: () => [] });

  const acceptFriendMutation = useMutation({
    mutationFn: (id) => base44.entities.FriendRequest.update(id, { status: "accepted" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friendRequests", user?.email] }),
  });
  const rejectFriendMutation = useMutation({
    mutationFn: (id) => base44.entities.FriendRequest.update(id, { status: "rejected" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friendRequests", user?.email] }),
  });

  const saveProfileMutation = useMutation({
    mutationFn: () => Promise.resolve(), // Mock
    onSuccess: async () => {
      const updated = user; // Mock
      setUser(updated);
      setEditingProfile(false);
      queryClient.invalidateQueries();
    },
  });

  const pendingRequests = friendRequests.filter((r) => r.status === "pending");
  const acceptedFriends = [...friendRequests.filter((r) => r.status === "accepted"), ...sentRequests.filter((r) => r.status === "accepted")];

  const favoriteLocations = allLocations.filter((l) => favorites.some((f) => f.location_id === l.id));

  const myGroupIds = new Set(myMemberships.filter((m) => m.user_email === user?.email).map((m) => m.group_id));
  const bookmarkedGroupIds = new Set(groupBookmarks.filter((b) => b.user_email === user?.email).map((b) => b.group_id));
  const allRelatedGroupIds = new Set([...myGroupIds, ...bookmarkedGroupIds]);
  const relatedGroups = allGroups.filter((g) => allRelatedGroupIds.has(g.id));

  const upcomingGroups = relatedGroups.filter((g) => !isPast(new Date(g.date_time)) && g.status !== "cancelled");
  const pastGroups = relatedGroups.filter((g) => isPast(new Date(g.date_time)) || g.status === "cancelled");

  // Stats
  const sessionsAttended = pastGroups.filter((g) => {
    const m = myMemberships.find((m) => m.group_id === g.id && m.user_email === user?.email);
    return m && m.role !== "host" && m.status === "confirmed";
  }).length;
  const sessionsCreated = allGroups.filter((g) => g.host_email === user?.email).length;

  // Pending applications to groups I host
  const myHostedGroupIds = allGroups.filter((g) => g.host_email === user?.email).map((g) => g.id);
  const pendingApplications = myMemberships.filter((m) => myHostedGroupIds.includes(m.group_id) && m.status === "pending");

  const totalNotifications = pendingRequests.length + pendingApplications.length;

  const getMyRole = (groupId) => myMemberships.find((m) => m.group_id === groupId && m.user_email === user?.email);

  const renderGroupItem = (group) => {
    const membership = getMyRole(group.id);
    const isBookmarked = bookmarkedGroupIds.has(group.id);
    const statusLabel = group.status === "cancelled" ? "Cancelled" : membership?.role === "host" ? "Host" : membership?.status === "pending" ? "Pending" : isBookmarked ? "Saved" : "Member";
    const statusColor = group.status === "cancelled" ? "bg-destructive/10 text-destructive" : membership?.role === "host" ? "bg-primary/10 text-primary" : membership?.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-secondary text-muted-foreground";
    return (
      <button key={group.id} onClick={() => setOpenGroupId(group.id)}
        className="w-full flex items-center gap-3 p-3.5 bg-card rounded-2xl border border-border hover:border-primary/40 hover:bg-secondary transition-all text-left">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{group.title}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3" />
            {group.date_time ? format(new Date(group.date_time), "MMM d, yyyy · HH:mm") : "No date"}
          </div>
        </div>
        <span className={cn("text-xs px-2 py-1 rounded-lg font-medium flex-shrink-0", statusColor)}>{statusLabel}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </button>

        {/* Profile card */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-4">
          {editingProfile ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {editPicUrl ? <img src={editPicUrl} alt="" className="w-full h-full object-cover" /> : <User className="h-8 w-8 text-primary" />}
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Profile picture URL</label>
                  <Input value={editPicUrl} onChange={(e) => setEditPicUrl(e.target.value)} placeholder="https://..." className="rounded-xl mt-1" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Display name</label>
                <Input value={editName} disabled className="rounded-xl mt-1 opacity-60" placeholder="Name set by your account" />
                <p className="text-xs text-muted-foreground mt-1">Name is managed by your account provider.</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Bio</label>
                <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Tell others about yourself..." rows={2} className="rounded-xl resize-none mt-1" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => saveProfileMutation.mutate()} className="rounded-xl">Speichern</Button>
                <Button size="sm" variant="outline" onClick={() => setEditingProfile(false)} className="rounded-xl">Abbrechen</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user?.profile_picture ? <img src={user.profile_picture} alt="" className="w-full h-full object-cover" /> : <User className="h-8 w-8 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate">{user?.full_name || "—"}</h1>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                {user?.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{user.bio}</p>}
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{acceptedFriends.length} StudyBuddy{acceptedFriends.length !== 1 ? "s" : ""}</span>
                  {user?.created_date && <span>Beigreteten im {format(new Date(user.created_date), "MMMM yyyy")}</span>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setEditingProfile(true)} className="text-muted-foreground hover:text-foreground">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {}} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications: friend requests & pending apps */}
        {totalNotifications > 0 && (
          <div className="bg-card rounded-2xl border border-amber-200 p-4 mb-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              {totalNotifications} ungelesene Nachrichten{totalNotifications !== 1 ? "s" : ""}
            </h3>
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-primary" />
                  <span className="text-sm"><span className="font-medium">{req.from_name || req.from_email}</span> will dein StudyBuddy sein</span>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" className="h-7 rounded-lg" onClick={() => acceptFriendMutation.mutate(req.id)}>
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 rounded-lg text-destructive" onClick={() => rejectFriendMutation.mutate(req.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {pendingApplications.map((m) => {
              const g = allGroups.find((g) => g.id === m.group_id);
              return (
                <div key={m.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm"><span className="font-medium">{m.user_name || m.user_email}</span> applied to <span className="font-medium">{g?.title}</span></span>
                  </div>
                  <button onClick={() => navigate("/StudyGroups")} className="text-xs text-primary hover:underline">Review →</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-primary">{acceptedFriends.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Buddies</div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-primary">{sessionsAttended}</div>
            <div className="text-xs text-muted-foreground mt-1">Sessions besucht</div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-primary">{sessionsCreated}</div>
            <div className="text-xs text-muted-foreground mt-1">Sessions erstellt</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-5">
          {[
            ["spots", `Spots (${favoriteLocations.length})`],
            ["upcoming", `Upcoming (${upcomingGroups.length})`],
            ["past", `Past (${pastGroups.length})`],
          ].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={cn("flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap", activeTab === key ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground")}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === "spots" && (
          favoriteLocations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bookmark className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Noch keine gespeicherten Spots.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {favoriteLocations.map((loc) => {
                const cat = categoryConfig[loc.category] || categoryConfig.other;
                const Icon = cat.icon;
                return (
                  <button key={loc.id} onClick={() => setOpenLocationId(loc.id)}
                    className="w-full flex items-center gap-3 p-3.5 bg-card rounded-2xl border border-border hover:border-primary/40 hover:bg-secondary transition-all text-left">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                      {loc.image_url ? <img src={loc.image_url} alt="" className="w-full h-full object-cover" /> :
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center"><Icon className="h-5 w-5 text-primary" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{loc.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{loc.address}</div>
                    </div>
                    <span className={cn("text-xs px-2 py-1 rounded-lg font-medium flex-shrink-0", cat.color)}>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          )
        )}

        {activeTab === "upcoming" && (
          upcomingGroups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Keine anstehenden Study Sessions..</p>
              <button onClick={() => navigate("/StudyGroups")} className="text-primary text-sm mt-2 hover:underline">Gruppen durchsuchen →</button>
            </div>
          ) : (
            <div className="space-y-3">{upcomingGroups.map(renderGroupItem)}</div>
          )
        )}

        {activeTab === "past" && (
          pastGroups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Noch keine vergangenen Study Sessions.</p>
            </div>
          ) : (
            <div className="space-y-3">{pastGroups.map(renderGroupItem)}</div>
          )
        )}
      </div>

      {openLocationId && (() => {
        const loc = allLocations.find((l) => l.id === openLocationId);
        if (!loc) return null;
        return (
          <LocationDetail
            location={loc}
            onClose={() => setOpenLocationId(null)}
            isFavorite={favorites.some((f) => f.location_id === loc.id)}
            onToggleFavorite={() => {}}
            user={user}
            hideNavigation={true}
          />
        );
      })()}

      {openGroupId && (() => {
        const group = allGroups.find((g) => g.id === openGroupId);
        if (!group) return null;
        const bookmarkIds = new Set(groupBookmarks.filter((b) => b.user_email === user?.email).map((b) => b.group_id));
        return (
          <StudyGroupDetail
            group={group}
            user={user}
            members={myMemberships}
            isBookmarked={bookmarkIds.has(group.id)}
            onBookmark={() => {}}
            onClose={() => setOpenGroupId(null)}
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ["studyGroups"] })}
          />
        );
      })()}
    </div>
  );
}