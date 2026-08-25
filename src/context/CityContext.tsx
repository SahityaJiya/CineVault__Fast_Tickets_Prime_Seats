"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { City } from "@/components/CityModal";

interface CityContextType {
  selectedCity: City | null;
  setSelectedCity: (city: City) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  cities: City[];
  setCities: (cities: City[]) => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCityState] = useState<City | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch cities from your API route (/api/cities) on mount
  useEffect(() => {
    async function loadCities() {
      try {
        const res = await fetch("/api/cities");
        if (res.ok) {
          const data = await res.json();
          setCities(data);

          // Restore saved city or default to Bengaluru/First city
          const savedSlug = localStorage.getItem("cinevault_city_slug");
          const found = data.find((c: City) => c.slug === savedSlug);
          if (found) {
            setSelectedCityState(found);
          } else {
            const defaultCity = data.find((c: City) => c.slug === "bengaluru") || data[0];
            setSelectedCityState(defaultCity || null);
          }
        }
      } catch (err) {
        console.error("Failed to load cities:", err);
      }
    }
    loadCities();
  }, []);

  const setSelectedCity = (city: City) => {
    setSelectedCityState(city);
    localStorage.setItem("cinevault_city_slug", city.slug);
  };

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        isModalOpen,
        setIsModalOpen,
        cities,
        setCities,
      }}
    >
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error("useCity must be used within a CityProvider");
  }
  return context;
}