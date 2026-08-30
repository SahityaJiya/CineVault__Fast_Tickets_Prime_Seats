import { getAvailableCities } from '@/actions/movies';
import { getSelectedCityAction } from '@/actions/city';
import { prisma } from '@/lib/prisma';
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
  ArrowRight,
  Receipt
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
    bookingRef?: string;
  }>;
}

export default async function BookingConfirmationPage({
  searchParams,
}: BookingConfirmationPageProps) {
  const params = await searchParams;
  const rawRef = params.bookingRef || '';
  const token = rawRef.replace(/^CV-/i, '').toLowerCase();

  const [cities, selectedCity] = await Promise.all([
    getAvailableCities(),
    getSelectedCityAction(),
  ]);

  if (!rawRef && !params.showId) {
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

  // Query using qrCodeToken or id
  const booking = await prisma.booking.findFirst({
    where: {
      OR: [
        { qrCodeToken: { startsWith: token, mode: 'insensitive' } },
        { id: rawRef }
      ],
    },
    include: {
      show: {
        include: {
          movie: true,
          screen: {
            include: { theater: true },
          },
        },
      },
      showSeats: {
        include: { seat: true },
        orderBy: [
          { seat: { rowLabel: 'asc' } },
          { seat: { seatNumber: 'asc' } },
        ],
      },
    },
  });

  if (!booking) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        <Navbar cities={cities} currentCitySlug={selectedCity} />
        <main className="flex-1 max-w-lg mx-auto px-4 py-20 flex flex-col items-center text-center justify-center space-y-4">
          <AlertCircle className="h-12 w-12 text-amber-500" />
          <h1 className="text-xl font-bold text-white">Booking Not Found</h1>
          <p className="text-sm text-zinc-400">
            Could not find a confirmed reservation for reference <span className="font-mono text-white">{rawRef}</span>.
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

  const bookingRef = `CV-${booking.qrCodeToken.substring(0, 6).toUpperCase()}`;
  const receipt = {
    bookingId: booking.id,
    bookingRef,
    movieTitle: booking.show.movie.title,
    moviePoster: booking.show.movie.posterUrl,
    format: booking.show.movie.format,
    theaterName: booking.show.screen.theater.name,
    screenName: booking.show.screen.name,
    location: booking.show.screen.theater.location,
    startTime: booking.show.startTime,
    seats: booking.showSeats.map((ss) => `${ss.seat.rowLabel}${ss.seat.seatNumber}`),
    totalAmount: Number(booking.totalAmount),
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar cities={cities} currentCitySlug={selectedCity} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Worksheet 3: Act 1 - Header & Notice */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Booking Confirmed!
          </h1>
          
          {/* Act 1 Message */}
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm">
            <p className="font-semibold">
              The seat is booked you can show/provide the below code at the counter to pay and get ticket.
            </p>
            <div className="mt-2 text-xl sm:text-2xl font-mono font-black text-amber-400 tracking-widest">
              {receipt.bookingRef}
            </div>
          </div>
        </div>

        {/* Worksheet 3: Act 2 - Receipt Pass */}
        <div id="printable-receipt" className="rounded-3xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-2xl">
          <div className="p-6 bg-gradient-to-r from-rose-950/40 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">
                Counter Payment Receipt Pass
              </span>
              <h2 className="text-xl font-black text-white">{receipt.movieTitle}</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {receipt.theaterName} • {receipt.screenName}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                Booking Reference Code
              </span>
              <span className="font-mono font-bold text-amber-400 text-base">
                {receipt.bookingRef}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
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
                    {receipt.format?.join(' / ') || 'Standard 2D'}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-500 block mb-1">Booked Seats</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {receipt.seats.join(', ')}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-500 block mb-1">Amount to Pay</span>
                  <span className="font-extrabold text-white text-sm">
                    ₹{receipt.totalAmount}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-500 block mb-1">Cinema Location</span>
                  <span className="font-medium text-zinc-300 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                    {receipt.location}
                  </span>
                </div>
              </div>

              {/* Act 2 Message */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-rose-500 flex-shrink-0" />
                <span><strong>Show this receipt at the counter to pay and get the ticket.</strong></span>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-3">
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

            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-zinc-200 text-zinc-950 text-center shadow-lg">
              <QRCodeSVG
                value={`CINEVAULT:${receipt.bookingRef}:${receipt.bookingId}`}
                size={130}
                level="M"
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 mt-2.5">
                Counter Scan Code
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