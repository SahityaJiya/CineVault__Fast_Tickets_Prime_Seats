'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Film, MapPin, Search, ChevronDown, Ticket } from 'lucide-react';
import { CityOption } from '@/types';
import CityModal from './CityModal';

interface NavbarProps {
  cities: CityOption[];
  currentCitySlug: string;
}

export default function Navbar({ cities, currentCitySlug }: NavbarProps) {
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(currentCitySlug || 'mumbai');

  const activeCity = cities.find((c) => c.slug === selectedCity) || cities[0];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-lg shadow-rose-600/20">
              <Film className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white tracking-tight leading-none">
                CINE<span className="text-rose-500">VAULT</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-medium tracking-wider">
                CINEMAS & TICKETING
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md relative items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search for Movies, Theaters, or Genres..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* City Selector Button */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-zinc-200 text-sm font-medium transition"
            >
              <MapPin className="h-4 w-4 text-rose-500" />
              <span>{activeCity?.name ?? 'Select City'}</span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            </button>

            {/* Bookings / Sign In */}
            <Link
              href="/my-bookings"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition shadow-md shadow-rose-600/20"
            >
              <Ticket className="h-4 w-4" />
              <span>My Tickets</span>
            </Link>
          </div>
        </div>
      </header>

      <CityModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        cities={cities}
        selectedCity={selectedCity}
        onSelectCity={(slug) => {
          setSelectedCity(slug);
          window.location.href = `/?city=${slug}`;
        }}
      />
    </>
  );
}