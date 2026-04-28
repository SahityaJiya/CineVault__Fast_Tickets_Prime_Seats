import Link from 'next/link';
import { MovieCardData } from '@/types';
import { Clock, Film, Star } from 'lucide-react';

interface MovieCardProps {
  movie: MovieCardData;
  citySlug: string;
}

export default function MovieCard({ movie, citySlug }: MovieCardProps) {
  return (
    <Link
      href={`/movie/${movie.slug}?city=${citySlug}`}
      className="group relative flex flex-col rounded-2xl bg-zinc-900/40 border border-zinc-800/80 overflow-hidden hover:border-zinc-700 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-950/20"
    >
      {/* Poster Aspect Box */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-800">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
        
        {/* Formats Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {movie.format.map((fmt) => (
            <span
              key={fmt}
              className="px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-md border border-zinc-700/50 text-[10px] font-semibold text-rose-400 tracking-wider"
            >
              {fmt}
            </span>
          ))}
        </div>

        {/* Rating Mock Pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900/90 backdrop-blur-md border border-zinc-800 text-xs font-semibold text-amber-400">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>8.9/10</span>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold text-base text-white line-clamp-1 group-hover:text-rose-400 transition">
          {movie.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-2">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            {movie.durationMin}m
          </span>
          <span>•</span>
          <span>{movie.language}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {movie.genre.map((g) => (
            <span
              key={g}
              className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}