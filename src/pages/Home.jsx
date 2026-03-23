import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { locations as staticLocations } from "@/locations";
import MapView from "@/components/map/MapView";
import SearchFilterBar from "@/components/map/SearchFilterBar";
import LocationDetail from "@/components/map/LocationDetail";
import Navbar from "@/components/nav/Navbar";
import SparkleButton from "@/components/map/SparkleButton";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [hideNavigation, setHideNavigation] = useState(false);
  const [user, setUser] = useState(null);

  // useEffect(() => {
  //   base44.auth.me().then(setUser).catch(() => {});
  // }, []);

  const queryClient = useQueryClient();

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["studyLocations"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/StudyLocation");
        return res.json();
      } catch {
        // Fallback to static data if server not available
        return staticLocations;
      }
    },
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => JSON.parse(localStorage.getItem('favorites') || '[]'),
  });

  const favoriteMutation = useMutation({
    mutationFn: async (location) => {
      const current = JSON.parse(localStorage.getItem('favorites') || '[]');
      const existingIndex = current.findIndex((f) => f.location_id === location.id);
      if (existingIndex >= 0) {
        current.splice(existingIndex, 1);
      } else {
        current.push({ location_id: location.id });
      }
      localStorage.setItem('favorites', JSON.stringify(current));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const toggleCategory = (c) =>
    setSelectedCategories((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);

  const toggleAmenity = (a) =>
    setSelectedAmenities((p) => p.includes(a) ? p.filter((x) => x !== a) : [...p, a]);

  const favoriteIds = new Set(favorites.map((f) => f.location_id));

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!loc.name?.toLowerCase().includes(q) &&
            !loc.address?.toLowerCase().includes(q) &&
            !loc.description?.toLowerCase().includes(q)) return false;
      }
      if (selectedCategories.length > 0 && !selectedCategories.includes(loc.category)) return false;
      for (const am of selectedAmenities) { if (!loc[am]) return false; }
      if (showFavorites && !favoriteIds.has(loc.id)) return false;
      return true;
    });
  }, [locations, searchQuery, selectedCategories, selectedAmenities, showFavorites, favoriteIds]);

  const handleSurpriseMe = () => {
    if (filteredLocations.length === 0) return;
    const random = filteredLocations[Math.floor(Math.random() * filteredLocations.length)];
    setHideNavigation(true);
    setSelectedLocation(random);
  };

  const handleSpotCountClick = () => {
    if (filteredLocations.length === 0) return;
    setHideNavigation(false);
    setSelectedLocation(filteredLocations[0]);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">StudySpots werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <Navbar user={user} />

      <MapView
        locations={filteredLocations}
        allLocations={locations}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
      />

      <SearchFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
        selectedAmenities={selectedAmenities}
        toggleAmenity={toggleAmenity}
        showFavorites={showFavorites}
        setShowFavorites={setShowFavorites}
      />

      {selectedLocation && (
        <LocationDetail
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          isFavorite={favoriteIds.has(selectedLocation.id)}
          onToggleFavorite={() => favoriteMutation.mutate(selectedLocation)}
          user={user}
          allLocations={filteredLocations}
          onSelectLocation={(loc) => { setHideNavigation(false); setSelectedLocation(loc); }}
          hideNavigation={hideNavigation}
        />
      )}

      {/* Sparkle button - top right */}
      <div className="absolute top-[76px] right-4 z-[1000]">
        <SparkleButton onClick={handleSurpriseMe} />
      </div>

      {/* Result count — clickable to open first spot */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[998]">
        <button onClick={handleSpotCountClick}
          className="bg-card/90 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg border border-border/50 text-xs font-medium text-muted-foreground hover:bg-card hover:text-foreground transition-all">
          {filteredLocations.length} StudySpot{filteredLocations.length !== 1 ? "s" : ""} gefunden
        </button>
      </div>
    </div>
  );
}