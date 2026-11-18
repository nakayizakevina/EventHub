import { describe, expect, it } from 'vitest';

import { bookings, events } from '../data/seed';
import type { BookingFilterState } from '../types/bookings';
import {
  buildBookingRows,
  buildBookingSummary,
  filterBookingRows,
  matchesBookingQuery,
  toDisplayStatus,
} from '../utils/bookingCalculations';

describe('bookingCalculations', () => {
  describe('toDisplayStatus', () => {
    it('maps every payment status onto a display status', () => {
      expect(toDisplayStatus('paid')).toBe('confirmed');
      expect(toDisplayStatus('pending')).toBe('pending');
      expect(toDisplayStatus('failed')).toBe('cancelled');
    });
  });

  describe('buildBookingRows', () => {
    const rows = buildBookingRows(bookings, events);

    it('joins every booking with its event title', () => {
      expect(rows).toHaveLength(bookings.length);
      for (const row of rows) {
        const event = events.find((candidate) => candidate.id === row.eventId);
        expect(event).toBeDefined();
        expect(row.eventTitle).toBe(event?.title);
        expect(row.eventDate).toBe(event?.date);
      }
    });

    it('orders rows newest booking first', () => {
      const timestamps = rows.map((row) => row.createdAt);
      const sorted = [...timestamps].sort((a, b) => b.localeCompare(a));
      expect(timestamps).toEqual(sorted);
    });

    it('drops bookings whose event does not exist', () => {
      const orphan = { ...bookings[0], id: 'bkg-orphan', eventId: 'evt-missing' };
      const withOrphan = buildBookingRows([orphan, bookings[1]], events);

      expect(withOrphan).toHaveLength(1);
      expect(withOrphan[0].id).toBe(bookings[1].id);
    });

    it('carries the display status derived from the payment status', () => {
      for (const row of rows) {
        expect(row.status).toBe(toDisplayStatus(row.paymentStatus));
      }
    });
  });

  describe('buildBookingSummary', () => {
    it('derives the summary from the seed data', () => {
      const summary = buildBookingSummary(bookings);

      expect(summary.total).toBe(bookings.length);
      expect(summary.confirmed + summary.pending + summary.cancelled).toBe(summary.total);
      expect(summary.confirmed).toBe(bookings.filter((b) => b.paymentStatus === 'paid').length);
      expect(summary.pending).toBe(bookings.filter((b) => b.paymentStatus === 'pending').length);
      expect(summary.cancelled).toBe(bookings.filter((b) => b.paymentStatus === 'failed').length);
    });

    it('returns an all-zero summary for an empty list', () => {
      expect(buildBookingSummary([])).toEqual({ total: 0, confirmed: 0, pending: 0, cancelled: 0 });
    });
  });

  describe('matchesBookingQuery', () => {
    const rows = buildBookingRows(bookings, events);
    const first = rows[0];

    it('matches the booking reference case-insensitively', () => {
      expect(matchesBookingQuery(first, first.id.toUpperCase())).toBe(true);
    });

    it('matches the attendee name', () => {
      expect(matchesBookingQuery(first, first.attendeeName ?? '')).toBe(true);
    });

    it('matches the event title', () => {
      expect(matchesBookingQuery(first, first.eventTitle.toLowerCase())).toBe(true);
    });

    it('matches everything when the query is blank', () => {
      expect(matchesBookingQuery(first, '   ')).toBe(true);
    });

    it('rejects a non-matching query', () => {
      expect(matchesBookingQuery(first, 'zzz-no-such-booking-zzz')).toBe(false);
    });
  });

  describe('filterBookingRows', () => {
    const rows = buildBookingRows(bookings, events);
    const noFilters: BookingFilterState = { query: '', status: 'all', eventId: 'all' };

    it('returns every row when no filter is active', () => {
      expect(filterBookingRows(rows, noFilters)).toHaveLength(rows.length);
    });

    it('filters by display status', () => {
      const confirmed = filterBookingRows(rows, { ...noFilters, status: 'confirmed' });

      expect(confirmed.length).toBeGreaterThan(0);
      expect(confirmed.every((row) => row.status === 'confirmed')).toBe(true);
    });

    it('filters by event id', () => {
      const eventId = events[0].id;
      const filtered = filterBookingRows(rows, { ...noFilters, eventId });

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((row) => row.eventId === eventId)).toBe(true);
    });

    it('combines search and filters with AND', () => {
      const filtered = filterBookingRows(rows, {
        query: rows[0].eventTitle,
        status: rows[0].status,
        eventId: rows[0].eventId,
      });

      expect(filtered.some((row) => row.id === rows[0].id)).toBe(true);
      expect(
        filtered.every(
          (row) =>
            row.status === rows[0].status &&
            row.eventId === rows[0].eventId &&
            row.eventTitle.toLowerCase().includes(rows[0].eventTitle.toLowerCase()),
        ),
      ).toBe(true);
    });

    it('returns an empty list when nothing matches', () => {
      expect(
        filterBookingRows(rows, { ...noFilters, query: 'zzz-no-such-booking-zzz' }),
      ).toHaveLength(0);
    });
  });
});
