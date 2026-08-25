import { PrismaClient, Role, SeatTier, SeatStatus } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as dotenv from 'dotenv';

dotenv.config();

// Configure WebSocket for serverless connection
neonConfig.webSocketConstructor = ws;

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_aFjmE4g1NBqH@ep-polished-tree-axl1tj4x-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding CineVault database via Neon Serverless Adapter...');

  // 1. Seed Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cinevault.io' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@cinevault.io',
      role: Role.ADMIN,
      passwordHash: '$2b$10$EpIe0D9b67T8pS9d8hU8me8a5pZ.m7L.3nJgR5xP1sL1t6k2b4k5i',
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'ritik@cinevault.io' },
    update: {},
    create: {
      name: 'Ritik Agarwal',
      email: 'ritik@cinevault.io',
      role: Role.CUSTOMER,
      passwordHash: '$2b$10$EpIe0D9b67T8pS9d8hU8me8a5pZ.m7L.3nJgR5xP1sL1t6k2b4k5i',
    },
  });

  console.log('✓ Seeded users:', adminUser.name, demoUser.name);

  // 2. Seed Cities
  const mumbai = await prisma.city.upsert({
    where: { slug: 'mumbai' },
    update: {},
    create: { name: 'Mumbai', slug: 'mumbai' },
  });

  const delhi = await prisma.city.upsert({
    where: { slug: 'delhi-ncr' },
    update: {},
    create: { name: 'Delhi NCR', slug: 'delhi-ncr' },
  });

  const bengaluru = await prisma.city.upsert({
    where: { slug: 'bengaluru' },
    update: {},
    create: { name: 'Bengaluru', slug: 'bengaluru' },
  });

  console.log('✓ Seeded cities: Mumbai, Delhi NCR, Bengaluru');

  // 3. Seed Movies
  const dune = await prisma.movie.upsert({
    where: { slug: 'dune-part-three' },
    update: {},
    create: {
      title: 'Dune: Part Three',
      slug: 'dune-part-three',
      description: 'Paul Atreides continues his mythic journey as he unifies the Fremen and wages war across the cosmos.',
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop',
      genre: ['Sci-Fi', 'Adventure', 'Drama'],
      durationMins: 165,
      language: 'English',
      format: ['2D', 'IMAX', '4DX'],
      releaseDate: new Date('2026-03-15'),
      rating: 9.1,
    },
  });

  const avatar = await prisma.movie.upsert({
    where: { slug: 'avatar-fire-and-ash' },
    update: {},
    create: {
      title: 'Avatar: Fire and Ash',
      slug: 'avatar-fire-and-ash',
      description: 'Jake Sully and Neytiri encounter a hostile and aggressive volcanic tribe of Na’vi known as the Ash People.',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop',
      genre: ['Action', 'Sci-Fi', 'Fantasy'],
      durationMins: 190,
      language: 'English',
      format: ['3D', 'IMAX 3D'],
      releaseDate: new Date('2025-12-19'),
      rating: 8.8,
    },
  });

  const interstellar = await prisma.movie.upsert({
    where: { slug: 'interstellar-re-release' },
    update: {},
    create: {
      title: 'Interstellar: 12th Anniversary Re-Release',
      slug: 'interstellar-re-release',
      description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity’s survival.',
      posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2000&auto=format&fit=crop',
      genre: ['Sci-Fi', 'Drama'],
      durationMins: 169,
      language: 'English',
      format: ['IMAX 70MM', '4DX'],
      releaseDate: new Date('2026-05-10'),
      rating: 9.4,
    },
  });

  console.log('✓ Seeded movies');

  // 4. Seed Theaters & Screens
  let pvrMumbai = await prisma.theater.findFirst({ where: { name: 'PVR ICON: Phoenix Palladium' } });
  if (!pvrMumbai) {
    pvrMumbai = await prisma.theater.create({
      data: {
        name: 'PVR ICON: Phoenix Palladium',
        location: 'Lower Parel, Mumbai',
        cityId: mumbai.id,
      },
    });
  }

  let inoxDelhi = await prisma.theater.findFirst({ where: { name: 'INOX Megaplex: Mall of India' } });
  if (!inoxDelhi) {
    inoxDelhi = await prisma.theater.create({
      data: {
        name: 'INOX Megaplex: Mall of India',
        location: 'Sector 18, Noida, Delhi NCR',
        cityId: delhi.id,
      },
    });
  }

  let cinepolisBlr = await prisma.theater.findFirst({ where: { name: 'Cinépolis: Forum Shantiniketan' } });
  if (!cinepolisBlr) {
    cinepolisBlr = await prisma.theater.create({
      data: {
        name: 'Cinépolis: Forum Shantiniketan',
        location: 'Whitefield, Bengaluru',
        cityId: bengaluru.id,
      },
    });
  }

  let pvrScreen = await prisma.screen.findFirst({ where: { theaterId: pvrMumbai.id } });
  if (!pvrScreen) {
    pvrScreen = await prisma.screen.create({
      data: {
        name: 'Audi 2 (Dolby Atmos 4K)',
        theaterId: pvrMumbai.id,
      },
    });
  }

  let inoxScreen = await prisma.screen.findFirst({ where: { theaterId: inoxDelhi.id } });
  if (!inoxScreen) {
    inoxScreen = await prisma.screen.create({
      data: {
        name: 'Audi 1 (IMAX Laser)',
        theaterId: inoxDelhi.id,
      },
    });
  }

  let cinepolisScreen = await prisma.screen.findFirst({ where: { theaterId: cinepolisBlr.id } });
  if (!cinepolisScreen) {
    cinepolisScreen = await prisma.screen.create({
      data: {
        name: 'Audi 4 (4DX)',
        theaterId: cinepolisBlr.id,
      },
    });
  }

  console.log('✓ Seeded theaters and screens');

  // 5. Generate Seat Layouts
  async function generateSeatsForScreen(screenId: string) {
    const existingSeats = await prisma.seat.findMany({ where: { screenId } });
    if (existingSeats.length > 0) return existingSeats;

    const seatData: Array<{ screenId: string; rowLabel: string; seatNumber: number; tier: SeatTier }> = [];
    const rows = [
      { label: 'A', tier: SeatTier.CLASSIC },
      { label: 'B', tier: SeatTier.CLASSIC },
      { label: 'C', tier: SeatTier.PRIME },
      { label: 'D', tier: SeatTier.PRIME },
      { label: 'E', tier: SeatTier.PRIME },
      { label: 'F', tier: SeatTier.RECLINER },
    ];

    for (const r of rows) {
      for (let num = 1; num <= 10; num++) {
        seatData.push({
          screenId,
          rowLabel: r.label,
          seatNumber: num,
          tier: r.tier,
        });
      }
    }

    await prisma.seat.createMany({ data: seatData });
    return await prisma.seat.findMany({ where: { screenId } });
  }

  const pvrSeats = await generateSeatsForScreen(pvrScreen.id);
  const inoxSeats = await generateSeatsForScreen(inoxScreen.id);
  const cinepolisSeats = await generateSeatsForScreen(cinepolisScreen.id);

  console.log('✓ Generated 60 tiered seats per auditorium');

  // 6. Generate Shows & ShowSeats
  const dates = [
    new Date('2026-08-25T10:30:00Z'),
    new Date('2026-08-25T14:45:00Z'),
    new Date('2026-08-25T19:30:00Z'),
  ];

  async function createShowAndSeats(
    movieId: string,
    screenId: string,
    startTime: Date,
    seats: Array<{ id: string; tier: SeatTier }>
  ) {
    const existingShow = await prisma.show.findFirst({
      where: { movieId, screenId, startTime },
    });
    if (existingShow) return;

    const show = await prisma.show.create({
      data: {
        movieId,
        screenId,
        startTime,
        basePrice: 280,
      },
    });

    const showSeatData = seats.map((seat) => {
      let price = 280;
      if (seat.tier === SeatTier.PRIME) price = 380;
      if (seat.tier === SeatTier.RECLINER) price = 650;

      return {
        showId: show.id,
        seatId: seat.id,
        price,
        status: SeatStatus.AVAILABLE,
      };
    });

    await prisma.showSeat.createMany({ data: showSeatData });
  }

  for (const date of dates) {
    await createShowAndSeats(dune.id, pvrScreen.id, date, pvrSeats);
    await createShowAndSeats(avatar.id, inoxScreen.id, date, inoxSeats);
    await createShowAndSeats(interstellar.id, cinepolisScreen.id, date, cinepolisSeats);
  }

  console.log('✓ Generated shows and initialized show seats');
  console.log('🎉 CineVault database seed finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });