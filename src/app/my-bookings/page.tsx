import { getUserBookingsAction } from '@/actions/bookings';
import { getAvailableCities } from '@/actions/movies';
import { getSelectedCityAction } from '@/actions/city';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  Film, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface MyBookingsPageProps {
  searchParams: Promise<{
    email?: string;
  }>;
}

export default async function MyBookingsPage({ searchParams }: MyBookingsPageProps) {
  const params = await searchParams;
  const currentEmail = params.email || '';

  const [cities, selectedCity, bookings] = await Promise.all([
    getAvailableCities(),
    getSelectedCityAction(),
    getUserBookingsAction(currentEmail || undefined),
  ]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar cities={cities} currentCitySlug={selectedCity} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Ticket className="h-7 w-7 text-rose-500" /> My Tickets & Bookings
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Search and view verified booking entry passes by email
            </p>
          </div>

          {/* Email Search Filter */}
          <form method="GET" action="/my-bookings" className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                defaultValue={currentEmail}
                placeholder="Search by email (e.g. abc@gmail.com)"
                className="pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 w-64 sm:w-72 transition"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold transition shadow-md shadow-rose-600/20"
            >
              Filter
            </button>
          </form>
        </div>

        {/* Empty State */}
        {bookings.length === 0 && (
          <div className="p-12 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 text-center flex flex-col items-center justify-center space-y-3">
            <AlertCircle className="h-10 w-10 text-zinc-600" />
            <h3 className="text-base font-bold text-zinc-300">
              {currentEmail ? `No bookings found for "${currentEmail}"` : 'Enter your email to view tickets'}
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm">
              {currentEmail 
                ? 'Check if the email matches the one used during checkout, or book a movie now.' 
                : 'Type your customer email in the search bar above to look up your passes.'}
            </p>
            <Link
              href="/"
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition"
            >
              <Film className="h-3.5 w-3.5" /> Explore Movies
            </Link>
          </div>
        )}

        {/* Bookings List */}
        {bookings.length > 0 && (
          <div className="space-y-6">
            <div className="text-xs text-zinc-400">
              Showing <span className="text-white font-bold">{bookings.length}</span> booking(s)
              {currentEmail && <> for <span className="text-rose-400 font-medium">{currentEmail}</span></>}
            </div>

            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-3xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-xl flex flex-col md:flex-row"
              >
                {/* Left Ticket Details */}
                <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-amber-400 tracking-wider">
                        {booking.bookingRef}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {booking.status}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">{booking.movieTitle}</h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      {booking.theaterName} • {booking.screenName}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-t border-zinc-800/80 pt-4">
                    <div>
                      <span className="text-zinc-500 block mb-1">Date & Time</span>
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />
                        <span>
                          {new Date(booking.startTime).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                          })}{' '}
                          •{' '}
                          {new Date(booking.startTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </span>
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-500 block mb-1">Seats</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {booking.seats.join(', ')}
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-500 block mb-1">Format</span>
                      <span className="font-bold text-zinc-300">
                        {booking.format.join(' / ') || 'Standard 2D'}
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-500 block mb-1">Amount Paid</span>
                      <span className="font-extrabold text-white">
                        ₹{booking.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right QR Section */}
                <div className="p-6 md:p-8 bg-zinc-900 border-t md:border-t-0 md:border-l border-zinc-800 flex flex-col items-center justify-center text-center sm:w-56 bg-gradient-to-b from-zinc-900 to-zinc-950">
                  <div className="p-3 bg-white rounded-2xl shadow-md">
                    <QRCodeSVG
                      value={`CINEVAULT:${booking.bookingRef}:${booking.id}`}
                      size={100}
                      level="M"
                    />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-3">
                    Scan Entry QR
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