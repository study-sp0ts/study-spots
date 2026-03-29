import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Search, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const joinTypes = [
  { value: "open", label: "Open", desc: "Anyone can join instantly" },
  { value: "signup", label: "Sign up", desc: "Register a spot" },
  { value: "apply", label: "Apply", desc: "You accept/reject" },
  { value: "invite_only", label: "Invite only", desc: "Share link to invite" },
];

const categories = ["cafe", "library", "coworking", "university", "park", "online", "other"];

export default function CreateGroupModal({ user, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "", subject: "", description: "", date_time: "", end_time: "",
    location_id: "", location_name: "", location_address: "",
    category: "", join_type: "open", invite_permission: "host_only", max_size: "", enable_chat: false,
  });
  const [locationSearch, setLocationSearch] = useState("");
  const [showLocationResults, setShowLocationResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  const now = new Date();
  const minStart = new Date(now.getTime() + 60 * 60 * 1000); // 1h from now
  const maxStart = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 months
  const toLocalInput = (d) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const { data: locations = [] } = useQuery({
    queryKey: ["studyLocations"],
    queryFn: () => base44.entities.StudyLocation.list(),
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const filteredLocations = locationSearch
    ? locations.filter((l) => l.name?.toLowerCase().includes(locationSearch.toLowerCase()) || l.address?.toLowerCase().includes(locationSearch.toLowerCase()))
    : locations.slice(0, 8);

  const selectLocation = (loc) => {
    set("location_id", loc.id);
    set("location_name", loc.name);
    set("location_address", loc.address || "");
    set("category", loc.category || "");
    setLocationSearch(loc.name);
    setShowLocationResults(false);
  };

  const clearLocation = () => {
    set("location_id", "");
    set("location_name", "");
    set("location_address", "");
    setLocationSearch("");
  };

  const hasMaxSize = form.max_size && parseInt(form.max_size) >= 3;
  // If max_size is set, "open" is not available (must sign up or apply to reserve)
  const availableJoinTypes = hasMaxSize ? joinTypes.filter((jt) => jt.value !== "open") : joinTypes;

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = true;
    if (!form.date_time) {
      errs.date_time = true;
    } else {
      const start = new Date(form.date_time);
      if (start < minStart) errs.date_time = "Der Beginn muss mindestens eine Stunde in der Zukunft liegen.";
      if (start > maxStart) errs.date_time = "Treffen können bis zu 3 Monate im Vorraus geplant werden.";
      if (form.end_time) {
        const end = new Date(form.end_time);
        const diffMin = (end - start) / 60000;
        if (diffMin < 10) errs.end_time = "Das Treffen muss mindestens 10 Minuten lang sein.";
        if (diffMin > 24 * 60) errs.end_time = "Treffen können nicht länger als einen Tag dauern.";
      }
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // scroll to first error
      const first = formRef.current?.querySelector("[data-error='true']");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErrors({});
    setLoading(true);
    const maxSizeVal = form.max_size ? Math.min(100, Math.max(3, parseInt(form.max_size))) : undefined;
    const group = await base44.entities.StudyGroup.create({
      ...form,
      location_name: form.location_name || locationSearch,
      max_size: maxSizeVal,
      join_type: hasMaxSize && form.join_type === "open" ? "signup" : form.join_type,
      host_email: user.email,
      host_name: user.full_name,
      status: "upcoming",
    });
    await base44.entities.StudyGroupMember.create({ group_id: group.id, user_email: user.email, user_name: user.full_name, role: "host", status: "confirmed" });
    setLoading(false);
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-bold">StuddySession erstellen</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <form ref={formRef} onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5" data-error={!!errors.title}>
            <Label className={errors.title ? "text-destructive" : ""}>Titel *{errors.title && " — required"}</Label>
            <Input value={form.title} onChange={(e) => { set("title", e.target.value); setErrors((p) => ({ ...p, title: false })); }}
              placeholder="z.B. Dialog auf Englisch üben"
              className={cn("rounded-xl", errors.title && "border-destructive focus-visible:ring-destructive")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="z.B. Mathe, Englisch B1/2, Leseclub, alles" className="rounded-xl" />
            </div>
            <div className="space-y-1.5" data-error={!!errors.date_time}>
              <Label className={errors.date_time ? "text-destructive" : ""}>Startdatum & -uhrzeit *{typeof errors.date_time === "string" && ` — ${errors.date_time}`}</Label>
              <Input type="datetime-local" step="300"
                min={toLocalInput(minStart)} max={toLocalInput(maxStart)}
                value={form.date_time}
                onChange={(e) => { set("date_time", e.target.value); setErrors((p) => ({ ...p, date_time: false })); }}
                className={cn("rounded-xl", errors.date_time && "border-destructive focus-visible:ring-destructive")} />
            </div>
          </div>
          <div className="space-y-1.5" data-error={!!errors.end_time}>
            <Label className={errors.end_time ? "text-destructive" : ""}>
              Ende <span className="font-normal">(optional){typeof errors.end_time === "string" && ` — ${errors.end_time}`}</span>
            </Label>
            <Input type="datetime-local" step="300" value={form.end_time}
              min={form.date_time}
              onChange={(e) => { set("end_time", e.target.value); setErrors((p) => ({ ...p, end_time: false })); }}
              className={cn("rounded-xl", errors.end_time && "border-destructive focus-visible:ring-destructive")} />
          </div>

          {/* Searchable location picker */}
          <div className="space-y-1.5">
            <Label>Location</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={locationSearch}
                onChange={(e) => { setLocationSearch(e.target.value); setShowLocationResults(true); if (!e.target.value) clearLocation(); }}
                onFocus={() => setShowLocationResults(true)}
                placeholder="Such nach einem StudySpot oder lege einen eigenen Treffpunkt fest..."
                className="pl-9 rounded-xl"
              />
              {form.location_id && (
                <button type="button" onClick={clearLocation} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
              {showLocationResults && locationSearch && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto">
                  {filteredLocations.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">Kein StudySpot gefunden - benutzerdefinierte Eingabe wird gespeichert</div>
                  ) : filteredLocations.map((loc) => (
                    <button key={loc.id} type="button" onMouseDown={() => selectLocation(loc)}
                      className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-secondary text-left transition-colors">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium">{loc.name}</div>
                        {loc.address && <div className="text-xs text-muted-foreground">{loc.address}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {form.location_id && <p className="text-xs text-emerald-600 font-medium">✓ Linked to database location</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Ortkategorie</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button key={c} type="button" onClick={() => set("category", c)}
                  className={cn("px-3 py-1.5 rounded-lg text-sm border transition-all capitalize", form.category === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary")}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Beschreibung</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Werdet ihr still oder durch Gespräche lernen? Irgendwelche zusätzlichen Infos für Teilnehmer?" className="rounded-xl resize-none h-20" />
          </div>

          <div className="space-y-1.5">
            <Label>Maximale Gruppengröße <span className="text-muted-foreground font-normal">(3–100, optional)</span></Label>
            <Input type="number" min="3" max="100" value={form.max_size}
              onChange={(e) => { set("max_size", e.target.value); if (e.target.value && parseInt(e.target.value) >= 3 && form.join_type === "open") set("join_type", "signup"); }}
              placeholder="Für unbegrenzte Gruppengröße leer lassen" className="rounded-xl" />
            {hasMaxSize && <p className="text-xs text-amber-600">Bei begrenzter Gruppengröße ist die Option "offen" nicht verfügbar, da die Plätze reserviert werden müssen.</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Beitrittsoptionen</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableJoinTypes.map((jt) => {
                const disabled = hasMaxSize && jt.value === "open";
                return (
                  <button key={jt.value} type="button" onClick={() => !disabled && set("join_type", jt.value)}
                    className={cn("flex flex-col items-start p-3 rounded-xl border text-sm transition-all",
                      disabled ? "opacity-40 cursor-not-allowed border-border" :
                      form.join_type === jt.value ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40 hover:bg-secondary")}>
                    <span className="font-medium">{jt.label}</span>
                    <span className="text-xs opacity-70">{jt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {form.join_type === "invite_only" && (
            <div className="space-y-1.5">
              <Label>Wer darf einladen?</Label>
              <div className="flex gap-2">
                {[["host_only", "Nur der Host"], ["any_member", "Alle Teilnehmer"]].map(([v, l]) => (
                  <button key={v} type="button" onClick={() => set("invite_permission", v)}
                    className={cn("flex-1 py-2 px-3 rounded-xl border text-sm transition-all", form.invite_permission === v ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-secondary")}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Chat erlauben</Label>
            <button type="button" onClick={() => set("enable_chat", !form.enable_chat)}
              className={cn("w-full px-3 py-2 rounded-xl border text-sm font-medium transition-all", form.enable_chat ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary")}>
              {form.enable_chat ? "Chat aktiviert ✓" : "Chat deaktiviert"}
            </button>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl">
            {loading ? "Wird erstellt..." : "StudySession erstellen"}
          </Button>
        </form>
      </div>
    </div>
  );
}