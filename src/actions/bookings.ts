'use server';

import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { BookingStatus, SeatStatus } from '@prisma/client';
import { cookies } from 'next/headers';

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

    const email = customerEmail.trim().toLowerCase();

    // Find or create user dynamically for this customer email
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: email.split('@')[0],
        passwordHash: 'GUEST_CHECKOUT_NO_PWD',
      },
    });

    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        movie: true,
        screen: {
          include: { theater: true },
        },
        showSeats: {
          where: {
            id: { in: seatIds },
          },
          include: { seat: true },
          orderBy: [
            { seat: { rowLabel: 'asc' } },
            { seat: { seatNumber: 'asc' } },
          ],
        },
      },
    });

    if (!show || show.showSeats.length === 0) {
      return null;
    }

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
  email?: string
): Promise<UserBookingHistoryItem[]> {
  try {
    let targetEmail = email?.trim().toLowerCase();

    if (!targetEmail) {
      const cookieStore = await cookies();
      targetEmail = cookieStore.get('user_email')?.value?.trim().toLowerCase();
    }

    // If an email is provided, fetch ONLY for that user.
    // If no email is provided, return empty list or look for matching user.
    if (!targetEmail) {
      return [];
    }

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!user) {
      return [];
    }

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