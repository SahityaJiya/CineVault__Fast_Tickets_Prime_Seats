'use server';

import { prisma } from '@/lib/prisma';
import { ShowDetailsWithMatrix, MatrixSeat } from '@/types';
import { SeatTier, SeatStatus } from '@prisma/client';

export async function getShowSeatMatrix(showId: string): Promise<ShowDetailsWithMatrix | null> {
  try {
    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        movie: true,
        screen: {
          include: {
            theater: true,
            seats: {
              orderBy: [{ rowLabel: 'asc' }, { seatNumber: 'asc' }],
            },
          },
        },
        showSeats: {
          include: {
            seat: true,
          },
          orderBy: [
            { seat: { rowLabel: 'asc' } },
            { seat: { seatNumber: 'asc' } },
          ],
        },
      },
    });

    if (!show) return null;

    // Group materialized ShowSeats by their row label
    const seatsByRow: Record<string, { tier: SeatTier; seats: MatrixSeat[] }> = {};
    const tierPricing: Record<SeatTier, number> = {
      CLASSIC: Number(show.basePrice),
      PRIME: Number(show.basePrice) * 1.4,
      RECLINER: Number(show.basePrice) * 2.4,
    };

    for (const ss of show.showSeats) {
      const row = ss.seat.rowLabel;
      if (!seatsByRow[row]) {
        seatsByRow[row] = {
          tier: ss.seat.tier,
          seats: [],
        };
      }

      tierPricing[ss.seat.tier] = Number(ss.price);

      seatsByRow[row].seats.push({
        id: ss.id,
        seatId: ss.seatId,
        rowLabel: ss.seat.rowLabel,
        seatNumber: ss.seat.seatNumber,
        tier: ss.seat.tier,
        price: Number(ss.price),
        status: ss.status,
      });
    }

    return {
      showId: show.id,
      movieTitle: show.movie.title,
      moviePosterUrl: show.movie.posterUrl,
      movieFormat: show.movie.format,
      theaterName: show.screen.theater.name,
      screenName: show.screen.name,
      location: show.screen.theater.location,
      startTime: show.startTime,
      totalRows: show.screen.totalRows,
      totalCols: show.screen.totalCols,
      seatsByRow,
      tierPricing,
    };
  } catch (error) {
    console.error('Failed to get seat matrix:', error);
    return null;
  }
}