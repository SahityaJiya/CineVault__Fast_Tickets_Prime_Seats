'use client';

import { useState } from 'react';
import { ShowDetailsWithMatrix, MatrixSeat } from '@/types';
import type { SeatTier, SeatStatus } from '@prisma/client';
import { Armchair, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface SeatMatrixProps {
  data: ShowDetailsWithMatrix;
}

export default function SeatMatrix({ data }: SeatMatrixProps) {
  const [selectedSeats, setSelectedSeats] = useState<MatrixSeat[]>([]);

  const toggleSeatSelection = (seat: MatrixSeat) => {
    if (seat.status !== SeatStatus.AVAILABLE) return;

    if (selectedSeats.some((s) => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 8) {
        alert('You can select a maximum of 8 seats per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = selectedSeats.length > 0 ? selectedSeats.length * 35 : 0;
  const grandTotal = subtotal + convenienceFee;

  // Group rows by Tier to render distinct cinema sections
  const rows = Object.keys(data.seatsByRow).sort();
  const tiers: SeatTier[] = [SeatTier.RECLINER, SeatTier.PRIME, SeatTier.CLASSIC];

  return (
    <div className="flex flex-col flex-1 relative pb-32">
      {/* Screen Curved Header */}
      <div className="w-full max-w-4xl mx-auto my-8 flex flex-col items-center">
        <div className="w-4/5 h-3.5 bg-gradient-to-r from-transparent via-rose-500/80 to-transparent rounded-t-full blur-[1px]" />
        <div className="w-full h-1 bg-zinc-700/60 rounded-full shadow-[0_15px_30px_rgba(244,63,94,0.15)]" />
        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.3em] mt-3">
          All Eyes This Way — Screen
        </span>
      </div>

      {/* Seating Layout Matrix */}
      <div className="max-w-4xl mx-auto w-full px-4 overflow-x-auto py-6">
        <div className="min-w-[600px] flex flex-col gap-8">
          {tiers.map((tier) => {
            const tierRows = rows.filter((r) => data.seatsByRow[r].tier === tier);
            if (tierRows.length === 0) return null;

            return (
              <div key={tier} className="space-y-3">
                {/* Tier Divider & Pricing */}
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 text-xs">
                  <span className="font-bold text-zinc-400 tracking-wider flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        tier === SeatTier.RECLINER
                          ? 'bg-amber-400'
                          : tier === SeatTier.PRIME
                          ? 'bg-purple-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    {tier} SEATING
                  </span>
                  <span className="font-semibold text-zinc-300">
                    ₹{data.tierPricing[tier]}
                  </span>
                </div>

                {/* Rows Grid */}
                <div className="space-y-2.5">
                  {tierRows.map((rowLabel) => {
                    const rowData = data.seatsByRow[rowLabel];
                    return (
                      <div key={rowLabel} className="flex items-center justify-center gap-3">
                        <span className="w-5 text-xs font-bold text-zinc-500 text-center">
                          {rowLabel}
                        </span>

                        <div className="flex items-center gap-2">
                          {rowData.seats.map((seat) => {
                            const isSelected = selectedSeats.some((s) => s.id === seat.id);
                            const isAvailable = seat.status === SeatStatus.AVAILABLE;
                            const isBooked = seat.status === SeatStatus.BOOKED;

                            return (
                              <button
                                key={seat.id}
                                disabled={!isAvailable}
                                onClick={() => toggleSeatSelection(seat)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-105 border-rose-500 ring-2 ring-rose-400'
                                    : isBooked
                                    ? 'bg-zinc-800/40 text-zinc-600 cursor-not-allowed border border-zinc-800/30'
                                    : 'bg-zinc-900 border border-zinc-700/80 text-zinc-300 hover:border-rose-500 hover:text-white'
                                }`}
                              >
                                {seat.seatNumber}
                              </button>
                            );
                          })}
                        </div>

                        <span className="w-5 text-xs font-bold text-zinc-500 text-center">
                          {rowLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 my-6 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-zinc-900 border border-zinc-700" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-600 border border-rose-500 ring-1 ring-rose-400" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-zinc-800/40 border border-zinc-800/30" />
          <span>Occupied</span>
        </div>
      </div>

      {/* Floating Bottom Sticky Checkout Bar */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800 shadow-2xl p-4 sm:p-5">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-400">Selected Seats:</span>
                <span className="text-sm font-bold text-white">
                  {selectedSeats.map((s) => `${s.rowLabel}${s.seatNumber}`).join(', ')}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  ({selectedSeats.length} Tickets)
                </span>
              </div>
              <div className="text-xs text-zinc-400 mt-1 flex items-center gap-3">
                <span>Tickets: ₹{subtotal}</span>
                <span>•</span>
                <span>Convenience: ₹{convenienceFee}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold text-sm">Total: ₹{grandTotal}</span>
              </div>
            </div>

            <Link
              href={`/booking/${data.showId}/checkout?seatIds=${selectedSeats.map((s) => s.id).join(',')}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-rose-600/30"
            >
              <span>Proceed to Checkout</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}