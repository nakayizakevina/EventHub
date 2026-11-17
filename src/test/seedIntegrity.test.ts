/**
 * Seed integrity tests — they enforce the data rules documented in the
 * README and in `dashboardCalculations.ts`:
 *   - capacity is never exceeded,
 *   - bookings reference real events,
 *   - revenue-only-paid and ticket-sales definitions hold,
 *   - the required statuses, categories and payment states are covered.
 */
import { describe, expect, it } from 'vitest';

import { bookings, events } from '../data/seed';
import {
  calculateTicketSalesByStatus,
  calculateTotalRevenue,
  isPaidBooking,
} from '../utils/dashboardCalculations';

describe('seed data shape', () => {
  it('contains at least 8 events and 15 bookings', () => {
    expect(events.length).toBeGreaterThanOrEqual(8);
    expect(bookings.length).toBeGreaterThanOrEqual(15);
  });

  it('uses unique identifiers', () => {
    const eventIds = new Set(events.map((event) => event.id));
    const bookingIds = new Set(bookings.map((booking) => booking.id));
    expect(eventIds.size).toBe(events.length);
    expect(bookingIds.size).toBe(bookings.length);
  });

  it('covers all required event categories', () => {
    const categories = new Set(events.map((event) => event.category));
    for (const category of ['Music', 'Sports', 'Fashion', 'Technology', 'Food & Culinary']) {
      expect(categories).toContain(category);
    }
  });

  it('covers upcoming, active and completed events', () => {
    const statuses = new Set(events.map((event) => event.status));
    expect(statuses).toContain('upcoming');
    expect(statuses).toContain('active');
    expect(statuses).toContain('completed');
  });

  it('covers paid, pending and failed bookings', () => {
    const paymentStates = new Set(bookings.map((booking) => booking.paymentStatus));
    expect(paymentStates).toContain('paid');
    expect(paymentStates).toContain('pending');
    expect(paymentStates).toContain('failed');
  });

  it('includes at least one booking without an attendee name (optional field)', () => {
    expect(bookings.some((booking) => booking.attendeeName === undefined)).toBe(true);
  });

  it('spreads bookings across at least four different months', () => {
    const months = new Set(
      bookings.map((booking) => booking.createdAt.slice(0, 7)),
    );
    expect(months.size).toBeGreaterThanOrEqual(4);
  });
});

describe('seed data rules', () => {
  it('every booking references an existing event', () => {
    const eventIds = new Set(events.map((event) => event.id));
    for (const booking of bookings) {
      expect(eventIds.has(booking.eventId)).toBe(true);
    }
  });

  it('never exceeds event ticket capacity', () => {
    for (const event of events) {
      expect(event.ticketsSold).toBeGreaterThanOrEqual(0);
      expect(event.ticketsSold).toBeLessThanOrEqual(event.ticketCapacity);
    }
  });

  it('ticket-sales donut buckets always cover the full ticket pool', () => {
    const buckets = calculateTicketSalesByStatus(events);
    const bucketTotal = buckets.reduce((sum, bucket) => sum + bucket.tickets, 0);
    const totalCapacity = events.reduce((sum, event) => sum + event.ticketCapacity, 0);

    expect(bucketTotal).toBe(totalCapacity);
  });

  it('paid booking quantities never exceed the event tickets sold', () => {
    for (const event of events) {
      const paidTickets = bookings
        .filter((booking) => booking.eventId === event.id && isPaidBooking(booking))
        .reduce((sum, booking) => sum + booking.ticketQuantity, 0);

      expect(paidTickets).toBeLessThanOrEqual(event.ticketsSold);
    }
  });

  it('keeps booking amounts and quantities positive', () => {
    for (const booking of bookings) {
      expect(booking.ticketQuantity).toBeGreaterThan(0);
      expect(booking.amount).toBeGreaterThan(0);
    }
  });

  it('excludes pending and failed payments from revenue', () => {
    const paidOnly = bookings.filter(isPaidBooking);
    const manualTotal = paidOnly.reduce((sum, booking) => sum + booking.amount, 0);

    expect(calculateTotalRevenue(bookings)).toBe(manualTotal);
    expect(paidOnly.length).toBeLessThan(bookings.length);
  });

  it('schedules upcoming events in the future and completed events in the past', () => {
    const now = Date.now();

    for (const event of events) {
      const eventTime = new Date(event.date).getTime();

      if (event.status === 'upcoming') {
        expect(eventTime).toBeGreaterThan(now);
      }
      if (event.status === 'completed') {
        expect(eventTime).toBeLessThan(now);
      }
    }
  });

  it('points every image at the public events folder', () => {
    for (const event of events) {
      expect(event.image.startsWith('/images/events/')).toBe(true);
    }
  });
});
