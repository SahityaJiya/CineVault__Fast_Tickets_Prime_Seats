'use server';

import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { ShowDetailsWithMatrix, MatrixSeat, CheckoutShowDetails } from '@/types';
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

    // Check Redis for active locks on any seats marked LOCKED in DB
    const lockedSeats = show.showSeats.filter((ss) => ss.status === SeatStatus.LOCKED);
    const expiredSeatIds: string[] = [];

    await Promise.all(
      lockedSeats.map(async (ss) => {
        const lockKey = `lock:show:${showId}:seat:${ss.id}`;
        const isLockedInRedis = await redis.exists(lockKey);
        if (!isLockedInRedis) {
          expiredSeatIds.push(ss.id);
          ss.status = SeatStatus.AVAILABLE;
        }
      })
    );

    // Lazily clean up expired locks in database
    if (expiredSeatIds.length > 0) {
      await prisma.showSeat.updateMany({
        where: { id: { in: expiredSeatIds } },
        data: { status: SeatStatus.AVAILABLE },
      });
    }

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

export async function getCheckoutDetails(
  showId: string,
  seatIds: string[]
): Promise<CheckoutShowDetails | null> {
  try {
    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        movie: true,
        screen: {
          include: {
            theater: true,
          },
        },
        showSeats: {
          where: {
            id: { in: seatIds },
          },
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

    if (!show || show.showSeats.length === 0) return null;

    return {
      showId: show.id,
      movieTitle: show.movie.title,
      moviePosterUrl: show.movie.posterUrl,
      theaterName: show.screen.theater.name,
      screenName: show.screen.name,
      location: show.screen.theater.location,
      startTime: show.startTime,
      selectedSeats: show.showSeats.map((ss) => ({
        id: ss.id,
        rowLabel: ss.seat.rowLabel,
        seatNumber: ss.seat.seatNumber,
        tier: ss.seat.tier,
        price: Number(ss.price),
      })),
    };
  } catch (error) {
    console.error('Failed to get checkout details:', error);
    return null;
  }
}