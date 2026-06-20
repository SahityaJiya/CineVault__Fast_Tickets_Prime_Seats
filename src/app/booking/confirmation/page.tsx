import { finalizeBookingAction } from '@/actions/bookings';
import TicketCard from '@/components/TicketCard';
import Navbar from '@/components/Navbar';
import { getAvailableCities } from '@/actions/movies';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ConfirmationPageProps {
  searchParams: Promise<{
    showId?: string;
    seatIds?: string;
    total?: string;
  }>;
}

export default async function BookingConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const params = await searchParams;
  const showId = params.showId || '';
  const seatIds = params.seatIds ? params.seatIds.split(',') : [];
  const totalAmount = Number(params.total) || 0;

  const cities = await getAvailableCities();

  const receipt = await finalizeBookingAction({
    showId,
    seatIds,
    totalAmount,
    customerEmail: 'alex@cinevault.io',
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar cities={cities} currentCitySlug="mumbai" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center">
        {receipt ? (
          <TicketCard receipt={receipt} />
        ) : (
          <div className="py-20 text-center space-y-4">
            <h2 className="text-xl font-bold text-white">Booking Recorded Successfully</h2>
            <p className="text-sm text-zinc-400">
              Your digital ticket receipt has been finalized and sent to your registered email.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Home
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}