import { getAvailableCities, getMoviesByCity } from '@/actions/movies';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { Film, Sparkles } from 'lucide-react';

interface HomePageProps {
  searchParams: Promise<{
    city?: string;
    genre?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const currentCitySlug = params.city || 'mumbai';
  
  const [cities, movies] = await Promise.all([
    getAvailableCities(),
    getMoviesByCity(currentCitySlug, { genre: params.genre }),
  ]);

  const activeCity = cities.find((c) => c.slug === currentCitySlug) || cities[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar cities={cities} currentCitySlug={currentCitySlug} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Section */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-950/40 via-zinc-900 to-zinc-900 border border-zinc-800/80 p-8 sm:p-10 mb-10 shadow-2xl">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Experience Cinema in {activeCity?.name}
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Book Tickets for the Latest Blockbusters
            </h1>
            <p className="mt-3 text-sm sm:text-base text-zinc-400">
              Select your preferred seats in IMAX, 4DX, and Dolby Atmos with zero latency.
            </p>
          </div>
        </section>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-rose-500" />
            <h2 className="text-xl font-bold text-white tracking-tight">Now Showing</h2>
          </div>
          <span className="text-sm text-zinc-400">{movies.length} Movies Available</span>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} citySlug={currentCitySlug} />
          ))}
        </div>

        {movies.length === 0 && (
          <div className="py-20 text-center rounded-2xl border border-zinc-800 bg-zinc-900/30">
            <p className="text-zinc-400 text-base">No movies currently showing in {activeCity?.name}.</p>
          </div>
        )}
      </main>
    </div>
  );
}