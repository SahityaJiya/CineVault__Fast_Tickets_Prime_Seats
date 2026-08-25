import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getAvailableCities, getMovieShowtimes } from '@/actions/movies';
import Navbar from '@/components/Navbar';
import DateSelector from '@/components/DateSelector';
import { Clock, Star, MapPin, Building2, Ticket, ArrowLeft } from 'lucide-react';

interface MoviePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ city?: string; date?: string }>;
}

export default async function MovieDetailsPage({ params, searchParams }: MoviePageProps) {
  const { slug } = await params;
  const sParams = await searchParams;

  const cookieStore = await cookies();
  const storedCitySlug = cookieStore.get('selected_city')?.value;

  // Clean raw city param to avoid literal "undefined" string
  const rawCityParam = sParams.city && sParams.city !== 'undefined' ? sParams.city : null;
  const currentCitySlug = rawCityParam || storedCitySlug || 'bengaluru';
  const selectedDateStr = sParams.date && sParams.date !== 'undefined'
    ? sParams.date
    : new Date().toISOString().split('T')[0];

  const [cities, movieData] = await Promise.all([
    getAvailableCities(),
    getMovieShowtimes(slug, currentCitySlug, selectedDateStr),
  ]);

  if (!movieData || !movieData.movie) {
    notFound();
  }

  const { movie, theaters = [] } = movieData;
  const activeCity =
    cities.find((c) => c.slug.toLowerCase() === currentCitySlug.toLowerCase()) ||
    cities[0] || { id: 'default', name: 'Bengaluru', slug: 'bengaluru' };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar cities={cities} currentCitySlug={activeCity.slug} />

      {/* Hero Banner */}
      <div className="relative w-full border-b border-zinc-800/80 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link
            href={`/?city=${activeCity.slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Movies
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-48 sm:w-56 flex-shrink-0 aspect-[2/3] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {movie.format?.map((fmt: string) => (
                  <span
                    key={fmt}
                    className="px-2.5 py-0.5 rounded-md bg-rose-600/10 border border-rose-500/20 text-rose-400 text-xs font-semibold"
                  >
                    {fmt}
                  </span>
                ))}
                {movie.language && (
                  <span className="px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-xs font-medium">
                    {movie.language}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {movie.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-zinc-400 mt-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span>8.9/10</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-zinc-500" />
                  <span>{movie.durationMin} mins</span>
                </div>
                {movie.genre?.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{movie.genre.join(', ')}</span>
                  </>
                )}
              </div>

              <p className="mt-4 text-sm text-zinc-300 leading-relaxed max-w-3xl">
                {movie.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Carousel & Theater Schedule */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80 mb-8">
          <div>
            <h2 className="text-lg font-bold text-white">Select Date & Showtime</h2>
            <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 text-rose-500" /> Showing in {activeCity.name}
            </p>
          </div>
          <DateSelector currentDateStr={selectedDateStr} />
        </div>

        {/* Theaters List */}
        <div className="space-y-6">
          {theaters.map((theater: any) => (
            <div
              key={theater.theaterId}
              className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="lg:max-w-xs">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-rose-500 flex-shrink-0" />
                  <h3 className="font-semibold text-white text-base">{theater.theaterName}</h3>
                </div>
                <p className="text-xs text-zinc-400 mt-1 pl-6">{theater.location}</p>
              </div>

              <div className="flex-1 flex flex-wrap items-center gap-3">
                {theater.shows.map((show: any) => (
                  <Link
                    key={show.id}
                    href={`/booking/${show.id}`}
                    className="group flex flex-col items-center justify-center min-w-[120px] p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:border-rose-500 hover:bg-rose-500/10 transition"
                  >
                    <span className="font-bold text-sm text-white group-hover:text-rose-400">
                      {new Date(show.startTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                    <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400 mt-0.5">
                      {show.screenName}
                    </span>
                    <span className="text-[11px] font-medium text-emerald-400 mt-1">
                      ₹{show.basePrice}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {theaters.length === 0 && (
            <div className="py-16 text-center rounded-2xl border border-zinc-800 bg-zinc-900/20">
              <Ticket className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-zinc-400 text-sm">No showtimes scheduled in {activeCity.name} for this date.</p>
              <p className="text-zinc-500 text-xs mt-1">Try selecting another date from the calendar above.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}