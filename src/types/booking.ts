/**
 * Domain model for a booking (an order for one or more event tickets).
 */

/** Payment state of a booking. Only `paid` bookings contribute to revenue. */
export type PaymentStatus = 'paid' | 'pending' | 'failed';

/** A single ticket order against an event. */
export interface Booking {
  /** Unique, stable identifier (e.g. "bkg-001"). */
  id: string;
  /** Foreign key referencing an event in the seed data. */
  eventId: string;
  /** Full name of the attendee; optional (some orders are anonymous). */
  attendeeName?: string;
  /** Number of tickets covered by this booking. Must be `> 0`. */
  ticketQuantity: number;
  /** Total order amount in USD (`ticketQuantity` x unit price). Must be `> 0`. */
  amount: number;
  paymentStatus: PaymentStatus;
  /** ISO 8601 timestamp of when the booking was created. */
  createdAt: string;
}
