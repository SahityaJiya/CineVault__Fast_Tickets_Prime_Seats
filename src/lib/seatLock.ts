import { redis } from './redis';
import { prisma } from './prisma';
import { SeatStatus } from '@prisma/client';

const LOCK_TTL_SECONDS = 600; // 10 minutes temporary hold

export interface LockResult {
  success: boolean;
  lockedSeatIds: string[];
  failedSeatId?: string;
  error?: string;
}

/**
 * Attempts to atomically lock an array of show seats for a specific user session in Redis & Postgres
 */
export async function acquireSeatLocks(
  showId: string,
  showSeatIds: string[],
  userId: string
): Promise<LockResult> {
  const acquiredKeys: string[] = [];

  try {
    for (const seatId of showSeatIds) {
      const lockKey = `lock:show:${showId}:seat:${seatId}`;
      
      // SET key value NX EX (Only set if not exists, with 600s TTL)
      const result = await redis.set(lockKey, userId, 'EX', LOCK_TTL_SECONDS, 'NX');

      if (result === 'OK') {
        acquiredKeys.push(lockKey);
      } else {
        // Rollback already acquired locks in this batch to maintain atomicity
        if (acquiredKeys.length > 0) {
          await redis.del(...acquiredKeys);
        }
        return {
          success: false,
          lockedSeatIds: [],
          failedSeatId: seatId,
          error: 'One or more selected seats were just reserved by another user. Please choose different seats.',
        };
      }
    }

    // Update database status to LOCKED
    await prisma.showSeat.updateMany({
      where: {
        id: { in: showSeatIds },
        showId,
      },
      data: {
        status: SeatStatus.LOCKED,
      },
    });

    return {
      success: true,
      lockedSeatIds: showSeatIds,
    };
  } catch (error) {
    if (acquiredKeys.length > 0) {
      await redis.del(...acquiredKeys);
    }
    console.error('Distributed Lock Acquisition Error:', error);
    return {
      success: false,
      lockedSeatIds: [],
      error: 'Concurrency lock failed due to an internal system error.',
    };
  }
}

/**
 * Releases seats locked by a specific user session
 */
export async function releaseSeatLocks(
  showId: string,
  showSeatIds: string[],
  userId: string
): Promise<boolean> {
  try {
    for (const seatId of showSeatIds) {
      const lockKey = `lock:show:${showId}:seat:${seatId}`;
      const currentHolder = await redis.get(lockKey);

      if (currentHolder === userId) {
        await redis.del(lockKey);
      }
    }

    // Revert status to AVAILABLE in DB if not already BOOKED
    await prisma.showSeat.updateMany({
      where: {
        id: { in: showSeatIds },
        showId,
        status: SeatStatus.LOCKED,
      },
      data: {
        status: SeatStatus.AVAILABLE,
      },
    });

    return true;
  } catch (error) {
    console.error('Seat Lock Release Error:', error);
    return false;
  }
}