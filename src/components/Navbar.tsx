'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { 
  Film, 
  MapPin, 
  Search, 
  Ticket, 
  Mic, 
  Navigation, 
  ChevronDown,
  X,
  Check
} from 'lucide-react';
import { setSelectedCityAction } from '@/actions/city';

interface City {
  id: string;
  name: string;
  slug: string;
  state?: string;
  lat?: number;
  lng?: number;
}

// Known coordinates for top Indian cities to calculate nearest location
const INDIAN_CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  bhopal: { lat: 23.2599, lng: 77.4126 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  'delhi-ncr': { lat: 28.6139, lng: 77.2090 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  pune: { lat: 18.5204, lng: 73.8567 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  indore: { lat: 22.7196, lng: 75.8577 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
};

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface NavbarProps {
  cities: City[];
  currentCitySlug: string;
}

export default function Navbar({ cities = [], currentCitySlug }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationToast, setLocationToast] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  const activeCity = cities.find((c) => c.slug === currentCitySlug) || cities[0] || { name: 'Bhopal', slug: 'bhopal' };

  // Filter cities in modal by search text
  const filteredCities = useMemo(() => {
    if (!citySearchQuery.trim()) return cities;
    return cities.filter((c) =>
      c.name.toLowerCase().includes(citySearchQuery.toLowerCase().trim())
    );
  }, [cities, citySearchQuery]);

  // Sync search input when URL query param changes
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  // Voice Search Web Speech API
  const handleVoiceSearch = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setLocationToast({ message: 'Voice search is supported on Chrome & Edge.', type: 'warning' });
      setTimeout(() => setLocationToast(null), 3500);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
      triggerSearch(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const triggerSearch = (queryText: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (queryText.trim()) {
      params.set('q', queryText.trim());
    } else {
      params.delete('q');
    }

    if (pathname === '/') {
      router.push(`/?${params.toString()}`);
    } else {
      router.push(`/?q=${encodeURIComponent(queryText.trim())}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(searchQuery);
  };

  const handleCitySelect = async (slug: string) => {
    setIsCityModalOpen(false);
    setCitySearchQuery('');
    startTransition(async () => {
      await setSelectedCityAction(slug);
      router.refresh();
    });
  };

  // Safe Live Location Auto-Detection
  const handleDetectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationToast({ message: 'Geolocation is not supported by your browser.', type: 'warning' });
      setTimeout(() => setLocationToast(null), 3500);
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let nearestCity = cities[0]?.slug || 'bhopal';
        let minDistance = Infinity;

        // Compare against known coordinates
        for (const city of cities) {
          const coords = INDIAN_CITY_COORDINATES[city.slug.toLowerCase()];
          if (coords) {
            const dist = getDistanceKm(latitude, longitude, coords.lat, coords.lng);
            if (dist < minDistance) {
              minDistance = dist;
              nearestCity = city.slug;
            }
          }
        }

        setIsLocating(false);
        setIsCityModalOpen(false);
        setCitySearchQuery('');

        const matched = cities.find((c) => c.slug === nearestCity);
        setLocationToast({
          message: `Detected nearest city: ${matched?.name || nearestCity} (~${Math.round(minDistance)} km)`,
          type: 'success',
        });

        startTransition(async () => {
          await setSelectedCityAction(nearestCity);
          router.refresh();
        });

        setTimeout(() => setLocationToast(null), 4000);
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error.message);
        
        // Fallback safely to current or default city without crashing or showing disruptive alert popups
        const fallback = activeCity?.slug || 'bengaluru';
        setLocationToast({
          message: 'Location acquisition timed out. Kept active city.',
          type: 'warning',
        });
        setTimeout(() => setLocationToast(null), 4000);
      },
      {
        enableHighAccuracy: false, // Prevents hardware GPS timeout on Linux and desktop browsers
        timeout: 6000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <>
      {/* Non-blocking Notification Toast */}
      {locationToast && (
        <div
          className={`text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200 ${
            locationToast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-amber-600 text-white'
          }`}
        >
          <Navigation className="h-3.5 w-3.5 fill-current" />
          <span>{locationToast.message}</span>
        </div>
      )}

      <nav className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="p-2 bg-rose-600 group-hover:bg-rose-500 rounded-xl transition shadow-lg shadow-rose-600/20">
              <Film className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                CINE<span className="text-rose-500">VAULT</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-zinc-500 block -mt-1 font-bold">
                Cinemas & Passes
              </span>
            </div>
          </Link>

          {/* Search Bar with Live Voice Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-lg relative flex items-center"
          >
            <div className="relative w-full">
              <Search className="h-4 w-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (pathname === '/') triggerSearch(e.target.value);
                }}
                placeholder="Search movies, languages (Hindi, English), genres..."
                className="w-full pl-10 pr-20 py-2 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    triggerSearch('');
                  }}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Voice Search Button */}
              <button
                type="button"
                onClick={handleVoiceSearch}
                title="Voice Search"
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-800'
                }`}
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Right Side: City Selector & My Tickets */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* City Selector Button */}
            <button
              type="button"
              onClick={() => setIsCityModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200 hover:border-zinc-700 transition"
            >
              <MapPin className="h-3.5 w-3.5 text-rose-500" />
              <span className="max-w-[100px] truncate">{activeCity.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
            </button>

            {/* My Tickets */}
            <Link
              href="/my-bookings"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shadow-rose-600/20"
            >
              <Ticket className="h-3.5 w-3.5" />
              <span className="hidden md:inline">My Tickets</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Modern City Selection Modal */}
      {isCityModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsCityModalOpen(false)}
        >
          <div 
            className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-rose-500" /> Select Your City
                </h3>
                <p className="text-xs text-zinc-400">Choose your region to see cinema showtimes</p>
              </div>
              <button
                onClick={() => setIsCityModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* City Search Field */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                placeholder="Search city (e.g. Bengaluru, Mumbai)..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition"
              />
              {citySearchQuery && (
                <button
                  onClick={() => setCitySearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Auto Detect Location Button */}
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600/10 hover:bg-rose-600 hover:text-white border border-rose-500/30 text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Navigation className={`h-3.5 w-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting nearest city...' : 'Detect My Live Location'}</span>
            </button>

            {/* Cities Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  {citySearchQuery ? 'Matching Cities' : 'Available Cities'}
                </span>
                <span className="text-[10px] text-zinc-500">{filteredCities.length} hubs</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => {
                    const isSelected = activeCity.slug === city.slug;
                    return (
                      <button
                        key={city.slug}
                        onClick={() => handleCitySelect(city.slug)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition flex items-center justify-between ${
                          isSelected
                            ? 'border-rose-500 bg-rose-600 text-white shadow-md shadow-rose-600/20'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{city.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-full py-6 text-center text-xs text-zinc-500">
                    No city found matching &quot;{citySearchQuery}&quot;
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}