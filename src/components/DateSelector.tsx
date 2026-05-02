'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface DateSelectorProps {
  currentDateStr: string;
}

export default function DateSelector({ currentDateStr }: DateSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Generate 6 upcoming days
  const dates = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateObj: d,
      isoDate: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'TODAY' : i === 1 ? 'TOM' : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    };
  });

  const handleSelectDate = (isoDate: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', isoDate);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
      {dates.map((item) => {
        const isSelected = item.isoDate === currentDateStr;
        return (
          <button
            key={item.isoDate}
            onClick={() => handleSelectDate(item.isoDate)}
            className={`flex flex-col items-center justify-center min-w-[72px] py-2.5 px-3 rounded-2xl border transition ${
              isSelected
                ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/25'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <span className="text-[10px] font-bold tracking-wider">{item.dayName}</span>
            <span className="text-lg font-extrabold my-0.5">{item.dayNumber}</span>
            <span className="text-[10px] font-medium">{item.month}</span>
          </button>
        );
      })}
    </div>
  );
}