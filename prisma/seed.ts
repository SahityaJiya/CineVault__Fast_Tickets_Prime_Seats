import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, SeatTier, SeatStatus } from '@prisma/client';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/cinevault?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function cleanDatabase() {
  console.log('🧹 Cleaning existing database records...');
  // Delete in reverse dependency order to avoid foreign key violations
  await prisma.showSeat.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.show.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.screen.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.theater.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await cleanDatabase();

  console.log('🌱 Seeding CineVault database...');

  // 1. Seed Users (Admin & Customers)
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@cinevault.io',
      passwordHash: '$2b$10$ep/v8kG1Vb8Wz9Z0Q8eReu8H3/8vGvj5NkWc0XmG2.vCjO4dK9zS2', // Mock hashed
      role: Role.SUPER_ADMIN,
    },
  });

  const demoCustomer = await prisma.user.create({
    data: {
      name: 'Demo Moviegoer',
      email: 'alex@cinevault.io',
      passwordHash: '$2b$10$ep/v8kG1Vb8Wz9Z0Q8eReu8H3/8vGvj5NkWc0XmG2.vCjO4dK9zS2',
      phone: '+91 9876543210',
      role: Role.USER,
    },
  });

  console.log(`✓ Seeded users: ${adminUser.name}, ${demoCustomer.name}`);

  // 2. Seed Cities
  await Promise.all([
    prisma.city.create({ data: { name: 'Mumbai', slug: 'mumbai' } }),
    prisma.city.create({ data: { name: 'Delhi-NCR', slug: 'delhi-ncr' } }),
    prisma.city.create({ data: { name: 'Bengaluru', slug: 'bengaluru' } }),
  ]);

  const [mumbai, delhi, bengaluru] = await Promise.all([
    prisma.city.findUniqueOrThrow({ where: { slug: 'mumbai' } }),
    prisma.city.findUniqueOrThrow({ where: { slug: 'delhi-ncr' } }),
    prisma.city.findUniqueOrThrow({ where: { slug: 'bengaluru' } }),
  ]);

  console.log('✓ Seeded major metro cities');

  // 3. Seed Theaters & Screens
  const theaterData = [
    {
      name: 'PVR ICON: Phoenix Palladium',
      location: 'Lower Parel, Mumbai',
      cityId: mumbai.id,
      screens: [
        { name: 'Audi 1 (IMAX with Laser)', rows: 8, cols: 12 },
        { name: 'Audi 2 (Dolby Atmos 4K)', rows: 6, cols: 10 },
      ],
    },
    {
      name: 'INOX: Megaplex Inorbit',
      location: 'Malad West, Mumbai',
      cityId: mumbai.id,
      screens: [
        { name: 'Screen 1 (INSIGNIA Luxe)', rows: 5, cols: 8 },
      ],
    },
    {
      name: 'PVR Directors Cut: Ambience Mall',
      location: 'Vasant Kunj, New Delhi',
      cityId: delhi.id,
      screens: [
        { name: 'Grand Luxury Lounge 1', rows: 6, cols: 10 },
      ],
    },
    {
      name: 'Cinépolis: Forum Shantiniketan',
      location: 'Whitefield, Bengaluru',
      cityId: bengaluru.id,
      screens: [
        { name: 'Audi 1 (4DX Immersive)', rows: 7, cols: 10 },
      ],
    },
  ];

  const createdScreens = [];

  for (const t of theaterData) {
    const theater = await prisma.theater.create({
      data: {
        name: t.name,
        location: t.location,
        cityId: t.cityId,
      },
    });

    for (const s of t.screens) {
      const screen = await prisma.screen.create({
        data: {
          name: s.name,
          theaterId: theater.id,
          totalRows: s.rows,
          totalCols: s.cols,
        },
      });

      // Generate Physical Seats Layout (A-Z rows with Tier segregation)
      const seatData = [];
      const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];

      for (let r = 0; r < s.rows; r++) {
        const rowLabel = rowLabels[r];
        // Categorize seat tier by row depth
        let tier: SeatTier = SeatTier.CLASSIC;
        if (r >= Math.floor(s.rows * 0.7)) {
          tier = SeatTier.RECLINER;
        } else if (r >= Math.floor(s.rows * 0.35)) {
          tier = SeatTier.PRIME;
        }

        for (let col = 1; col <= s.cols; col++) {
          seatData.push({
            screenId: screen.id,
            rowLabel,
            seatNumber: col,
            tier,
          });
        }
      }

      await prisma.seat.createMany({ data: seatData });
      createdScreens.push(screen);
    }
  }

  console.log(`✓ Seeded ${theaterData.length} multiplexes with tiered seating matrices`);

  // 4. Seed Movies
  const movies = await Promise.all([
    prisma.movie.create({
      data: {
        title: 'Dune: Part Three',
        slug: 'dune-part-three',
        description: 'Paul Atreides continues his mythic journey as he unifies the Fremen and wages war against the Great Houses.',
        durationMin: 165,
        language: 'English',
        format: ['2D', 'IMAX', '4DX'],
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
        releaseDate: new Date('2026-03-15T00:00:00Z'),
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Cyberpunk: Neo-Tokyo 2099',
        slug: 'cyberpunk-neo-tokyo-2099',
        description: 'An augmented detective tracks a rogue artificial consciousness across a rain-soaked neon megalopolis.',
        durationMin: 142,
        language: 'English',
        format: ['2D', '3D', 'IMAX'],
        genre: ['Action', 'Sci-Fi', 'Thriller'],
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
        releaseDate: new Date('2026-04-01T00:00:00Z'),
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Silent Horizon',
        slug: 'the-silent-horizon',
        description: 'Deep ocean researchers uncover an ancient subterranean anomaly that alters gravitational physics.',
        durationMin: 130,
        language: 'Hindi',
        format: ['2D', 'Dolby Atmos'],
        genre: ['Mystery', 'Sci-Fi'],
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
        releaseDate: new Date('2026-04-10T00:00:00Z'),
      },
    }),
  ]);

  console.log(`✓ Seeded ${movies.length} blockbuster movies`);

  // 5. Seed Shows & Materialize Dynamic ShowSeats
  const showTimes = ['10:30', '14:15', '18:00', '21:45'];

  for (const screen of createdScreens) {
    const seats = await prisma.seat.findMany({ where: { screenId: screen.id } });

    for (const movie of movies) {
      for (const timeStr of showTimes) {
        const [hours, mins] = timeStr.split(':').map(Number);
        const startTime = new Date();
        startTime.setHours(hours, mins, 0, 0);
        startTime.setDate(startTime.getDate() + 1); // Tomorrow's shows

        const endTime = new Date(startTime.getTime() + movie.durationMin * 60 * 1000);

        const show = await prisma.show.create({
          data: {
            movieId: movie.id,
            screenId: screen.id,
            startTime,
            endTime,
            basePrice: 250.0,
          },
        });

        // Materialize ShowSeats with tier pricing multipliers
        const showSeatBatch = seats.map((seat) => {
          let price = 250.0;
          if (seat.tier === SeatTier.PRIME) price = 350.0;
          if (seat.tier === SeatTier.RECLINER) price = 600.0;

          return {
            showId: show.id,
            seatId: seat.id,
            status: SeatStatus.AVAILABLE,
            price,
          };
        });

        await prisma.showSeat.createMany({ data: showSeatBatch });
      }
    }
  }

  console.log('✓ Materialized dynamic showtimes & individual seat inventory');
  console.log('🚀 CineVault Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });