/**
 * Data access layer for the Bookings screens.
 *
 * Mirrors the contract of `dashboardService`: every function is `async`
 * and returns a `Promise`, so replacing the seed lookups with `fetch(...)`
 * later only changes these function bodies — no bookings UI needs rewriting.
 *
 * Kept separate from `dashboardService` so the Bookings feature owns its
 * own read path and can be developed independently of the Events work.
 * All figures derive from the seed data via `bookingCalculations`.
 */
import { bookings, events } from '../data/seed';
import type { BookingRow, BookingSummary } from '../types/bookings';
import { buildBookingRows, buildBookingSummary } from '../utils/bookingCalculations';

/** All bookings joined with their events, newest booking first. */
export async function getBookingRows(): Promise<BookingRow[]> {
  return buildBookingRows(bookings, events);
}

/** Headline figures for the bookings overview cards (all bookings). */
export async function getBookingSummary(): Promise<BookingSummary> {
  return buildBookingSummary(bookings);
}

/** The distinct events that have at least one booking, for the event filter. */
export async function getBookableEvents(): Promise<{ id: string; title: string }[]> {
  const eventIds = new Set(bookings.map((booking) => booking.eventId));
  return events
    .filter((event) => eventIds.has(event.id))
    .map((event) => ({ id: event.id, title: event.title }))
    .sort((a, b) => a.title.localeCompare(b.title));
}
