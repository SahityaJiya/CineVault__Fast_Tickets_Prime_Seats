'use client';

import { QRCodeSVG } from 'qrcode.react';
import { BookingReceipt } from '@/actions/bookings';
import { Film, MapPin, Calendar, Clock, Download, CheckCircle2, Ticket } from 'lucide-react';

interface TicketCardProps {
  receipt: BookingReceipt;
}

export default function TicketCard({ receipt }: TicketCardProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-md w-full mx-auto flex flex-col items-center">
      {/* Success Badge */}
      <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-xs font-semibold mb-6">
        <CheckCircle2 className="h-4 w-4" />
        <span>Booking Confirmed & Verified</span>
      </div>

      {/* Main Boarding Pass Card */}
      <div className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Top Poster Section */}
        <div className="relative h-44 w-full bg-zinc-950 overflow-hidden">
          <img
            src={receipt.moviePoster}
            alt={receipt.movieTitle}
            className="w-full h-full object-cover opacity-40 blur-sm scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />

          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-rose-500 uppercase">
                {receipt.format.join(' • ')}
              </span>
              <h2 className="text-xl font-extrabold text-white leading-tight mt-0.5">
                {receipt.movieTitle}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                Booking ID
              </span>
              <span className="font-mono font-bold text-sm text-amber-400">
                {receipt.bookingRef}
              </span>
            </div>
          </div>
        </div>

        {/* Cinema Details */}
        <div className="p-6 space-y-5">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <MapPin className="h-3.5 w-3.5 text-rose-500" />
              <span>{receipt.theaterName}</span>
            </div>
            <p className="text-[11px] text-zinc-500 pl-5">{receipt.location}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-zinc-800/80 text-xs">
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">
                Date & Time
              </span>
              <span className="font-bold text-zinc-200 mt-0.5 block">
                {new Date(receipt.startTime).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span className="text-rose-400 font-semibold text-[11px]">
                {new Date(receipt.startTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">
                Screen & Seats
              </span>
              <span className="font-bold text-zinc-200 mt-0.5 block">
                {receipt.screenName}
              </span>
              <span className="text-emerald-400 font-bold text-xs">
                {receipt.seats.join(', ')}
              </span>
            </div>
          </div>

          {/* Ticket Tear Notches */}
          <div className="relative flex items-center justify-between -mx-6 my-2">
            <div className="w-6 h-6 rounded-full bg-zinc-950 -ml-3 border-r border-zinc-800" />
            <div className="flex-1 border-t-2 border-dashed border-zinc-800 mx-2" />
            <div className="w-6 h-6 rounded-full bg-zinc-950 -mr-3 border-l border-zinc-800" />
          </div>

          {/* QR Code Entry Scanner */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="p-3 bg-white rounded-2xl shadow-inner">
              <QRCodeSVG
                value={`CINEVAULT:${receipt.bookingRef}:${receipt.bookingId}`}
                size={120}
                level="H"
              />
            </div>
            <span className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase mt-3">
              Scan at cinema gate for entry
            </span>
          </div>
        </div>
      </div>

      {/* Print & Download Button */}
      <button
        onClick={handlePrint}
        className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition"
      >
        <Download className="h-4 w-4 text-rose-500" />
        <span>Save / Print Ticket</span>
      </button>
    </div>
  );
}