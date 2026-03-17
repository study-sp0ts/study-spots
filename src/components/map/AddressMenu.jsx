import React, { useState, useRef, useEffect } from "react";
import { MapPin, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AddressMenu({ address, latitude, longitude }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  const appleMapsUrl = `https://maps.apple.com/?daddr=${latitude},${longitude}`;

  const copy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-start gap-2.5 text-sm text-left group"
      >
        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <span className="text-muted-foreground group-hover:text-primary group-hover:underline transition-colors">
          {address}
        </span>
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 w-56 bg-card border border-border rounded-xl shadow-xl z-10 overflow-hidden">
          <button
            onClick={() => { window.open(googleUrl, "_blank"); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary transition-colors"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
            Open in Google Maps
          </button>
          <button
            onClick={() => { window.open(appleMapsUrl, "_blank"); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary transition-colors border-t border-border"
          >
            <span className="text-base leading-none">🍎</span>
            Open in Apple Maps
          </button>
          <button
            onClick={copy}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary transition-colors border-t border-border"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
            {copied ? "Copied!" : "Copy Address"}
          </button>
        </div>
      )}
    </div>
  );
}