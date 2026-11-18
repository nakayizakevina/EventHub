/**
 * Pure business calculations for the Bookings screens.
 *
 * Every function is pure: data in, derived data out. Components never
 * compute booking figures or apply filter logic themselves — they call
 * these utilities (usually via `bookingService`) instead.
 *
 * ── Documented rules ────────────────────────────────────────────────────
 * 1. STATUS MAPPING: the domain `PaymentStatus` (`paid | pending | failed`)
 *    is mapped to display statuses (`confirmed | pending | cancelled`) at
 *    the presentation boundary only. The shared `Booking` type and every
 *    dashboard revenue rule are untouched.
 * 2. Rows are ordered newest booking first (stable for equal timestamps).
 * 3. Search matches case-insensitively against the booking reference,
 *    the attendee name and the associated event title.
 * 4. Summary figures always describe ALL bookings, never the filtered set.
 */
import type { Booking, PaymentStatus } from '../types/booking';
import type {
  BookingDisplayStatus,
  BookingFilterState,
  BookingRow,
  BookingSummary,
} from '../types/bookings';
import type { EventItem } from '../types/event';

/** Maps the domain payment status onto the user-facing booking status. */
export function toDisplayStatus(paymentStatus: PaymentStatus): BookingDisplayStatus {
  switch (paymentStatus) {
    case 'paid':
      return 'confirmed';
    case 'pending':
      return 'pending';
    case 'failed':
      return 'cancelled';
  }
}

/**
 * Joins bookings with their events into display-ready rows, newest first.
 *
 * Bookings whose `eventId` does not resolve to an event are dropped so the
 * table never shows an unresolvable event title (the seed integrity test
 * guarantees none exist today, but the service contract should be safe).
 */
export function buildBookingRows(
  bookings: readonly Booking[],
  events: readonly EventItem[],
): BookingRow[] {
  const eventsById = new Map(events.map((event) => [event.id, event]));

  return bookings
    .flatMap((booking): BookingRow[] => {
      const event = eventsById.get(booking.eventId);
      if (!event) {
        return [];
      }

      return [
        {
          id: booking.id,
          status: toDisplayStatus(booking.paymentStatus),
          paymentStatus: booking.paymentStatus,
          attendeeName: booking.attendeeName,
          ticketQuantity: booking.ticketQuantity,
          amount: booking.amount,
          createdAt: booking.createdAt,
          eventId: booking.eventId,
          eventTitle: event.title,
          eventDate: event.date,
        },
      ];
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Counts every booking by display status (total, confirmed, pending, cancelled). */
export function buildBookingSummary(bookings: readonly Booking[]): BookingSummary {
  const summary: BookingSummary = { total: bookings.length, confirmed: 0, pending: 0, cancelled: 0 };

  for (const booking of bookings) {
    summary[toDisplayStatus(booking.paymentStatus)] += 1;
  }

  return summary;
}

/** True when a row matches the free-text query (reference, attendee, event). */
export function matchesBookingQuery(row: BookingRow, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return true;
  }

  return [row.id, row.attendeeName ?? '', row.eventTitle].some((field) =>
    field.toLowerCase().includes(needle),
  );
}

/**
 * Applies the active search and filters to a row list.
 * Filters combine with AND; an `'all'` value disables that filter.
 */
export function filterBookingRows(
  rows: readonly BookingRow[],
  filters: BookingFilterState,
): BookingRow[] {
  return rows.filter((row) => {
    if (filters.status !== 'all' && row.status !== filters.status) {
      return false;
    }
    if (filters.eventId !== 'all' && row.eventId !== filters.eventId) {
      return false;
    }
    return matchesBookingQuery(row, filters.query);
  });
}
