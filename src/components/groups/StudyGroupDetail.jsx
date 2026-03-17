import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Bookmark, Users, MapPin, Clock, Share2, MessageCircle, UserCheck, Lock, Globe, Mail, Check, AlertTriangle, Pencil, ExternalLink, User, Mail as MailIcon, Copy, Upload } from "lucide-react";
import InviteModal from "@/components/groups/InviteModal";
import { cn } from "@/lib/utils";
import { format, isPast, differenceInHours } from "date-fns";

const joinTypeConfig = {
  open: { label: "Open to all", icon: Globe, color: "text-emerald-600" },
  signup: { label: "Sign up required", icon: UserCheck, color: "text-blue-600" },
  apply: { label: "Apply to join", icon: Mail, color: "text-amber-600" },
  invite_only: { label: "Invite only", icon: Lock, color: "text-gray-500" },
};

export default function StudyGroupDetail({ group: initialGroup, user, members, isBookmarked, onBookmark, onClose, onRefresh, allLocations, onOpenLocation }) {
  const [group, setGroup] = useState(initialGroup);
  const [comment, setComment] = useState("");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [newDesc, setNewDesc] = useState(group.description || "");
  const queryClient = useQueryClient();

  const groupMembers = members.filter((m) => m.group_id === group.id);
  const confirmedCount = groupMembers.filter((m) => m.status === "confirmed").length;
  const isCancelled = group.status === "cancelled";
  const isFull = group.max_size && confirmedCount >= group.max_size;
  const isHost = user?.email === group.host_email;
  const myMembership = groupMembers.find((m) => m.user_email === user?.email);
  const hasStarted = isPast(new Date(group.date_time));
  const canCancel = isHost && !hasStarted && !isCancelled && differenceInHours(new Date(group.date_time), new Date()) > 24;

  const jt = joinTypeConfig[group.join_type] || joinTypeConfig.open;
  const JtIcon = jt.icon;

  const { data: comments = [] } = useQuery({
    queryKey: ["groupComments", group.id],
    queryFn: () => base44.entities.StudyGroupComment.filter({ group_id: group.id }),
    enabled: group.enable_chat,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
    enabled: group.enable_chat,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      const status = group.join_type === "open" || group.join_type === "signup" ? "confirmed" : "pending";
      await base44.entities.StudyGroupMember.create({ group_id: group.id, user_email: user.email, user_name: user.full_name, role: "member", status });
    },
    onSuccess: () => { onRefresh(); queryClient.invalidateQueries({ queryKey: ["studyGroupMembers"] }); },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => base44.entities.StudyGroupMember.delete(myMembership.id),
    onSuccess: () => { onRefresh(); queryClient.invalidateQueries({ queryKey: ["studyGroupMembers"] }); },
  });

  const approveMutation = useMutation({
    mutationFn: async (memberId) => base44.entities.StudyGroupMember.update(memberId, { status: "confirmed" }),
    onSuccess: () => { onRefresh(); queryClient.invalidateQueries({ queryKey: ["studyGroupMembers"] }); },
  });

  const rejectMutation = useMutation({
    mutationFn: async (memberId) => base44.entities.StudyGroupMember.update(memberId, { status: "rejected" }),
    onSuccess: () => { onRefresh(); queryClient.invalidateQueries({ queryKey: ["studyGroupMembers"] }); },
  });

  const cancelGroupMutation = useMutation({
    mutationFn: async () => {
      const updated = await base44.entities.StudyGroup.update(group.id, { status: "cancelled" });
      return updated;
    },
    onSuccess: (updated) => {
      setGroup((prev) => ({ ...prev, status: "cancelled" }));
      setConfirmCancel(false);
      onRefresh(updated);
      queryClient.invalidateQueries({ queryKey: ["studyGroups"] });
    },
  });

  const saveDescMutation = useMutation({
    mutationFn: async () => base44.entities.StudyGroup.update(group.id, { description: newDesc }),
    onSuccess: () => {
      setGroup({ ...group, description: newDesc });
      setEditingDesc(false);
      onRefresh({ ...group, description: newDesc });
      queryClient.invalidateQueries({ queryKey: ["studyGroups"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => base44.entities.StudyGroupComment.create({ group_id: group.id, user_email: user.email, user_name: user.full_name, content: comment }),
    onSuccess: () => { setComment(""); queryClient.invalidateQueries({ queryKey: ["groupComments", group.id] }); },
  });

  const fillPct = group.max_size ? Math.min(100, Math.round((confirmedCount / group.max_size) * 100)) : null;

  const shareUrl = window.location.href;
  const shareText = `Join my study group: ${group.title}`;

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: group.title, text: shareText, url: shareUrl }); return; } catch {}
    }
    setShowShareMenu((v) => !v);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => { setShareCopied(false); setShowShareMenu(false); }, 1500);
  };

  const canInvite = group.join_type === "invite_only" && (isHost || (group.invite_permission === "any_member" && myMembership?.status === "confirmed"));

  const getUserAvatar = (email) => allUsers.find((u) => u.email === email);

  const renderJoinButton = () => {
    if (isCancelled) return <span className="text-sm text-destructive font-medium">Cancelled</span>;
    if (isHost) return <span className="text-sm text-muted-foreground font-medium">You're the host</span>;
    if (myMembership) {
      if (myMembership.status === "pending") return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-amber-600 font-medium">Application pending</span>
          <Button variant="outline" size="sm" onClick={() => leaveMutation.mutate()} className="rounded-xl">Cancel</Button>
        </div>
      );
      if (myMembership.status === "confirmed" && !hasStarted) return (
        <Button variant="outline" size="sm" onClick={() => leaveMutation.mutate()} className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10">Leave</Button>
      );
      if (myMembership.status === "confirmed" && hasStarted) return null;
    }
    if (group.join_type === "invite_only") return <span className="text-sm text-muted-foreground">Invite only</span>;
    if (isFull) return <Button disabled className="rounded-xl">Full</Button>;
    const label = group.join_type === "apply" ? "Apply to Join" : group.join_type === "signup" ? "Sign Up" : "Join";
    return <Button onClick={() => joinMutation.mutate()} className="rounded-xl">{label}</Button>;
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {isCancelled ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="h-3 w-3" /> Cancelled
                </span>
              ) : (
                <span className={cn("inline-flex items-center gap-1 text-xs font-medium", jt.color)}>
                  <JtIcon className="h-3.5 w-3.5" />{jt.label}
                </span>
              )}
              {group.subject && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{group.subject}</span>}
            </div>
            <h2 className="text-xl font-bold">{group.title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Hosted by {group.host_name || group.host_email}</p>
          </div>
          <div className="flex gap-1 flex-shrink-0 relative">
            <button onClick={onBookmark} className="p-2 rounded-xl hover:bg-secondary transition-colors">
              <Bookmark className={cn("h-4 w-4", isBookmarked ? "fill-primary text-primary" : "text-muted-foreground")} />
            </button>
            {canInvite && (
              <button onClick={() => setShowInviteModal(true)} className="p-2 rounded-xl hover:bg-secondary transition-colors" title="Invite people">
                <MailIcon className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <button onClick={handleShare} className="p-2 rounded-xl hover:bg-secondary transition-colors" title="Share">
              <Upload className="h-4 w-4 text-muted-foreground" />
            </button>
            {showShareMenu && (
              <div className="absolute top-10 right-8 bg-card border border-border rounded-xl shadow-2xl z-50 w-44 overflow-hidden text-sm">
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`} target="_blank" rel="noopener noreferrer"
                  onClick={() => setShowShareMenu(false)}
                  className="flex items-center gap-2 px-3 py-2.5 hover:bg-secondary text-foreground">WhatsApp</a>
                <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"
                  onClick={() => setShowShareMenu(false)}
                  className="flex items-center gap-2 px-3 py-2.5 hover:bg-secondary text-foreground border-t border-border">Telegram</a>
                <button onClick={copyLink} className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-secondary border-t border-border text-left">
                  {shareCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {shareCopied ? "Copied!" : "Copy link"}
                </button>
              </div>
            )}
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.date_time && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>
                  {format(new Date(group.date_time), "EEEE, MMMM d · HH:mm")}
                  {group.end_time && ` – ${format(new Date(group.end_time), "HH:mm")}`}
                </span>
              </div>
            )}
            {group.location_name && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                {group.location_id ? (
                  <button
                    onClick={() => { onOpenLocation && onOpenLocation(group.location_id); }}
                    className="text-emerald-600 font-medium hover:underline flex items-center gap-1"
                  >
                    {group.location_name}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                ) : (
                  <span>{group.location_name}{group.location_address ? ` · ${group.location_address}` : ""}</span>
                )}
              </div>
            )}
          </div>

          {/* Description with edit for host */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">About</h3>
              {isHost && !hasStarted && !isCancelled && (
                <button onClick={() => setEditingDesc(!editingDesc)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <Pencil className="h-3 w-3" /> Edit
                </button>
              )}
            </div>
            {editingDesc ? (
              <div className="space-y-2">
                <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} className="rounded-xl resize-none text-sm" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => saveDescMutation.mutate()} className="rounded-xl">Save</Button>
                  <Button size="sm" variant="outline" onClick={() => { setEditingDesc(false); setNewDesc(group.description || ""); }} className="rounded-xl">Cancel</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">{group.description || <span className="italic opacity-60">No description yet.</span>}</p>
            )}
          </div>

          {/* Members / capacity */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Members
                <span className="normal-case font-normal">{confirmedCount}{group.max_size ? ` / ${group.max_size}` : ""}</span>
              </h3>
              {renderJoinButton()}
            </div>
            {fillPct !== null && (
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", isFull ? "bg-destructive" : "bg-primary")} style={{ width: `${fillPct}%` }} />
              </div>
            )}
          </div>

          {/* Cancel session (host) */}
          {canCancel && !confirmCancel && (
            <div className="border border-destructive/20 rounded-xl p-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-destructive">Cancel this session</p>
                <p className="text-xs text-muted-foreground">Possible up to 24h before start</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setConfirmCancel(true)} className="rounded-xl text-destructive border-destructive/40 hover:bg-destructive/10 flex-shrink-0">
                Cancel session
              </Button>
            </div>
          )}
          {confirmCancel && (
            <div className="border-2 border-destructive/40 rounded-xl p-4 bg-destructive/5 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <p className="text-sm font-semibold text-destructive">Are you sure you want to cancel this session?</p>
              </div>
              <p className="text-xs text-muted-foreground">This cannot be undone. All {confirmedCount} member{confirmedCount !== 1 ? "s" : ""} will be notified.</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => cancelGroupMutation.mutate()} className="rounded-xl bg-destructive hover:bg-destructive/90 text-white">Yes, cancel it</Button>
                <Button size="sm" variant="outline" onClick={() => setConfirmCancel(false)} className="rounded-xl">Keep it</Button>
              </div>
            </div>
          )}

          {/* Pending applicants (host only) */}
          {isHost && groupMembers.filter((m) => m.status === "pending").length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Pending Applications</h3>
              <div className="space-y-2">
                {groupMembers.filter((m) => m.status === "pending").map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-2.5 bg-secondary rounded-xl">
                    <span className="text-sm font-medium">{m.user_name || m.user_email}</span>
                    <div className="flex gap-1.5">
                      <Button size="sm" className="h-7 rounded-lg" onClick={() => approveMutation.mutate(m.id)}>Accept</Button>
                      <Button size="sm" variant="outline" className="h-7 rounded-lg text-destructive" onClick={() => rejectMutation.mutate(m.id)}>Reject</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat */}
          {group.enable_chat && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" /> Chat
              </h3>
              <div className="space-y-3 max-h-56 overflow-y-auto mb-3 pr-1">
                {comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No messages yet. Say hi!</p>}
                {comments.map((c) => {
                  const commenter = getUserAvatar(c.user_email);
                  const isMe = c.user_email === user?.email;
                  return (
                    <div key={c.id} className={cn("flex gap-2 items-end", isMe && "flex-row-reverse")}>
                      <button className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-primary/30 transition-all"
                        title={c.user_name || c.user_email}>
                        {commenter?.profile_picture
                          ? <img src={commenter.profile_picture} alt="" className="w-full h-full object-cover" />
                          : <User className="h-3.5 w-3.5 text-primary" />}
                      </button>
                      <div className={cn("max-w-[75%] px-3 py-2 rounded-2xl text-sm", isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary rounded-bl-sm")}>
                        {!isMe && <p className="text-xs font-semibold mb-0.5 opacity-70">{c.user_name || c.user_email}</p>}
                        {c.content}
                      </div>
                    </div>
                  );
                })}
              </div>
              {user && (
                <div className="flex gap-2">
                  <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a message…" rows={2} className="resize-none rounded-xl text-sm" />
                  <Button onClick={() => comment.trim() && commentMutation.mutate()} disabled={!comment.trim()} className="self-end rounded-xl">Send</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showInviteModal && (
        <InviteModal
          group={group}
          groupMembers={groupMembers}
          user={user}
          onClose={() => setShowInviteModal(false)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}