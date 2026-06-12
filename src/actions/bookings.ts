'use server';

import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { BookingStatus, SeatStatus } from '@prisma/client';

export interface FinalizeBookingParams {
  showId: string;
  seatIds: string[];
  totalAmount: number;
  customerEmail: string;
}

export interface BookingReceipt {
  bookingId: string;
  bookingRef: string;
  movieTitle: string;
  moviePoster: string;
  format: string[];
  theaterName: string;
  screenName: string;
  location: string;
  startTime: Date;
  seats: string[];
  totalAmount: number;
}

export async function finalizeBookingAction(
  params: FinalizeBookingParams
): Promise<BookingReceipt | null> {
  try {
    const { showId, seatIds, totalAmount, customerEmail } = params;

    let user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!user) {
      user = await prisma.user.findFirst();
    }

    if (!user) {
      throw new Error('No valid user found to associate booking.');
    }

    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        movie: true,
        screen: {
          include: { theater: true },
        },
        showSeats: {
          where: seatIds.length > 0 ? { id: { in: seatIds } } : undefined,
          include: { seat: true },
        },
      },
    });

    if (!show) throw new Error('Show not found');

    // Atomic transaction: Create booking, connect showSeats, and update seat status
    const booking = await prisma.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          userId: user.id,
          showId: show.id,
          totalAmount,
          status: BookingStatus.CONFIRMED,
          showSeats: {
            connect: show.showSeats.map((ss) => ({ id: ss.id })),
          },
        },
      });

      if (seatIds.length > 0) {
        await tx.showSeat.updateMany({
          where: { id: { in: seatIds } },
          data: { status: SeatStatus.BOOKED },
        });
      }

      return createdBooking;
    });

    // Cleanup active Redis locks
    for (const seatId of seatIds) {
      await redis.del(`lock:show:${showId}:seat:${seatId}`);
    }

    return {
      bookingId: booking.id,
      bookingRef: `CV-${booking.qrCodeToken.substring(0, 6).toUpperCase()}`,
      movieTitle: show.movie.title,
      moviePoster: show.movie.posterUrl,
      format: show.movie.format,
      theaterName: show.screen.theater.name,
      screenName: show.screen.name,
      location: show.screen.theater.location,
      startTime: show.startTime,
      seats: show.showSeats.map((ss) => `${ss.seat.rowLabel}${ss.seat.seatNumber}`),
      totalAmount,
    };
  } catch (error) {
    console.error('Finalize Booking Error:', error);
    return null;
  }
}

export interface UserBookingHistoryItem {
  id: string;
  bookingRef: string;
  status: BookingStatus;
  totalAmount: number;
  createdAt: Date;
  movieTitle: string;
  moviePoster: string;
  format: string[];
  theaterName: string;
  screenName: string;
  location: string;
  startTime: Date;
  seats: string[];
}

export async function getUserBookingsAction(
  email: string = 'alex@cinevault.io'
): Promise<UserBookingHistoryItem[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return [];

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        show: {
          include: {
            movie: true,
            screen: {
              include: { theater: true },
            },
          },
        },
        showSeats: {
          include: { seat: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map((b) => ({
      id: b.id,
      bookingRef: `CV-${b.qrCodeToken.substring(0, 6).toUpperCase()}`,
      status: b.status,
      totalAmount: Number(b.totalAmount),
      createdAt: b.createdAt,
      movieTitle: b.show.movie.title,
      moviePoster: b.show.movie.posterUrl,
      format: b.show.movie.format,
      theaterName: b.show.screen.theater.name,
      screenName: b.show.screen.name,
      location: b.show.screen.theater.location,
      startTime: b.show.startTime,
      seats: b.showSeats.map((ss) => `${ss.seat.rowLabel}${ss.seat.seatNumber}`),
    }));
  } catch (error) {
    console.error('Failed to get user bookings:', error);
    return [];
  }
}