import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { SeatStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const lockedSeats = await prisma.showSeat.findMany({
      where: { status: SeatStatus.LOCKED },
      select: {
        id: true,
        showId: true,
      },
    });

    let unlockedCount = 0;

    for (const showSeat of lockedSeats) {
      const lockKey = `lock:show:${showSeat.showId}:seat:${showSeat.id}`;
      const lockExists = await redis.exists(lockKey);

      if (!lockExists) {
        await prisma.showSeat.update({
          where: { id: showSeat.id },
          data: { status: SeatStatus.AVAILABLE },
        });
        unlockedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      scanned: lockedSeats.length,
      released: unlockedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Lock cleanup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run cleanup worker' },
      { status: 500 }
    );
  }
}