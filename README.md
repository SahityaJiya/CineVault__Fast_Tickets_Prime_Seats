<div align="center">

  <h1>🎬 CineVault</h1>
  <h3>⚡ Fast Tickets. Prime Seats. High-Concurrency Cinema Booking Engine</h3>

  <p>
    <em>“Because missing the premiere shouldn't happen just because the booking system couldn't handle the rush.”</em>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js%2015-App%20Router-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React%2019-TypeScript-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Prisma%20ORM-PostgreSQL-5a67d8?style=for-the-badge&logo=prisma" alt="Prisma" />
    <img src="https://img.shields.io/badge/Upstash-Redis%20Locks-red?style=for-the-badge&logo=redis" alt="Redis" />
    <img src="https://img.shields.io/badge/Tailwind%20CSS-Glassmorphic-38bdf8?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  </p>

  <p>
    <strong>Sub-Millisecond Distributed Locks</strong> &nbsp;•&nbsp;
    <strong>15-Minute Session Expiry Lifecycle</strong> &nbsp;•&nbsp;
    <strong>Atomic Concurrency Engine</strong> &nbsp;•&nbsp;
    <strong>Pay-at-Counter Verification & Pass</strong>
  </p>

  <p>
    📍 <em>Engineered with High-Throughput Distributed Architecture & Real-Time Geospatial Filtering</em>
  </p>

</div>

---

