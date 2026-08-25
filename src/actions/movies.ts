'use server';

import { prisma } from '@/lib/prisma';

export interface CityOption {
  id: string;
  name: string;
  slug: string;
}

export interface MovieCardData {
  id: string;
  title: string;
  slug: string;
  description: string;
  durationMin: number;
  language: string;
  genre: string[];
  posterUrl: string;
  trailerUrl: string | null;
  releaseDate: Date;
  format: string[];
}

export async function getAvailableCities(): Promise<CityOption[]> {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { name: 'asc' },
    });
    return cities;
  } catch (error) {
    console.error('Failed to fetch cities:', error);
    return [];
  }
}

export async function getMoviesByCity(
  citySlug?: string,
  searchQuery?: string,
  genre?: string
): Promise<MovieCardData[]> {
  try {
    const cleanCitySlug =
      citySlug && citySlug !== 'undefined' ? citySlug.toLowerCase() : 'bengaluru';

    const city = await prisma.city.findUnique({
      where: { slug: cleanCitySlug },
    });

    const whereClause: any = {};

    if (searchQuery && searchQuery.trim()) {
      whereClause.OR = [
        { title: { contains: searchQuery.trim(), mode: 'insensitive' } },
        { language: { contains: searchQuery.trim(), mode: 'insensitive' } },
      ];
    }

    if (genre && genre.trim()) {
      whereClause.genre = {
        has: genre.trim(),
      };
    }

    // If city exists, filter to movies that have active screens/shows in that city
    if (city) {
      whereClause.shows = {
        some: {
          screen: {
            theater: {
              cityId: city.id,
            },
          },
        },
      };
    }

    let movies = await prisma.movie.findMany({
      where: whereClause,
      orderBy: { releaseDate: 'desc' },
    });

    // Fallback: If city-specific shows query yields empty, return all matching movies
    if (movies.length === 0 && !searchQuery && !genre) {
      movies = await prisma.movie.findMany({
        orderBy: { releaseDate: 'desc' },
      });
    }

    return movies;
  } catch (error) {
    console.error('Failed to fetch movies by city:', error);
    return [];
  }
}

export async function getMovieShowtimes(
  movieSlug: string,
  citySlug: string,
  targetDateStr: string
) {
  try {
    const cleanCitySlug =
      citySlug && citySlug !== 'undefined' ? citySlug.toLowerCase() : 'bengaluru';

    const [movie, city] = await Promise.all([
      prisma.movie.findUnique({
        where: { slug: movieSlug },
      }),
      prisma.city.findUnique({
        where: { slug: cleanCitySlug },
      }),
    ]);

    if (!movie || !city) {
      return null;
    }

    const [year, month, day] = targetDateStr.split('-').map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const theaters = await prisma.theater.findMany({
      where: {
        cityId: city.id,
      },
      include: {
        screens: {
          include: {
            shows: {
              where: {
                movieId: movie.id,
                startTime: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
              orderBy: {
                startTime: 'asc',
              },
            },
          },
        },
      },
    });

    const theaterShowData = theaters
      .map((theater) => {
        const shows = theater.screens.flatMap((screen) =>
          screen.shows.map((show) => ({
            id: show.id,
            startTime: show.startTime.toISOString(),
            endTime: show.endTime.toISOString(),
            basePrice: Number(show.basePrice),
            screenName: screen.name,
          }))
        );

        return {
          theaterId: theater.id,
          theaterName: theater.name,
          location: theater.location,
          shows: shows.sort(
            (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          ),
        };
      })
      .filter((t) => t.shows.length > 0);

    return {
      movie,
      theaters: theaterShowData,
    };
  } catch (error) {
    console.error('Failed to get movie showtimes:', error);
    return null;
  }
}