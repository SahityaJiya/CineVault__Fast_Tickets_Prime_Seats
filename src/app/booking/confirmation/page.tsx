import { finalizeBookingAction } from '@/actions/bookings';
import { getAvailableCities } from '@/actions/movies';
import { getSelectedCityAction } from '@/actions/city';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  AlertCircle, 
  Download, 
  ArrowRight 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BookingConfirmationPageProps {
  searchParams: Promise<{
    showId?: string;
    seats?: string;
    email?: string;
    total?: string;
  }>;
}

export default async function BookingConfirmationPage({
  searchParams,
}: BookingConfirmationPageProps) {
  const params = await searchParams;
  const showId = params.showId || '';
  const seatIds = params.seats ? params.seats.split(',').filter(Boolean) : [];
  const customerEmail = params.email || 'customer@cinevault.io';
  const totalAmount = params.total ? parseFloat(params.total) : 0;

  const [cities, selectedCity] = await Promise.all([
    getAvailableCities(),
    getSelectedCityAction(),
  ]);

  if (!showId || seatIds.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        <Navbar cities={cities} currentCitySlug={selectedCity} />
        <main className="flex-1 max-w-lg mx-auto px-4 py-20 flex flex-col items-center text-center justify-center space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <h1 className="text-xl font-bold text-white">Invalid Booking Session</h1>
          <p className="text-sm text-zinc-400">
            No valid reservation was found in this request session.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/20"
          >
            <Sparkles className="h-4 w-4" /> Return to Home
          </Link>
        </main>
      </div>
    );
  }

  const receipt = await finalizeBookingAction({
    showId,
    seatIds,
    totalAmount,
    customerEmail,
  });

  if (!receipt) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        <Navbar cities={cities} currentCitySlug={selectedCity} />
        <main className="flex-1 max-w-lg mx-auto px-4 py-20 flex flex-col items-center text-center justify-center space-y-4">
          <AlertCircle className="h-12 w-12 text-amber-500" />
          <h1 className="text-xl font-bold text-white">Booking Already Processed</h1>
          <p className="text-sm text-zinc-400">
            This reservation is either already confirmed or the seat lock expired. Check your active tickets.
          </p>
          <div className="flex items-center gap-3 pt-4">
            <Link
              href="/my-bookings"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/20"
            >
              View My Bookings
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition"
            >
              Browse Movies
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar cities={cities} currentCitySlug={selectedCity} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Success Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Booking Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Your e-ticket and entry pass have been generated for{' '}
            <span className="text-white font-medium">{customerEmail}</span>.
          </p>
        </div>

        {/* Digital Ticket Card */}
        <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-2xl">
          {/* Ticket Header */}
          <div className="p-6 bg-gradient-to-r from-rose-950/40 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">
                Official Entry Pass
              </span>
              <h2 className="text-xl font-black text-white">{receipt.movieTitle}</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {receipt.theaterName} • {receipt.screenName}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                Booking ID
              </span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {receipt.bookingRef}
              </span>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Movie Info & Meta */}
            <div className="md:col-span-8 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-zinc-500 block mb-1">Date</span>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    {new Date(receipt.startTime).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-500 block mb-1">Showtime</span>
                  <span className="font-bold text-rose-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(receipt.startTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-500 block mb-1">Format</span>
                  <span className="font-bold text-zinc-200">
                    {receipt.format.join(' / ') || 'Standard 2D'}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-500 block mb-1">Seats</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {receipt.seats.join(', ')}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-500 block mb-1">Total Paid</span>
                  <span className="font-extrabold text-white text-sm">
                    ₹{receipt.totalAmount}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-500 block mb-1">Location</span>
                  <span className="font-medium text-zinc-300 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                    {receipt.location}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-3">
                <Link
                  href="/my-bookings"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shadow-rose-600/20"
                >
                  <Ticket className="h-3.5 w-3.5" /> View in My Tickets <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/"
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
                >
                  Book More
                </Link>
              </div>
            </div>

            {/* Right QR Entry Code */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-zinc-200 text-zinc-950 text-center shadow-lg">
              <QRCodeSVG
                value={`CINEVAULT:${receipt.bookingRef}:${receipt.bookingId}`}
                size={130}
                level="M"
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 mt-2.5">
                Scan at Gate
              </span>
              <span className="text-[9px] font-mono text-zinc-500">
                {receipt.bookingRef}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}