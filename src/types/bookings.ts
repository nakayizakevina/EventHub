/**
 * Read models (DTOs) for the Bookings screens.
 *
 * The domain `Booking` stays payment-centric (`paid | pending | failed`) so
 * the dashboard revenue rules keep working unchanged. These types add the
 * presentation-facing status labels and the joined rows the bookings UI
 * consumes — derived from seed data by `bookingCalculations`, never
 * hardcoded in components.
 */
import type { PaymentStatus } from './booking';

/**
 * Booking status as shown to the user on the Bookings screens.
 *
 * Mapped from `PaymentStatus`: `paid → confirmed`, `pending → pending`,
 * `failed → cancelled`.
 */
export type BookingDisplayStatus = 'confirmed' | 'pending' | 'cancelled';

/** A booking joined with its event, ready for table and details rendering. */
export interface BookingRow {
  /** Booking reference (the booking id, e.g. "bkg-001"). */
  id: string;
  /** Display status derived from the payment status. */
  status: BookingDisplayStatus;
  /** Raw payment status, kept for filtering/debugging parity with the domain. */
  paymentStatus: PaymentStatus;
  /** Full name of the attendee; may be undefined for anonymous orders. */
  attendeeName?: string;
  /** Number of tickets in the booking. */
  ticketQuantity: number;
  /** Order total in USD. */
  amount: number;
  /** ISO 8601 timestamp of when the booking was created. */
  createdAt: string;
  /** Foreign key referencing the associated event. */
  eventId: string;
  /** Title of the associated event (denormalised for display). */
  eventTitle: string;
  /** Start date of the associated event (ISO 8601, denormalised for display). */
  eventDate: string;
}

/** Headline figures shown in the bookings overview cards. */
export interface BookingSummary {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
}

/** Active search/filter criteria applied to the bookings table. */
export interface BookingFilterState {
  /** Free-text query matched against reference, attendee and event title. */
  query: string;
  /** Display status to show; `'all'` disables status filtering. */
  status: BookingDisplayStatus | 'all';
  /** Event id to show; `'all'` disables event filtering. */
  eventId: string;
}
