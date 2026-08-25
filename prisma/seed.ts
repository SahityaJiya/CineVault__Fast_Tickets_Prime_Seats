import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import { neon } from '@neondatabase/serverless';
import { randomUUID } from 'node:crypto';

const connectionString =
  'postgresql://neondb_owner:npg_aFjmE4g1NBqH@ep-polished-tree-axl1tj4x.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(connectionString);

async function main() {
  console.log('--- STEP 1/6: Truncating database tables ---');
  await sql`TRUNCATE TABLE "ShowSeat", "Booking", "Show", "Seat", "Screen", "Theater", "City", "Movie" RESTART IDENTITY CASCADE;`;
  console.log('✔ Tables truncated successfully.');

  console.log('\n--- STEP 2/6: Inserting Cities ---');
  const cities = [
    { id: randomUUID(), name: 'Chandigarh', slug: 'chandigarh' },
    { id: randomUUID(), name: 'Bhopal', slug: 'bhopal' },
    { id: randomUUID(), name: 'Mumbai', slug: 'mumbai' },
    { id: randomUUID(), name: 'Delhi-NCR', slug: 'delhi-ncr' },
    { id: randomUUID(), name: 'Bengaluru', slug: 'bengaluru' },
    { id: randomUUID(), name: 'Hyderabad', slug: 'hyderabad' },
    { id: randomUUID(), name: 'Pune', slug: 'pune' },
    { id: randomUUID(), name: 'Kolkata', slug: 'kolkata' },
    { id: randomUUID(), name: 'Chennai', slug: 'chennai' },
    { id: randomUUID(), name: 'Indore', slug: 'indore' },
    { id: randomUUID(), name: 'Jaipur', slug: 'jaipur' },
  ];

  for (const c of cities) {
    await sql`INSERT INTO "City" ("id", "name", "slug") VALUES (${c.id}, ${c.name}, ${c.slug});`;
  }
  console.log(`✔ Inserted ${cities.length} cities.`);

  console.log('\n--- STEP 3/6: Inserting Movies ---');
  const movies = [
    {
      id: randomUUID(),
      title: 'Dune: Part Two',
      slug: 'dune-part-two',
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge.',
      durationMin: 166,
      language: 'English',
      genre: ['Sci-Fi', 'Adventure', 'Action'],
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
      releaseDate: new Date('2024-03-01'),
      format: ['IMAX 2D', '4DX', 'Dolby Atmos'],
    },
    {
      id: randomUUID(),
      title: 'Oppenheimer',
      slug: 'oppenheimer',
      description: 'The story of American scientist J. Robert Oppenheimer and the atomic bomb.',
      durationMin: 180,
      language: 'English',
      genre: ['Biography', 'Drama', 'History'],
      posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
      releaseDate: new Date('2023-07-21'),
      format: ['IMAX 70mm', 'Dolby Atmos'],
    },
    {
      id: randomUUID(),
      title: 'Kalki 2898 AD',
      slug: 'kalki-2898-ad',
      description: 'A modern-day avatar of Vishnu descends to protect the world.',
      durationMin: 181,
      language: 'Hindi',
      genre: ['Action', 'Sci-Fi', 'Fantasy'],
      posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=kQDd1AhGIHk',
      releaseDate: new Date('2024-06-27'),
      format: ['3D', 'IMAX 3D', '2D'],
    },
    {
      id: randomUUID(),
      title: 'Stree 2: Sarkate Ka Aatank',
      slug: 'stree-2',
      description: 'The town of Chanderi is haunted again by a terrifying entity.',
      durationMin: 147,
      language: 'Hindi',
      genre: ['Comedy', 'Horror'],
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=KVnhe3n8oYk',
      releaseDate: new Date('2024-08-15'),
      format: ['2D', 'Dolby Atmos'],
    },
    {
      id: randomUUID(),
      title: 'Interstellar (Re-Release)',
      slug: 'interstellar',
      description: 'Explorers travel through a wormhole in space to ensure survival.',
      durationMin: 169,
      language: 'English',
      genre: ['Adventure', 'Drama', 'Sci-Fi'],
      posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
      releaseDate: new Date('2024-09-01'),
      format: ['IMAX 2D', 'Laser 4K'],
    },
  ];

  for (const m of movies) {
    await sql`
      INSERT INTO "Movie" ("id", "title", "slug", "description", "durationMin", "language", "genre", "posterUrl", "trailerUrl", "releaseDate", "format")
      VALUES (${m.id}, ${m.title}, ${m.slug}, ${m.description}, ${m.durationMin}, ${m.language}, ${m.genre}, ${m.posterUrl}, ${m.trailerUrl}, ${m.releaseDate}, ${m.format});
    `;
  }
  console.log(`✔ Inserted ${movies.length} movies.`);

  console.log('\n--- STEP 4/6: Inserting Theaters & Screens ---');
  const cityTheatersMap: Record<string, string[]> = {
    chandigarh: ['PVR Elante Mall, Phase 1', 'Cinepolis Jagat Mall, Sec 17'],
    bhopal: ['PVR DB City Mall, MP Nagar', 'INOX Aashima Mall'],
    mumbai: ['PVR ICON Phoenix Palladium', 'INOX Megaplex Inorbit'],
    'delhi-ncr': ['PVR Director’s Cut Vasant Kunj', 'PVR Superplex Logix Noida'],
    bengaluru: ['PVR Vega City IMAX', 'INOX Forum Mall Koramangala'],
    hyderabad: ['Prasads IMAX Multiplex', 'AMB Cinemas Gachibowli'],
    pune: ['PVR Phoenix Marketcity', 'Cinepolis Seasons Mall'],
    kolkata: ['INOX South City Mall', 'PVR Mani Square'],
    chennai: ['SPI Escape Express Avenue', 'PVR VR Chennai'],
    indore: ['PVR Treasure Island', 'INOX C21 Mall'],
    jaipur: ['INOX GT Central Mall', 'Raj Mandir Cinema'],
  };

  const screens: { id: string; theaterId: string }[] = [];

  for (const city of cities) {
    const theaterNames = cityTheatersMap[city.slug] || [
      `PVR Grand Mall, ${city.name}`,
      `INOX City Center, ${city.name}`,
    ];

    for (const tName of theaterNames) {
      const theaterId = randomUUID();
      await sql`
        INSERT INTO "Theater" ("id", "name", "cityId", "location")
        VALUES (${theaterId}, ${tName}, ${city.id}, ${city.name + ' Cinema Hub'});
      `;

      const screenId = randomUUID();
      await sql`
        INSERT INTO "Screen" ("id", "name", "theaterId", "totalRows", "totalCols")
        VALUES (${screenId}, 'Audi 1 (Dolby Atmos)', ${theaterId}, 4, 10);
      `;
      screens.push({ id: screenId, theaterId });
    }
  }
  console.log(`✔ Inserted ${screens.length} theaters and screens.`);

  console.log('\n--- STEP 5/6: Discovering Enums & Inserting Seats ---');
  const seatTierEnums = await sql`
    SELECT enumlabel FROM pg_enum 
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
    WHERE pg_type.typname = 'SeatTier' 
    ORDER BY enumsortorder;
  `;
  
  const statusEnums = await sql`
    SELECT enumlabel FROM pg_enum 
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
    WHERE pg_type.typname = 'SeatStatus' 
    ORDER BY enumsortorder;
  `;

  const availableTiers = seatTierEnums.map((r: any) => r.enumlabel);
  const availableStatus =
    statusEnums.find((r: any) => r.enumlabel.toUpperCase().includes('AVAIL'))?.enumlabel ||
    statusEnums[0]?.enumlabel ||
    'AVAILABLE';

  const tierClassic = availableTiers.find((t: string) => t === 'CLASSIC') || availableTiers[0];
  const tierPrime = availableTiers.find((t: string) => t === 'PRIME') || availableTiers[1] || tierClassic;
  const tierRecliner = availableTiers.find((t: string) => t === 'RECLINER') || availableTiers[2] || tierPrime;

  const rows = [
    { label: 'A', tier: tierClassic, price: 220 },
    { label: 'B', tier: tierClassic, price: 220 },
    { label: 'C', tier: tierPrime, price: 340 },
    { label: 'D', tier: tierRecliner, price: 550 },
  ];

  const allSeats: { id: string; screenId: string; tier: string; price: number }[] = [];
  const seatValues: string[] = [];

  for (const scr of screens) {
    for (const r of rows) {
      for (let seatNo = 1; seatNo <= 10; seatNo++) {
        const seatId = randomUUID();
        seatValues.push(`('${seatId}', '${scr.id}', '${r.label}', ${seatNo}, '${r.tier}'::"SeatTier")`);
        allSeats.push({ id: seatId, screenId: scr.id, tier: r.tier, price: r.price });
      }
    }
  }

  // Insert all 880 seats in one fast batch
  await sql.query(`INSERT INTO "Seat" ("id", "screenId", "rowLabel", "seatNumber", "tier") VALUES ${seatValues.join(', ')};`);
  console.log(`✔ Inserted ${allSeats.length} seats.`);

  console.log('\n--- STEP 6/6: Fast Bulk-Inserting Shows & ShowSeats ---');
  const now = new Date();
  const showValues: string[] = [];
  const showSeatValues: string[] = [];
  let totalShows = 0;

  // Schedules across today + next 6 days (7 days total)
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
    const showHours = [10, 13, 16, 19, 22];

    for (const scr of screens) {
      const screenSeats = allSeats.filter((s) => s.screenId === scr.id);

      for (let mIdx = 0; mIdx < movies.length; mIdx++) {
        const movie = movies[mIdx];
        const hour = showHours[(mIdx + dayOffset) % showHours.length];
        
        const startTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), hour, 0);
        const endTime = new Date(startTime.getTime() + movie.durationMin * 60000);
        const showId = randomUUID();

        showValues.push(
          `('${showId}', '${movie.id}', '${scr.id}', '${startTime.toISOString()}', '${endTime.toISOString()}', 250)`
        );
        totalShows++;

        for (const seat of screenSeats) {
          showSeatValues.push(
            `('${randomUUID()}', '${showId}', '${seat.id}', '${availableStatus}'::"SeatStatus", ${seat.price})`
          );
        }
      }
    }
  }

  // 1. Bulk insert all Shows in one single query
  console.log(`Bulk inserting ${showValues.length} shows...`);
  await sql.query(
    `INSERT INTO "Show" ("id", "movieId", "screenId", "startTime", "endTime", "basePrice") VALUES ${showValues.join(', ')};`
  );

  // 2. Bulk insert ShowSeats in chunks of 5,000 to keep HTTP payloads optimal
  console.log(`Bulk inserting ${showSeatValues.length} show seats in fast chunks...`);
  const CHUNK_SIZE = 5000;
  for (let i = 0; i < showSeatValues.length; i += CHUNK_SIZE) {
    const chunk = showSeatValues.slice(i, i + CHUNK_SIZE);
    await sql.query(
      `INSERT INTO "ShowSeat" ("id", "showId", "seatId", "status", "price") VALUES ${chunk.join(', ')};`
    );
    process.stdout.write(`✔ Saved ${Math.min(i + CHUNK_SIZE, showSeatValues.length)} / ${showSeatValues.length} seats\r`);
  }

  console.log(`\n\n🎉 DATABASE SEEDED SUCCESSFULLY IN SECONDS!`);
  console.log(`Summary: ${cities.length} Cities, ${screens.length} Theaters, ${movies.length} Movies, ${totalShows} Shows.`);
}

main().catch((e) => {
  console.error('\nSeed Error:', e);
  process.exit(1);
});