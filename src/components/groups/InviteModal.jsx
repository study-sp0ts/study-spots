import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, UserPlus, Check } from "lucide-react";

export default function InviteModal({ group, groupMembers, user, onClose, onRefresh }) {
  const [search, setSearch] = useState("");
  const [invited, setInvited] = useState(new Set());
  const queryClient = useQueryClient();

  const { data: allUsers = [] } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
  });

  const inviteMutation = useMutation({
    mutationFn: async (targetUser) => {
      await base44.entities.StudyGroupMember.create({
        group_id: group.id,
        user_email: targetUser.email,
        user_name: targetUser.full_name,
        role: "invited",
        status: "confirmed",
      });
    },
    onSuccess: (_, targetUser) => {
      setInvited((prev) => new Set([...prev, targetUser.email]));
      queryClient.invalidateQueries({ queryKey: ["studyGroupMembers"] });
      onRefresh();
    },
  });

  const alreadyMemberEmails = new Set(groupMembers.map((m) => m.user_email));

  const filtered = allUsers.filter((u) => {
    if (u.email === user?.email) return false;
    if (alreadyMemberEmails.has(u.email)) return false;
    if (!search) return true;
    return u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold">Invite People</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suche nach Name oder Mail..." className="pl-9 rounded-xl" />
          </div>
          <div className="max-h-72 overflow-y-auto space-y-1">
            {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Kein Profil gefunden.</p>}
            {filtered.map((u) => {
              const isInvited = invited.has(u.email);
              return (
                <div key={u.email} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary transition-colors">
                  <div className="flex items-center gap-2.5">
                    {u.profile_picture
                      ? <img src={u.profile_picture} alt="" className="w-8 h-8 rounded-full object-cover" />
                      : <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{u.full_name?.[0] || "?"}</div>}
                    <div>
                      <p className="text-sm font-medium">{u.full_name || u.email}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <Button size="sm" variant={isInvited ? "secondary" : "default"} disabled={isInvited} onClick={() => inviteMutation.mutate(u)}
                    className="rounded-xl h-7 gap-1">
                    {isInvited ? <><Check className="h-3 w-3" /> Invited</> : <><UserPlus className="h-3 w-3" /> Einladen</>}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}