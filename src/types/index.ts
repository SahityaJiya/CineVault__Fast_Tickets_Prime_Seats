import { SeatTier, SeatStatus } from '@prisma/client';

export interface CityOption {
  id: string;
  name: string;
  slug: string;
  theaterCount: number;
}

export interface MovieCardData {
  id: string;
  title: string;
  slug: string;
  description: string;
  durationMin: number;
  language: string;
  format: string[];
  genre: string[];
  posterUrl: string;
  releaseDate: Date;
}

export interface ShowSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  basePrice: number;
  screenName: string;
  availableSeatsCount: number;
}

export interface TheaterShowSchedule {
  theaterId: string;
  theaterName: string;
  location: string;
  shows: ShowSlot[];
}

export interface MovieDetailsWithShows {
  movie: MovieCardData;
  theaters: TheaterShowSchedule[];
}