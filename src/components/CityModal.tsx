'use client';

import { useState } from 'react';
import { CityOption } from '@/types';
import { MapPin, X, Building2 } from 'lucide-react';

interface CityModalProps {
  isOpen: boolean;
  onClose: () => void;
  cities: CityOption[];
  selectedCity: string;
  onSelectCity: (slug: string) => void;
}

export default function CityModal({
  isOpen,
  onClose,
  cities,
  selectedCity,
  onSelectCity,
}: CityModalProps) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-rose-500" />
            <h2 className="text-xl font-semibold text-white">Select Your City</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-4">
          <input
            type="text"
            placeholder="Search city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
          {filteredCities.map((city) => (
            <button
              key={city.id}
              onClick={() => {
                onSelectCity(city.slug);
                onClose();
              }}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition ${
                selectedCity === city.slug
                  ? 'border-rose-500 bg-rose-500/10 text-white'
                  : 'border-zinc-800 bg-zinc-800/40 hover:border-zinc-700 text-zinc-300 hover:text-white'
              }`}
            >
              <span className="font-medium text-sm">{city.name}</span>
              <span className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                <Building2 className="h-3 w-3" /> {city.theaterCount} Theaters
              </span>
            </button>
          ))}
          {filteredCities.length === 0 && (
            <p className="col-span-full py-4 text-center text-sm text-zinc-500">
              No cities found matching your search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}