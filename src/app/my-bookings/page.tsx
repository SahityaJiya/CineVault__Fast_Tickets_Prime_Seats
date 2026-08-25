import { getUserBookingsAction } from '@/actions/bookings';
import { getAvailableCities } from '@/actions/movies';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Ticket, Calendar, Clock, MapPin, Film, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MyBookingsPage() {
  const [cities, bookings] = await Promise.all([
    getAvailableCities(),
    getUserBookingsAction('alex@cinevault.io'),
  ]);


  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar cities={cities} currentCitySlug="mumbai" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between pb-6 border-b border-zinc-800 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Ticket className="h-6 w-6 text-rose-500" /> My Movie Tickets
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              View your confirmed reservations, seat allocations, and entry QR codes.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold">
            {bookings.length} Orders
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="py-24 text-center rounded-3xl border border-zinc-800/80 bg-zinc-900/30 space-y-4">
            <Ticket className="h-10 w-10 text-zinc-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Bookings Found</h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
              You haven't booked any movies yet. Explore now showing blockbusters in your city!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/20"
            >
              <Sparkles className="h-4 w-4" /> Browse Movies
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-zinc-700 transition shadow-xl"
              >
                {/* Poster & Film Info */}
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <img
                    src={b.moviePoster}
                    alt={b.movieTitle}
                    className="w-20 aspect-[2/3] rounded-xl object-cover bg-zinc-800 shadow-md flex-shrink-0"
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">
                        {b.format.join(' / ')}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        {b.status}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-white leading-tight">{b.movieTitle}</h2>

                    <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                      <span>
                        {b.theaterName} ({b.screenName})
                      </span>
                    </p>

                    <div className="flex items-center gap-3 text-xs text-zinc-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-zinc-500" />
                        {new Date(b.startTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-rose-400 font-medium">
                        <Clock className="h-3 w-3" />
                        {new Date(b.startTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking ID & Seats */}
                <div className="flex md:flex-col items-start justify-between w-full md:w-auto gap-2 border-t md:border-t-0 md:border-l border-zinc-800/80 pt-4 md:pt-0 md:pl-6">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                      Booking Reference
                    </span>
                    <span className="font-mono font-bold text-sm text-amber-400">{b.bookingRef}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                      Seats ({b.seats.length})
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {b.seats.join(', ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                      Total Paid
                    </span>
                    <span className="text-sm font-extrabold text-white">₹{b.totalAmount}</span>
                  </div>
                </div>

                {/* QR Code Pass */}
                <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-2xl flex-shrink-0">
                  <QRCodeSVG value={`CINEVAULT:${b.bookingRef}:${b.id}`} size={85} level="M" />
                  <span className="text-[8px] font-bold text-zinc-800 uppercase tracking-wider mt-1">
                    Entry Pass
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}