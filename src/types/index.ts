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

export interface MatrixSeat {
  id: string;          // ShowSeat ID
  seatId: string;      // Physical Seat ID
  rowLabel: string;
  seatNumber: number;
  tier: SeatTier;
  price: number;
  status: SeatStatus;
}

export interface ShowDetailsWithMatrix {
  showId: string;
  movieTitle: string;
  moviePosterUrl: string;
  movieFormat: string[];
  theaterName: string;
  screenName: string;
  location: string;
  startTime: Date;
  totalRows: number;
  totalCols: number;
  seatsByRow: Record<string, { tier: SeatTier; seats: MatrixSeat[] }>;
  tierPricing: Record<SeatTier, number>;
}

export interface FnBItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Combos' | 'Snacks' | 'Beverages';
  imageUrl: string;
}

export interface SelectedSeatDetails {
  id: string;
  rowLabel: string;
  seatNumber: number;
  tier: SeatTier;
  price: number;
}

export interface CheckoutShowDetails {
  showId: string;
  movieTitle: string;
  moviePosterUrl: string;
  theaterName: string;
  screenName: string;
  location: string;
  startTime: Date;
  selectedSeats: SelectedSeatDetails[];
}