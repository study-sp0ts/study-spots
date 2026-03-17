import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export const categoryColors = {
  cafe: "#d97706",
  library: "#2563eb",
  coworking: "#9333ea",
  university: "#059669",
  park: "#16a34a",
  other: "#6b7280",
};

// Small SVG icons per category (white, for inside pin)
const categoryIcons = {
  cafe: `<path d="M18 8h-1V6h-2v2H9C7.3 8 6 9.3 6 11v4c0 1.7 1.3 3 3 3h.4c.7 1.8 2.4 3 4.6 3s3.9-1.2 4.6-3H19c1.7 0 3-1.3 3-3v-1h1c.6 0 1-.4 1-1v-2c0-.6-.4-1-1-1h-1V9c0-.6-.4-1-1-1zm-4 11c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2zm5-4H9c-.6 0-1-.4-1-1v-4h12v4c0 .6-.4 1-1 1zm2-2v-1h1v1h-1z" fill="white"/>`,
  library: `<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" fill="white"/>`,
  coworking: `<path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" fill="white"/>`,
  university: `<path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="white"/>`,
  park: `<path d="M17 12h-5V7h-2v5H5l7 7 7-7zm-7-8h2V2h-2v2zm6.39 2.61l1.42-1.42-1.42-1.41-1.41 1.41 1.41 1.42zM19 11h2V9h-2v2zm-7 10h2v-2h-2v2zm-6.61-2.61l1.41 1.41 1.42-1.42-1.42-1.41-1.41 1.42zM3 11h2V9H3v2z" fill="white"/>`,
  other: `<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>`,
};

function dropletSVG(color, category, size = 18) {
  const icon = categoryIcons[category] || categoryIcons.other;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * 1.2)}" viewBox="0 0 36 42">
      <path d="M18 40 C18 40, 4 26, 4 17 C4 8.7 10.3 2 18 2 C25.7 2 32 8.7 32 17 C32 26 18 40 18 40Z"
        fill="${color}" stroke="white" stroke-width="2.5" />
      <g transform="translate(10, 8) scale(0.6)">${icon}</g>
    </svg>
  `;
}

function createIcon(category, active = false) {
  const color = categoryColors[category] || categoryColors.other;
  const size = active ? 24 : 18;
  return L.divIcon({
    className: "",
    html: `<div style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); transform: ${active ? "scale(1.15)" : "scale(1)"}; transition: transform 0.15s;">${dropletSVG(color, category, size)}</div>`,
    iconSize: [size, Math.round(size * 1.2)],
    iconAnchor: [size / 2, Math.round(size * 1.2)],
  });
}

function FitBounds({ locations }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((l) => [l.latitude, l.longitude]));
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
    }
  }, []);
  return null;
}

function CenterMap({ location }) {
  const map = useMap();
  useEffect(() => {
    if (!location?.latitude || !location?.longitude) return;
    const zoom = map.getZoom();
    const isMobile = window.innerWidth < 768;
    const panelOffset = isMobile ? 0 : 190; // half of 380px panel
    const p = map.project(L.latLng(location.latitude, location.longitude), zoom);
    const adjusted = L.point(p.x - panelOffset, p.y);
    map.panTo(map.unproject(adjusted, zoom), { animate: true });
  }, [location?.id]);
  return null;
}

export default function MapView({ locations, allLocations, selectedLocation, onSelectLocation }) {
  const munichCenter = [48.1351, 11.582];

  return (
    <MapContainer
      center={munichCenter}
      zoom={13}
      className="w-full h-full"
      zoomControl={false}
      style={{ background: "#f5f3ef" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {allLocations.length > 0 && <FitBounds locations={allLocations} />}
      <CenterMap location={selectedLocation} />
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.latitude, loc.longitude]}
          icon={createIcon(loc.category, selectedLocation?.id === loc.id)}
          eventHandlers={{ click: () => onSelectLocation(loc) }}
        />
      ))}
    </MapContainer>
  );
}