'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface DateSelectorProps {
  currentDateStr: string;
}

export default function DateSelector({ currentDateStr }: DateSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Generate next 7 days starting today
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'TODAY' : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const dayNumber = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

    return {
      dateStr,
      dayName,
      dayNumber,
      monthName,
    };
  });

  const handleSelectDate = (dateStr: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', dateStr);
    
    // Clean up if city was set as "undefined"
    if (params.get('city') === 'undefined') {
      params.delete('city');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
      {dates.map((item) => {
        const isSelected = item.dateStr === currentDateStr;
        return (
          <button
            key={item.dateStr}
            onClick={() => handleSelectDate(item.dateStr)}
            className={`flex flex-col items-center justify-center min-w-[65px] px-3 py-2 rounded-xl text-center border transition-all ${
              isSelected
                ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/25 font-bold'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
            }`}
          >
            <span className="text-[10px] tracking-wider uppercase font-semibold">
              {item.dayName}
            </span>
            <span className="text-base font-extrabold my-0.5">{item.dayNumber}</span>
            <span className="text-[10px] uppercase text-zinc-400 font-medium">
              {item.monthName}
            </span>
          </button>
        );
      })}
    </div>
  );
}