## 📑 Table of Contents
1. [Project Title & Team Details](#-project-title--team-details)
2. [Live Deployment & Demo](#-live-deployment--demo)
3. [Selected Theme & Problem Statement](#-selected-theme--problem-statement)
4. [Solution Overview](#-solution-overview)
5. [Concurrency Engine & Lock Lifecycle](#-concurrency-engine--lock-lifecycle)
6. [System Architecture Diagram](#-system-architecture-diagram)
7. [Technology Stack](#-technology-stack)
8. [Key Features & Highlights](#-key-features--highlights)
9. [Application Interface & Screenshots](#-application-interface--screenshots)
10. [Installation & Setup Guide](#-installation--setup-guide)
11. [Environment Variables](#-environment-variables)
12. [API & Server Actions Documentation](#-api--server-actions-documentation)
13. [Database Details & Schema](#-database-details--schema)
14. [Future Scope](#-future-scope)

---

## 👥 Project Title & Team Details

* **Project Title:** CineVault — Fast Tickets, Prime Seats & Atomic Reservation Engine
* **Repository:** https://github.com/RIITKAGARWAL/CineVault__Fast_Tickets_Prime_Seats

### 👥 Team Members

| Role | Member Name | Email Address | GitHub Profile |
| :--- | :--- | :--- | :--- |
| **👑 Team Lead / Full-Stack** | **Ritik Agarwal** | agarwalritik895@gmail.com | [@RIITKAGARWAL](https://github.com/RIITKAGARWAL) |
| **⚡ Core Engine Developer** | **Sahitya Jiya** | sahityajiya1523@gmail.com | [@SahityaJiya](https://github.com/SahityaJiya) |

---

## 🌐 Live Deployment & Demo

* **Production URL:** https://cine-vault-fast-tickets-prime-seats-pc9lxzccl-ritik-dev2.vercel.app/
* **GitHub Repository:** https://github.com/RIITKAGARWAL/CineVault__Fast_Tickets_Prime_Seats

---
## 🎯 Selected Theme & Problem Statement

* **Selected Theme:** Entertainment, Ticketing & High-Concurrency Systems
* **Problem Statement:** Real-Time Cinema Seat Locking, Collision Prevention & Counter Verification

### 🌐 Real-World Context
During blockbuster movie releases or festival rush windows, cinema booking systems experience massive traffic spikes. Multiple users often attempt to select and book the exact same high-demand prime seats simultaneously.

Without distributed atomic coordination, traditional booking platforms suffer from:
1. **Double-Booking Collisions:** Two users completing checkout for the same seat at the same second.
2. **Zombie Seat Holds:** Seats remaining permanently locked or frozen when a user abandons checkout or closes the browser tab.
3. **Counter Sync Lag:** Disconnect between online reservations and physical theater counter pickup verification.

### 💡 The Core Mission
Build a robust, full-stack Next.js web application that enforces **zero double-booking** through Redis distributed locks and atomic PostgreSQL transactions, manages a **strictly enforced 15-minute checkout window with automatic fallback release**, and provides seamless **pay-at-counter verification codes** and downloadable digital passes.

---

## 🚀 Solution Overview

CineVault transforms the cinema reservation experience into an instant, collision-free pipeline:

* **Distributed In-Memory Lock Matrix:** Employs Upstash Redis distributed key locks with automatic TTLs (`lock:show:{showId}:seat:{seatId}`) to prevent race conditions during real-time seat selection.
* **Atomic Concurrency Transactions:** Prisma interactive transactions verify that no seat has transitioned to `BOOKED` before creating booking records, throwing strict validation responses (`"the seat is already booked select any other seat."`).
* **15-Minute Dynamic Expiry Engine:** Persistent session-based checkout countdown timer that auto-cancels abandoned transactions and releases locks back to the public pool without freezing inventory.
* **Pay-at-Counter Booking (Act 1 & Act 2):** Generates unique verification tokens (`CV-XXXXXX`) that customers present at the counter, paired with a print-ready entry receipt pass.
* **Multi-City Geolocation Engine:** Dual-mode location detection combining HTML5 Geolocation API with fast IP reverse-geocoding fallback across major cinema metro hubs.
* **Cinema Concession Combos (F&B):** Integrated food and beverage ordering module calculating live taxes, convenience fees, and integrated GST.

---

## 🔒 Concurrency Engine & Lock Lifecycle

CineVault handles seat reservation collisions through a 3-stage validation pipeline:

```
[ User Selects Seat ]
        │
        ▼
[ Check Redis Lock: lock:show:{id}:seat:{id} ]
        ├── If Locked by Other ──► Return "Seat is currently on hold"
        └── If Free ────────────► Set 15-Minute Redis Hold (TTL: 900s)
                                              │
                                              ▼
                                 [ User Enters Checkout ]
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
         [ 15-Minute Timeout / Cancel ]                      [ Click "Pay at Counter" ]
                    │                                                   │
                    ▼                                                   ▼
     [ Del Redis Lock & Release ]                         [ Prisma Atomic Transaction ]
     [ Flash: "transection got canceled..." ]             ├── 1. Re-check: Any Seat Status == BOOKED?
                                                          │      └── YES: Throw "the seat is already booked..."
                                                          ├── 2. Upsert User by Email
                                                          ├── 3. Create Booking Record with Token
                                                          ├── 4. Freeze Seats: Status = BOOKED
                                                          └── 5. Evict Redis Temporary Lock
                                                                        │
                                                                        ▼
                                                         [ Render Confirmation Pass ]
                                                         [ "CV-XXXXXX" Counter Code ]
```

---

## 🏗️ System Architecture Diagram

CineVault follows a decoupled modern Server Actions and distributed caching architecture:

```
[ Client Layer: Next.js 15 / React 19 / Tailwind CSS ]
                      │
                      ▼ (Server Actions / HTTPS)
[ Edge / Server Layer (Next.js App Router Server Components) ]
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
[ Upstash Redis Lock Cluster ]    [ Prisma ORM (Connection Pool) ]
  • TTL Key Locking (15m)           • Multi-Entity Relations
  • Real-Time Seat Matrix Hold      • Atomic $transaction Blocks
  • Non-blocking Del on Commit      • PostgreSQL Serverless (Neon Cloud)
                                    │
                                    ├──► [ Resend Email API Worker ]
                                    └──► [ QR Entry Code Generator ]
```

---

## 🛠️ Technology Stack

### Frontend
* **Framework:** Next.js 15 (App Router with Turbopack), React 19, TypeScript
* **Styling & Icons:** Tailwind CSS, Lucide React Icons
* **QR & Graphics:** `qrcode.react`, Next.js Edge `ImageResponse` for dynamic vector favicons

### Backend & Serverless
* **Runtime:** Node.js (v20+) with Next.js Server Actions
* **Database Client:** Prisma ORM with connection pooling & transaction retry logic
* **Caching & Distributed Locks:** Upstash Redis (`@upstash/redis` / `ioredis`)
* **Email Service:** Resend REST API integration for automated ticket dispatch

### Persistence & Cloud
* **Primary Database:** PostgreSQL (Hosted on Neon Cloud with SSL pooling)
* **Hosting Platform:** Netlify / Vercel Edge Network
* **Version Control:** Git & GitHub

---

## 🌟 Key Features & Highlights

### 1. Interactive Cinema Seat Matrix
* Grouped seating tiers: **Recliner (VIP)**, **Prime**, and **Classic**.
* **High-Visibility Booked State:** Booked seats feature distinct diagonal hazard stripes, bold `✕` markers, and crimson accent borders so occupied seats stand out immediately.

### 2. 15-Minute Enforced Checkout Session
* Live countdown timer initialized upon seat selection.
* Expiry timestamp persisted across browser tab reloads.
* Automatic lock eviction and redirection upon timer expiration.

### 3. Counter Payment Pass (Worksheet 3 Compliance)
* **Act 1:** Real-time on-screen counter code display with:  
  `"The seat is booked you can show/provide the below code at the counter to pay and get ticket."`
* **Act 2:** Downloadable digital receipt pass with:  
  `"Show this receipt at the counter to pay and get the ticket."`

### 4. Smart Geolocation City Hubs
* Detects user city via GPS coordinates.
* Instant fallback via IP geolocation if hardware GPS times out, automatically filtering theater listings to the user's nearest hub (e.g., Chandigarh, Delhi NCR, Mumbai, Bengaluru).

---

## 📸 Application Interface & Screenshots

<div align="center">

### 🎬 1. Movie Exploration & Dynamic City Selector
<img src="public/screenshots/home-page.jpeg" alt="CineVault Home Page" width="850" />
<p><em>Browse now-showing movies filtered by geolocation city hubs with format badges (IMAX, 4DX, 2D/3D).</em></p>

### 💺 2. Real-Time Interactive Seat Matrix & Legend
<img src="public/screenshots/seat-matrix.jpeg" alt="Seat Matrix with High Visibility Booked Seats" width="850" />
<p><em>Tiered cinema layout (Recliner, Prime, Classic) featuring high-contrast sold-out hazard striping and cross markers.</em></p>

### ⏱️ 3. Concession Stand (F&B) & 15-Minute Counter Checkout
<img src="public/screenshots/checkout-page.jpeg" alt="15-Minute Checkout and F&B Combos" width="850" />
<p><em>Persistent countdown transaction window with live GST, convenience fee, and single "Pay at Counter" action.</em></p>

### 🎟️ 4. Booking Confirmation Pass & Counter QR Code
<img src="public/screenshots/booking-confirmation.jpeg" alt="Booking Confirmation and Digital Receipt Pass" width="850" />
<p><em>Act 1 & Act 2 printable digital boarding pass displaying unique CV reference codes for theater counter verification.</em></p>

### 🎫 5. My Tickets & Verification History
<img src="public/screenshots/my-bookings.jpeg" alt="My Bookings Ticket History" width="850" />
<p><em>Searchable ticket pass vault showing verified movie entries, dates, showtimes, and scannable QR tokens.</em></p>

</div>

---

## 💻 Installation & Setup Guide

### Prerequisites
* **Node.js:** `v20.x` or later
* **Package Manager:** `npm` or `pnpm`
* **PostgreSQL Database:** Neon Cloud or local PostgreSQL instance
* **Redis Instance:** Upstash Redis or local Redis server

### 1. Clone the Repository
```bash
git clone https://github.com/RIITKAGARWAL/CineVault__Fast_Tickets_Prime_Seats.git
cd CineVault__Fast_Tickets_Prime_Seats
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

### 4. Database Setup & Migrations
```bash
# Push schema to database
npx prisma db push

# (Optional) Seed initial movies, theaters, screens, and seat layouts
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🔐 Environment Variables

The project requires the following environment variables. An example template is provided below:

```env
# PostgreSQL Database (Neon Serverless with Connection Pooling)
DATABASE_URL="postgresql://neondb_owner:password@ep-sample-pool.us-east-2.aws.neon.tech/neondb?sslmode=verify-full&connect_timeout=30&pool_timeout=30"

# Upstash Redis Distributed Cache & Lock Layer
REDIS_URL="rediss://default:your_redis_token@your-redis-instance.upstash.io:6379"

# Resend Email Service API Key
RESEND_API_KEY="re_sample_api_key_here"

# Application Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📡 API & Server Actions Documentation

CineVault executes all core business operations through Next.js Server Actions:

### 1. Booking Actions (`src/actions/bookings.ts`)

| Server Action | Parameters | Description |
| :--- | :--- | :--- |
| `finalizeBookingAction` | `{ showId, seatIds, totalAmount, customerEmail, userName }` | Executes atomic Prisma transaction to permanently freeze seats, create booking record, evict Redis locks, and trigger ticket email. |
| `getUserBookingsAction` | `email?: string` | Retrieves all confirmed bookings and entry passes for a given user email or session cookie. |

### 2. Seat Matrix & Locking Actions (`src/actions/locking.ts` & `src/actions/seats.ts`)

| Server Action | Parameters | Description |
| :--- | :--- | :--- |
| `getShowSeatMatrix` | `showId: string` | Fetches show metadata, theater/screen info, tier pricing, and real-time seat availability. |
| `lockSeatsAction` | `showId: string, seatIds: string[]` | Acquires 15-minute temporary Redis key holds for selected seats. |
| `unlockSeatsAction` | `showId: string, seatIds: string[]` | Evicts temporary Redis locks upon cancellation or timeout. |

### 3. Geolocation Actions (`src/actions/city.ts`)

| Server Action | Parameters | Description |
| :--- | :--- | :--- |
| `getSelectedCityAction` | `None` | Reads the currently active city slug from HTTP cookies. |
| `selectCityAction` | `slug: string` | Sets the user's active cinema city in cookies for filtered browsing. |

---

## 🗄️ Database Details & Schema

CineVault runs on a normalized PostgreSQL schema managed with Prisma ORM:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
}

enum SeatStatus {
  AVAILABLE
  LOCKED
  BOOKED
}

enum SeatTier {
  CLASSIC
  PRIME
  RECLINER
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  name         String
  passwordHash String
  bookings     Booking[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model City {
  id        String    @id @default(uuid())
  name      String
  slug      String    @unique
  theaters  Theater[]
}

model Theater {
  id        String   @id @default(uuid())
  name      String
  location  String
  cityId    String
  city      City     @relation(fields: [cityId], references: [id])
  screens   Screen[]
}

model Screen {
  id        String   @id @default(uuid())
  name      String
  theaterId String
  theater   Theater  @relation(fields: [theaterId], references: [id])
  shows     Show[]
  seats     Seat[]
}

model Movie {
  id          String   @id @default(uuid())
  title       String
  posterUrl   String
  genre       String[]
  durationMin Int
  format      String[]
  shows       Show[]
}

model Show {
  id        String     @id @default(uuid())
  movieId   String
  screenId  String
  startTime DateTime
  movie     Movie      @relation(fields: [movieId], references: [id])
  screen    Screen     @relation(fields: [screenId], references: [id])
  bookings  Booking[]
  showSeats ShowSeat[]
}

model ShowSeat {
  id        String     @id @default(uuid())
  showId    String
  seatId    String
  status    SeatStatus @default(AVAILABLE)
  show      Show       @relation(fields: [showId], references: [id])
  seat      Seat       @relation(fields: [seatId], references: [id])
  bookings  Booking[]
}

model Booking {
  id          String        @id @default(uuid())
  userId      String
  showId      String
  totalAmount Decimal       @db.Decimal(10, 2)
  status      BookingStatus @default(CONFIRMED)
  qrCodeToken String        @default(uuid())
  user        User          @relation(fields: [userId], references: [id])
  show        Show          @relation(fields: [showId], references: [id])
  showSeats   ShowSeat[]
  createdAt   DateTime      @default(now())
}
```

---

## 🖼️ Application Interface & Flow Previews

```
+------------------------------------------------------------------------------------+
|  CINEVAULT  [ Search Movies... ]                   📍 Chandigarh    [ My Tickets ] |
|------------------------------------------------------------------------------------|
|  [ NOW SHOWING ]                                                                   |
|  • Dune: Part Two (IMAX 2D)        • Oppenheimer (70mm)        • Kalki 2898 AD     |
+------------------------------------------------------------------------------------+
|                                                                                    |
|                           ALL EYES THIS WAY — SCREEN                               |
|                         -----------------------------                              |
|                                                                                    |
|   [A]  [01] [02] [03]  [ ✕ ] [ ✕ ]  [06] [07] [08]  (RECLINER SEATING - ₹450)      |
|   [B]  [01] [02] [03]  [04]  [05]   [06] [07] [08]  (PRIME SEATING    - ₹300)      |
|   [C]  [ ✕ ] [ ✕ ] [03]  [04]  [05]   [06] [07] [08]  (CLASSIC SEATING  - ₹200)      |
|                                                                                    |
|   Legend: [ ] Available   [■] Selected (Emerald)   [ ✕ ] Booked / Sold Out (Red)   |
|------------------------------------------------------------------------------------|
|  Selected: B3, B4 (2 Tickets) • Total: ₹670              [ Proceed to Checkout -> ]|
+------------------------------------------------------------------------------------+
```

### 🎟️ Booking Confirmation & Entry Pass (Act 1 & Act 2)

```
+------------------------------------------------------------------------------------+
|                               BOOKING CONFIRMED!                                   |
|                                                                                    |
|  [!] The seat is booked you can show/provide the below code at the counter to      |
|      pay and get ticket:                                                           |
|                                 >> CV-8A385C <<                                    |
|------------------------------------------------------------------------------------|
|  COUNTER PAYMENT RECEIPT PASS                                                      |
|  Movie: Oppenheimer                                  Reference: CV-8A385C          |
|  Cinema: PVR Elante Mall • Audi 1                    Format: IMAX 70mm             |
|  Date: 30 Aug • 10:00 AM                             Seats: C1, D1                 |
|  Amount Payable: ₹641                                Status: CONFIRMED             |
|                                                                                    |
|  🧾 Show this receipt at the counter to pay and get the ticket.                    |
|  [ QR CODE SCAN AT GATE ]                                                          |
+------------------------------------------------------------------------------------+
```

---

## 🔮 Future Scope

1. **WebSockets Seat Matrix Streaming:** Upgrade Redis polling to live bidirectional Socket.io/Ably channels to reflect seat lock changes across all connected clients in real-time.
2. **Dynamic Surge Pricing Algorithm:** Automated ticket pricing adjustments based on real-time booking velocity and remaining seat density.
3. **Interactive 3D Theater Previews:** Three.js / WebGL viewport allowing users to preview their perspective of the screen from any selected seat before locking.
4. **Offline PWA Ticket Wallet:** Service worker caching enabling users to display their QR counter passes and booking barcodes even without active mobile data.

---

<div align="center">
  <p>Built with ❤️ by <strong>Team CineVault</strong></p>
</div>
