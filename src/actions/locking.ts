'use server';

import { acquireSeatLocks, releaseSeatLocks, LockResult } from '@/lib/seatLock';

export async function lockSeatsAction(
  showId: string,
  showSeatIds: string[],
  sessionId: string
): Promise<LockResult> {
  if (!showSeatIds || showSeatIds.length === 0) {
    return { success: false, lockedSeatIds: [], error: 'No seats provided for lock.' };
  }

  return await acquireSeatLocks(showId, showSeatIds, sessionId);
}

export async function unlockSeatsAction(
  showId: string,
  showSeatIds: string[],
  sessionId: string
): Promise<{ success: boolean }> {
  const result = await releaseSeatLocks(showId, showSeatIds, sessionId);
  return { success: result };
}