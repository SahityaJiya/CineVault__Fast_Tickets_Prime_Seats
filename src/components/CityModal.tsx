"use client";

import React, { useState, useMemo } from "react";

export interface City {
  id: string;
  name: string;
  slug: string;
}

interface CityModalProps {
  isOpen: boolean;
  onClose: () => void;
  cities: City[];
  selectedCity: City | null;
  onSelectCity: (city: City) => void;
}

export default function CityModal({
  isOpen,
  onClose,
  cities = [],
  selectedCity,
  onSelectCity,
}: CityModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Filter cities by search term
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return cities;
    return cities.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [cities, searchQuery]);

  // Helper: Find closest match in seeded cities list
  const findMatchingCity = (query: string): City | null => {
    if (!query) return null;
    const cleanQuery = query.toLowerCase().trim();
    return (
      cities.find(
        (c) =>
          cleanQuery.includes(c.name.toLowerCase()) ||
          c.name.toLowerCase().includes(cleanQuery) ||
          cleanQuery.includes(c.slug.toLowerCase())
      ) || null
    );
  };

  // Fallback: IP-based lookup (works reliably across desktop & VPNs)
  const detectViaIpFallback = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
      const data = await res.json();
      const detectedCity = data.city || data.region || "";

      const match = findMatchingCity(detectedCity);
      if (match) {
        onSelectCity(match);
        setStatusMessage(`Detected ${detectedCity}. Selected ${match.name}.`);
        setTimeout(() => onClose(), 800);
      } else {
        const fallback = cities.find((c) => c.slug === "chandigarh") || cities[0];
        if (fallback) {
          onSelectCity(fallback);
          setStatusMessage(`Location near ${detectedCity || "your region"}. Set to ${fallback.name}.`);
        }
      }
    } catch {
      const fallback = cities.find((c) => c.slug === "chandigarh") || cities[0];
      if (fallback) {
        onSelectCity(fallback);
        setStatusMessage(`Set to default city (${fallback.name}).`);
      }
    }
  };

  // Main Geolocation handler
  const handleDetectLocation = () => {
    setIsDetecting(true);
    setStatusMessage(null);

    if (!navigator.geolocation) {
      detectViaIpFallback().finally(() => setIsDetecting(false));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode via OpenStreetMap
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                "Accept-Language": "en",
              },
            }
          );
          const data = await res.json();
          
          const detectedCityName =
            data.address?.city ||
            data.address?.town ||
            data.address?.state_district ||
            data.address?.state ||
            "";

          const match = findMatchingCity(detectedCityName);

          if (match) {
            onSelectCity(match);
            setStatusMessage(`Location found: ${match.name}`);
            setTimeout(() => onClose(), 600);
          } else {
            // If GPS city isn't in seeded list, fallback to IP detection
            await detectViaIpFallback();
          }
        } catch {
          await detectViaIpFallback();
        } finally {
          setIsDetecting(false);
        }
      },
      async (error) => {
        console.warn("Browser GPS unavailable or timed out, trying IP fallback:", error.message);
        await detectViaIpFallback();
        setIsDetecting(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 4000,
        maximumAge: 60000,
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-lg">📍</span>
            <h3 className="text-base font-semibold text-white">Select Your City</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition"
          >
            ✕
          </button>
        </div>

        {/* Search Input */}
        <div className="mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for your city (e.g. Chandigarh, Delhi, Mumbai)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/80 text-white placeholder-zinc-500 text-sm rounded-xl px-4 py-3 pl-10 border border-zinc-800 focus:outline-none focus:border-red-500/60 transition"
            />
            <span className="absolute left-3.5 top-3.5 text-zinc-500 text-sm">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Detect Location Button */}
        <button
          onClick={handleDetectLocation}
          disabled={isDetecting}
          className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-500/20 transition-all font-medium text-sm disabled:opacity-50 cursor-pointer"
        >
          <span>🎯</span>
          <span>{isDetecting ? "Detecting location..." : "Detect my current location"}</span>
        </button>

        {/* Status Toast / Helper Message */}
        {statusMessage && (
          <p className="text-xs text-amber-400/90 text-center mt-2 bg-amber-950/30 border border-amber-900/40 rounded-lg py-1.5 px-3">
            {statusMessage}
          </p>
        )}

        {/* Cities Grid */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
              {searchQuery ? "Search Results" : "Available Cities"}
            </h4>
            <span className="text-[11px] text-zinc-500">
              {filteredCities.length} {filteredCities.length === 1 ? "city" : "cities"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => {
                const isSelected = selectedCity?.id === city.id;
                return (
                  <button
                    key={city.id}
                    onClick={() => {
                      onSelectCity(city);
                      onClose();
                    }}
                    className={`px-3.5 py-2.5 text-sm rounded-xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-red-600 text-white border-red-500 font-medium shadow-md shadow-red-600/20"
                        : "bg-zinc-900/60 text-zinc-300 border-zinc-800/80 hover:bg-zinc-800 hover:text-white hover:border-zinc-700"
                    }`}
                  >
                    <span className="truncate">{city.name}</span>
                    {isSelected && <span className="text-xs ml-1">✓</span>}
                  </button>
                );
              })
            ) : (
              <div className="col-span-full py-6 text-center text-sm text-zinc-500">
                No cities found matching &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}