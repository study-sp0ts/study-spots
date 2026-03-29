import React, { useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  X, Wifi, Plug, Sun, Clock, Star, Coffee,
  BookOpen, Building2, TreePine, Layers, MapPin, Volume2,
  Bookmark, Download, UtensilsCrossed, Users, ExternalLink, ChevronLeft, ChevronRight, Upload, Copy, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import AddressMenu from "./AddressMenu";
import LocationReviews from "./LocationReviews";

const categoryConfig = {
  cafe: { label: "Café", icon: Coffee, color: "bg-amber-100 text-amber-700" },
  library: { label: "Bibliothek", icon: BookOpen, color: "bg-blue-100 text-blue-700" },
  coworking: { label: "Coworking", icon: Building2, color: "bg-purple-100 text-purple-700" },
  university: { label: "Universität", icon: Layers, color: "bg-emerald-100 text-emerald-700" },
  park: { label: "Park", icon: TreePine, color: "bg-green-100 text-green-700" },
  other: { label: "Anderes", icon: MapPin, color: "bg-gray-100 text-gray-700" },
};

const noiseLevelConfig = {
  quiet: { label: "Leise", color: "text-emerald-600" },
  moderate: { label: "Mittel", color: "text-amber-600" },
  loud: { label: "Laut", color: "text-red-500" },
};

export default function LocationDetail({ location, onClose, isFavorite, onToggleFavorite, user, allLocations, onSelectLocation, hideNavigation }) {
  const cardRef = useRef(null);
  const scrollRef = useRef(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const touchStartX = useRef(null);

  // Reset image index and scroll to top when location changes
  useEffect(() => {
    setImgIndex(0);
    setShowShareMenu(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [location?.id]);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setImgIndex((i) => Math.min(images.length - 1, i + 1));
      else setImgIndex((i) => Math.max(0, i - 1));
    }
    touchStartX.current = null;
  };

  if (!location) return null;

  const cat = categoryConfig[location.category] || categoryConfig.other;
  const CatIcon = cat.icon;
  const noise = noiseLevelConfig[location.noise_level];

  // Build image list from image_urls array + fallback to image_url
  const images = (location.image_urls?.length > 0 ? location.image_urls : location.image_url ? [location.image_url] : []);
  const currentImg = images[imgIndex] || null;

  const handleDownload = async () => {
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, { useCORS: true, scale: 2 });
    const link = document.createElement("a");
    link.download = `${location.name.replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const shareUrl = window.location.href;
  const shareText = `Schau dir ${location.name} an — ein toller StudySpot in München`;

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: location.name, text: shareText, url: shareUrl }); return; } catch {}
    }
    setShowShareMenu((v) => !v);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => { setShareCopied(false); setShowShareMenu(false); }, 1500);
  };

  // Navigate between spots
  const currentIndex = allLocations ? allLocations.findIndex((l) => l.id === location.id) : -1;
  const totalLocs = allLocations ? allLocations.length : 0;
  const prevLocation = totalLocs > 1 ? allLocations[(currentIndex - 1 + totalLocs) % totalLocs] : null;
  const nextLocation = totalLocs > 1 ? allLocations[(currentIndex + 1) % totalLocs] : null;

  const handlePrev = () => { if (prevLocation) { onSelectLocation(prevLocation); setImgIndex(0); } };
  const handleNext = () => { if (nextLocation) { onSelectLocation(nextLocation); setImgIndex(0); } };

  return (
    <div className="absolute top-[64px] left-0 bottom-0 w-full md:w-[380px] z-[1002] pointer-events-none">
      <div className="h-full pointer-events-auto p-3">
        <Card ref={cardRef} className="h-full overflow-hidden bg-card border-border/50 shadow-2xl rounded-2xl flex flex-col">
          {/* Image */}
          <div
            className="relative h-52 flex-shrink-0 overflow-hidden bg-secondary"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {currentImg ? (
              <img src={currentImg} alt={location.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <CatIcon className="h-16 w-16 text-primary/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Dot navigation only (no arrows) */}
            {images.length > 1 && (
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, i) => (
                  <button key={i}
                    onClick={(e) => { e.stopPropagation(); setImgIndex(i); }}
                    className={cn("w-2.5 h-2.5 rounded-full transition-all", i === imgIndex ? "bg-white scale-110" : "bg-white/50 hover:bg-white/80")} />
                ))}
              </div>
            )}

            {/* Top actions */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
              <button onClick={onToggleFavorite}
                className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
                title={isFavorite ? "Remove from favorites" : "Save to favorites"}>
                <Bookmark className={cn("h-4 w-4", isFavorite && "fill-white")} />
              </button>
              <div className="flex gap-2 relative">
                <button onClick={handleShare}
                  className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors" title="Share">
                  <Upload className="h-4 w-4" />
                </button>
                {showShareMenu && (
                  <div className="absolute top-10 right-8 bg-card border border-border rounded-xl shadow-2xl z-50 w-44 overflow-hidden text-sm">
                    <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`} target="_blank" rel="noopener noreferrer"
                      onClick={() => setShowShareMenu(false)}
                      className="flex items-center gap-2 px-3 py-2.5 hover:bg-secondary transition-colors text-foreground">
                      WhatsApp
                    </a>
                    <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"
                      onClick={() => setShowShareMenu(false)}
                      className="flex items-center gap-2 px-3 py-2.5 hover:bg-secondary transition-colors text-foreground border-t border-border">
                      Telegram
                    </a>
                    <button onClick={copyLink} className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-secondary transition-colors border-t border-border text-left">
                      {shareCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      {shareCopied ? "Copied!" : "Copy link"}
                    </button>
                  </div>
                )}
                <button onClick={handleDownload}
                  className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors" title="Download as PNG">
                  <Download className="h-4 w-4" />
                </button>
                <button onClick={onClose} className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="absolute bottom-3 left-4 right-4">
              <Badge className={cn("mb-1.5 text-xs", cat.color)}>
                <CatIcon className="h-3 w-3 mr-1" />{cat.label}
              </Badge>
              <h2 className="text-xl font-bold text-white leading-tight">{location.name}</h2>
            </div>
          </div>

          {/* Spot navigation — hidden when opened from session/random */}
          {!hideNavigation && allLocations && allLocations.length > 1 && (
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/40">
              <button onClick={handlePrev} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs text-muted-foreground">{currentIndex + 1} / {totalLocs}</span>
              <button onClick={handleNext} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Content */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            <ReviewSummary locationId={location.id} />

            {location.address && (
              <AddressMenu address={location.address} latitude={location.latitude} longitude={location.longitude} />
            )}

            {(location.hours || location.hours2 || location.hours3 || location.hours4) && (
  <div className="flex items-start gap-2.5 text-sm">
    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
    
    <div className="text-muted-foreground flex flex-col">
      {[location.hours, location.hours2, location.hours3, location.hours4]
        .filter(Boolean) // entfernt null, undefined, ""
        .map((hour, index) => (
          <span key={index}>{hour}</span>
        ))}
    </div>
    
  </div>
)}

            {noise && (
              <div className="flex items-center gap-2.5 text-sm">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <span className={cn("font-medium", noise.color)}>{noise.label}</span>
              </div>
            )}

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                <AmenityBadge active={location.has_wifi} icon={Wifi} label="WLAN" />
                <AmenityBadge active={location.has_outlets} icon={Plug} label="Steckdosen" />
                <AmenityBadge active={!!(location.outside_seats && location.outside_seats !== "none") || location.has_outside_seating} icon={Sun} label="Sitzmöglichkeiten draußen" />
              </div>
            </div>

            {(location.inside_seats || location.outside_seats) && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Sitzmöglichkeiten</h3>
                <div className="flex gap-3 flex-wrap text-sm">
                  {location.inside_seats && <span className="bg-secondary px-3 py-1.5 rounded-lg">🪑 Drinnen: {location.inside_seats}</span>}
                  {location.outside_seats && location.outside_seats !== "none" && <span className="bg-secondary px-3 py-1.5 rounded-lg">☀️ Draußen: {location.outside_seats}</span>}
                </div>
              </div>
            )}

            {location.menu_url && (
              <a href={location.menu_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-accent/10 text-accent rounded-xl text-sm font-medium hover:bg-accent/20 transition-colors w-full">
                <UtensilsCrossed className="h-4 w-4" />
                Speisekarte
                <ExternalLink className="h-3.5 w-3.5 ml-auto" />
              </a>
            )}

            {location.description && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Über</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{location.description}</p>
              </div>
            )}

            <div className="border-t border-border pt-4">
              <LocationReviews locationId={location.id} user={user} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ReviewSummary({ locationId }) {
  const { data: reviews = [] } = useQuery({
    queryKey: ["locationReviews", locationId],
    queryFn: () => base44.entities.LocationReview.filter({ location_id: locationId }),
  });
  if (reviews.length === 0) return null;
  const avg = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.filter(r => r.rating).length;
  const rated = reviews.filter(r => r.rating);
  if (rated.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5">
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
      <span className="font-semibold text-sm">{avg.toFixed(1)}</span>
      <span className="text-muted-foreground text-xs">/ 5.0 ({rated.length} review{rated.length !== 1 ? "s" : ""})</span>
    </div>
  );
}



function AmenityBadge({ active, icon: Icon, label }) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
      active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/40 line-through"
    )}>
      <Icon className="h-3.5 w-3.5" />{label}
    </div>
  );
}