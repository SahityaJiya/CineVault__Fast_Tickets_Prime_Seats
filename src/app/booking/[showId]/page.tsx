import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getShowSeatMatrix } from '@/actions/seats';
import SeatMatrix from '@/components/SeatMatrix';
import { ArrowLeft, Clock, MapPin, Film, AlertCircle } from 'lucide-react';

interface BookingPageProps {
  params: Promise<{ showId: string }>;
  searchParams?: Promise<{ error?: string }>;
}

export default async function BookingSeatPage({ params, searchParams }: BookingPageProps) {
  const { showId } = await params;
  const sParams = searchParams ? await searchParams : {};
  const errorMessage = sParams.error;

  const showData = await getShowSeatMatrix(showId);

  if (!showData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Breadcrumb Bar */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">
                {showData.movieTitle}
              </h1>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <span>{showData.theaterName} ({showData.screenName})</span>
                <span>•</span>
                <span className="text-rose-400 font-medium">
                  {new Date(showData.startTime).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                  })}{' '}
                  •{' '}
                  {new Date(showData.startTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-300">
            <Film className="h-3.5 w-3.5 text-rose-500" />
            <span>{showData.movieFormat.join(' / ')}</span>
          </div>
        </div>
      </header>

      {/* Error / Timeout Banner for Worksheet 3 */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Main Seat Matrix View */}
      <main className="flex-1 flex flex-col">
        <SeatMatrix data={showData} />
      </main>
    </div>
  );
}