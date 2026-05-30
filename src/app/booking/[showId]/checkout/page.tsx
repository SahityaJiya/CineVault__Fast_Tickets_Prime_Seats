import { notFound } from 'next/navigation';
import { getCheckoutDetails } from '@/actions/seats';
import CheckoutView from '@/components/CheckoutView';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface CheckoutPageProps {
  params: Promise<{ showId: string }>;
  searchParams: Promise<{ seatIds?: string }>;
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { showId } = await params;
  const sParams = await searchParams;
  const seatIds = sParams.seatIds ? sParams.seatIds.split(',') : [];

  if (seatIds.length === 0) {
    notFound();
  }

  const details = await getCheckoutDetails(showId, seatIds);

  if (!details) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href={`/booking/${showId}`}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Seat Matrix
          </Link>
          <span className="text-sm font-bold text-white tracking-tight">Review & Checkout</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <CheckoutView details={details} />
      </main>
    </div>
  );
}