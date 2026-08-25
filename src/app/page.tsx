import Link from 'next/link';
import { cookies } from 'next/headers';
import { getAvailableCities, getMoviesByCity } from '@/actions/movies';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { Film, Sparkles, Clapperboard } from 'lucide-react';

interface HomePageProps {
  searchParams: Promise<{ city?: string; q?: string; genre?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const sParams = await searchParams;

  const cookieStore = await cookies();
  const storedCitySlug = cookieStore.get('selected_city')?.value;

  const rawCityParam = sParams.city && sParams.city !== 'undefined' ? sParams.city : null;
  const currentCitySlug = rawCityParam || storedCitySlug || 'bengaluru';
  const searchQuery = sParams.q || '';
  const selectedGenre = sParams.genre || '';

  const [cities, movies] = await Promise.all([
    getAvailableCities(),
    getMoviesByCity(currentCitySlug, searchQuery, selectedGenre),
  ]);

  const activeCity =
    cities.find((c) => c.slug.toLowerCase() === currentCitySlug.toLowerCase()) ||
    cities[0] || { id: 'default', name: 'Bengaluru', slug: 'bengaluru' };

  const genres = ['All', 'Action', 'Sci-Fi', 'Horror', 'Comedy', 'Drama', 'Adventure'];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar cities={cities} currentCitySlug={activeCity.slug} />

      {/* Hero Header Section */}
      <section className="relative border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Now Showing in {activeCity.name}
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Experience Cinema Like <br className="hidden sm:inline" />
              <span className="text-rose-500">Never Before.</span>
            </h1>
            <p className="text-sm text-zinc-400 mt-2 max-w-xl">
              Instant multiplex tickets, seat selection, and digital boarding passes in seconds.
            </p>
          </div>

          {/* Quick Genre Filters */}
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => {
              const isActive = (g === 'All' && !selectedGenre) || selectedGenre.toLowerCase() === g.toLowerCase();
              const href = g === 'All' ? `/?city=${activeCity.slug}` : `/?city=${activeCity.slug}&genre=${g.toLowerCase()}`;
              return (
                <Link
                  key={g}
                  href={href}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    isActive
                      ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-600/20'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {g}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Movie Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 mb-8">
          <div className="flex items-center gap-2">
            <Clapperboard className="h-5 w-5 text-rose-500" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Recommended Movies</h2>
          </div>
          <span className="text-xs text-zinc-500">{movies.length} releases</span>
        </div>

        {movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                citySlug={activeCity.slug}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-3xl border border-zinc-800 bg-zinc-900/20 max-w-md mx-auto">
            <Film className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Movies Found</h3>
            <p className="text-xs text-zinc-400 mt-1 px-4">
              Try clearing search filters or check another city in the top navigation bar.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}