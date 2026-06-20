# CineVault 🎬🎟️

> **Next-Generation High-Concurrency Movie Ticket Booking Platform**  
> Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, and Redis-backed Distributed Locking.

---

## 🌟 Key Features

* **Multi-City Showtime Discovery:** City switcher with URL parameter sync, filtering multiplex showtimes across cities in real time.
* **Tiered Interactive Seating Matrix:** Screen layout supporting **Classic**, **Prime**, and **Recliner** seat tiers with responsive SVG cinema curves.
* **Distributed Seat Locking (Redis):** High-concurrency seat protection with a 10-minute hold TTL (`SET NX EX`) to prevent race conditions and double bookings.
* **F&B Upsell & Dynamic Checkout:** Integrated Food & Beverages catalog with real-time tax (GST), convenience fee calculations, and live hold timers.
* **Digital QR Boarding Passes:** High-resolution digital ticket vouchers generated on booking completion with QR code verification and print support.
* **Customer Dashboard:** Historical booking log with real-time status badges (`CONFIRMED`, `PENDING`, `CANCELLED`).

---

## 🏗️ System Architecture & Concurrency Model