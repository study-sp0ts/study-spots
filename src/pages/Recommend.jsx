import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MapPin, Check, Wifi, Plug, Sun, ImagePlus, X, Wine } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { value: "cafe", label: "Café", emoji: "☕" },
  { value: "library", label: "Bibliothek", emoji: "📚" },
  { value: "coworking", label: "Coworking", emoji: "🏢" },
  { value: "university", label: "Universität", emoji: "🎓" },
  { value: "park", label: "Park", emoji: "🌿" },
  { value: "restaurantorbar", label: "Restaurant/Bar", emoji: "🍽️" },
];

export default function Recommend() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);
  const [form, setForm] = useState({
    name: "", address: "", category: "", description: "",
    has_wifi: false, has_outlets: false, has_outside_seating: false, has_alc: false, hours: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = true;
    if (!form.category) errs.category = true;
    if (!form.address.trim()) errs.address = true;
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const first = formRef.current?.querySelector("[data-error='true']");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErrors({});
    setLoading(true);
    let image_url = "";
    if (photoFile) {
      setUploadingPhoto(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file: photoFile });
      image_url = file_url;
      setUploadingPhoto(false);
    }
    const me = await base44.auth.me().catch(() => null);
    await base44.entities.LocationRecommendation.create({
      ...form,
      ...(image_url && { image_url }),
      submitted_by: me?.email || "anonymous",
      status: "pending",
    });
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Danke für deine Empfehlung!</h2>
          <p className="text-muted-foreground mb-6">Wir werden den Ort in Kürze überprüfen und wenn er passt, zur Karte hinzufügen.</p>
          <Button onClick={() => navigate("/Home")} className="rounded-xl">Zurück</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Schlage einen Spot vor</h1>
            <p className="text-sm text-muted-foreground">Hilf Lernenden noch mehr StudySpots zu entdecken</p>
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5" data-error={!!errors.name}>
            <Label className={errors.name ? "text-destructive" : ""}>Name *{errors.name && " — required"}</Label>
            <Input placeholder="e.g. Café Jasmin" value={form.name}
              onChange={(e) => { set("name", e.target.value); setErrors((p) => ({ ...p, name: false })); }}
              className={cn("rounded-xl", errors.name && "border-destructive")} />
          </div>

          <div className="space-y-1.5" data-error={!!errors.address}>
            <Label className={errors.address ? "text-destructive" : ""}>Addresse *{errors.address && " — required"}</Label>
            <Input placeholder="Street, City" value={form.address}
              onChange={(e) => { set("address", e.target.value); setErrors((p) => ({ ...p, address: false })); }}
              className={cn("rounded-xl", errors.address && "border-destructive")} />
          </div>

          <div className="space-y-1.5" data-error={!!errors.category}>
            <Label className={errors.category ? "text-destructive" : ""}>Kategorie *{errors.category && " — required"}</Label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => { set("category", cat.value); setErrors((p) => ({ ...p, category: false })); }}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-xl border text-sm font-medium transition-all",
                    form.category === cat.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/40 hover:bg-secondary"
                  )}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Beschreibung</Label>
            <Textarea placeholder="Warum ist es ein toller StudySpot?" value={form.description} onChange={(e) => set("description", e.target.value)} className="rounded-xl resize-none h-24" />
          </div>

          <div className="space-y-1.5">
            <Label>Öffnungszeiten</Label>
            <Input placeholder="z.B. Mo-Fr 10-18, Sa 12-18" value={form.hours} onChange={(e) => set("hours", e.target.value)} className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>Ausstattung</Label>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "has_wifi", label: "WLAN", icon: Wifi },
                { key: "has_outlets", label: "Steckdosen", icon: Plug },
                { key: "has_outside_seating", label: "Sitzmöglichkeit draußen", icon: Sun },
                { key: "has_alc", label: "Alkohol", icon: Wine },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set(key, !form[key])}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all",
                    form[key]
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border hover:bg-secondary text-muted-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />{label}
                </button>
              ))}
            </div>
          </div>

          {/* Photo upload */}
          <div className="space-y-1.5">
            <Label>Foto(s)</Label>
            <div className="rounded-xl border border-border overflow-hidden">
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt="Preview" className="w-full h-40 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 p-6 cursor-pointer hover:bg-secondary transition-colors">
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Fotos hinzufügen</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">⚠️ Lade nur Bilder hoch, die du sebst gemacht hast oder lizenzfrei sind. Lade keine urheberrechtlich geschützten Dateien hoch.</p>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl">
            {uploadingPhoto ? "Uploading photo…" : loading ? "Submitting…" : "Submit Recommendation"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">Vorschläge werden übberprüft bevor sie für alle sichtbar werden.</p>
        </form>
      </div>
    </div>
  );
}