'use server';

import { prisma } from '@/lib/prisma';
import { CityOption, MovieCardData, MovieDetailsWithShows, TheaterShowSchedule } from '@/types';
import { SeatStatus } from '@prisma/client';

export async function getAvailableCities(): Promise<CityOption[]> {
  try {
    const cities = await prisma.city.findMany({
      include: {
        _count: {
          select: { theaters: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return cities.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      theaterCount: c._count.theaters,
    }));
  } catch (error) {
    console.error('Failed to fetch cities:', error);
    return [];
  }
}

export async function getMoviesByCity(citySlug: string, filters?: {
  genre?: string;
  language?: string;
  format?: string;
}): Promise<MovieCardData[]> {
  try {
    const city = await prisma.city.findUnique({
      where: { slug: citySlug },
    });

    if (!city) return [];

    // Find all movies currently having active shows in theaters in this city
    const movies = await prisma.movie.findMany({
      where: {
        shows: {
          some: {
            screen: {
              theater: {
                cityId: city.id,
              },
            },
            startTime: {
              gte: new Date(),
            },
          },
        },
        ...(filters?.genre ? { genre: { has: filters.genre } } : {}),
        ...(filters?.language ? { language: filters.language } : {}),
        ...(filters?.format ? { format: { has: filters.format } } : {}),
      },
      distinct: ['id'],
      orderBy: { releaseDate: 'desc' },
    });

    return movies;
  } catch (error) {
    console.error('Failed to fetch movies by city:', error);
    return [];
  }
}

export async function getMovieShowtimes(
  movieSlug: string,
  citySlug: string,
  targetDateStr?: string
): Promise<MovieDetailsWithShows | null> {
  try {
    const movie = await prisma.movie.findUnique({
      where: { slug: movieSlug },
    });

    if (!movie) return null;

    const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const theaters = await prisma.theater.findMany({
      where: {
        city: { slug: citySlug },
        screens: {
          some: {
            shows: {
              some: {
                movieId: movie.id,
                startTime: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
            },
          },
        },
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
              include: {
                showSeats: {
                  where: { status: SeatStatus.AVAILABLE },
                  select: { id: true },
                },
              },
              orderBy: { startTime: 'asc' },
            },
          },
        },
      },
    });

    const theaterSchedules: TheaterShowSchedule[] = theaters.map((t) => {
      const allShows = t.screens.flatMap((screen) =>
        screen.shows.map((show) => ({
          id: show.id,
          startTime: show.startTime,
          endTime: show.endTime,
          basePrice: Number(show.basePrice),
          screenName: screen.name,
          availableSeatsCount: show.showSeats.length,
        }))
      );

      // Sort shows chronologically for this theater
      allShows.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

      return {
        theaterId: t.id,
        theaterName: t.name,
        location: t.location,
        shows: allShows,
      };
    });

    return {
      movie,
      theaters: theaterSchedules,
    };
  } catch (error) {
    console.error('Failed to get movie showtimes:', error);
    return null;
  }
}