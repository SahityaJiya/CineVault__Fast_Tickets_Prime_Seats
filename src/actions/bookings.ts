'use server';

import { sendTicketConfirmationEmail } from './email';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { BookingStatus, SeatStatus } from '@prisma/client';
import { cookies } from 'next/headers';

export interface FinalizeBookingParams {
  showId: string;
  seatIds: string[];
  totalAmount: number;
  customerEmail: string;
  userName?: string;
  userPhone?: string;
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
): Promise<{ success: boolean; data?: BookingReceipt; error?: string }> {
  try {
    const { showId, seatIds, totalAmount, customerEmail, userName } = params;
    const email = customerEmail.trim().toLowerCase();

    if (!showId || !seatIds || seatIds.length === 0) {
      return { success: false, error: 'No seats selected.' };
    }

    // Atomic transaction: verify collision & update statuses with extended timeouts
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Fetch show and requested showSeats
        const show = await tx.show.findUnique({
          where: { id: showId },
          include: {
            movie: true,
            screen: {
              include: { theater: true },
            },
            showSeats: {
              where: { id: { in: seatIds } },
              include: { seat: true },
              orderBy: [
                { seat: { rowLabel: 'asc' } },
                { seat: { seatNumber: 'asc' } },
              ],
            },
          },
        });

        if (!show || show.showSeats.length === 0) {
          throw new Error('Show or selected seats not found.');
        }

        // 2. Worksheet 3 Concurrency (Cases 2 & 3): Check if already booked
        const isAnySeatBooked = show.showSeats.some(
          (ss) => ss.status === SeatStatus.BOOKED
        );
        if (isAnySeatBooked) {
          throw new Error('the seat is already booked select any other seat.');
        }

        // 3. Find or create user
        const user = await tx.user.upsert({
          where: { email },
          update: {
            name: userName || email.split('@')[0],
          },
          create: {
            email,
            name: userName || email.split('@')[0],
            passwordHash: 'GUEST_CHECKOUT_NO_PWD',
          },
        });

        // 4. Create booking record
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

        // 5. Worksheet 3 (Case 1): Permanently freeze seats
        await tx.showSeat.updateMany({
          where: { id: { in: seatIds } },
          data: { status: SeatStatus.BOOKED },
        });

        return { createdBooking, show };
      },
      {
        maxWait: 15000, // 15 seconds to acquire a connection from the pool
        timeout: 20000, // 20 seconds total execution time before aborting
      }
    );

    // 6. Cleanup active Redis locks
    for (const seatId of seatIds) {
      try {
        await redis.del(`lock:show:${showId}:seat:${seatId}`);
      } catch (err) {
        // Fallback safely if Redis is offline
      }
    }

    const bookingRef = `CV-${result.createdBooking.qrCodeToken.substring(0, 6).toUpperCase()}`;
    const seatLabels = result.show.showSeats.map(
      (ss) => `${ss.seat.rowLabel}${ss.seat.seatNumber}`
    );

    // Trigger non-blocking confirmation email
    sendTicketConfirmationEmail({
      toEmail: email,
      bookingRef,
      movieTitle: result.show.movie.title,
      theaterName: result.show.screen.theater.name,
      screenName: result.show.screen.name,
      startTime: result.show.startTime,
      seats: seatLabels,
      totalAmount,
    }).catch((err) => console.warn('Email dispatch skipped/failed:', err));

    return {
      success: true,
      data: {
        bookingId: result.createdBooking.id,
        bookingRef,
        movieTitle: result.show.movie.title,
        moviePoster: result.show.movie.posterUrl,
        format: result.show.movie.format,
        theaterName: result.show.screen.theater.name,
        screenName: result.show.screen.name,
        location: result.show.screen.theater.location,
        startTime: result.show.startTime,
        seats: seatLabels,
        totalAmount,
      },
    };
  } catch (error: any) {
    console.error('Finalize Booking Error:', error);
    return {
      success: false,
      error: error?.message || 'the seat is already booked select any other seat.',
    };
  }
}

// Wrapper for checkout view compatibility
export async function createBookingAction(input: {
  showId: string;
  seatIds: string[];
  userName: string;
  userEmail: string;
  userPhone?: string;
  totalAmount: number;
}) {
  const res = await finalizeBookingAction({
    showId: input.showId,
    seatIds: input.seatIds,
    totalAmount: input.totalAmount,
    customerEmail: input.userEmail,
    userName: input.userName,
    userPhone: input.userPhone,
  });

  if (!res.success || !res.data) {
    return { success: false, error: res.error };
  }

  return {
    success: true,
    booking: {
      id: res.data.bookingId,
      bookingRef: res.data.bookingRef,
      totalAmount: res.data.totalAmount,
    },
  };
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