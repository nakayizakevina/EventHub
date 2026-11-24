import { describe, expect, it } from 'vitest';

import type { Booking } from '../types/booking';
import type { EventItem } from '../types/event';
import {
  buildCategoryRows,
  buildReportEventRows,
  buildReportSummary,
  DEFAULT_REPORT_FILTERS,
  filterBookingsByScope,
  filterEventsByCategory,
  groupReportTrends,
  REPORT_PERIOD_LABELS,
  resolvePeriodStart,
} from '../utils/reportCalculations';

/** Compact booking factory for fixtures. */
function makeBooking(overrides: Partial<Booking> & Pick<Booking, 'id'>): Booking {
  return {
    eventId: 'evt-001',
    ticketQuantity: 1,
    amount: 10,
    paymentStatus: 'paid',
    createdAt: new Date(2025, 5, 15, 10).toISOString(),
    ...overrides,
  };
}

/** Compact event factory for fixtures. */
function makeEvent(overrides: Partial<EventItem> & Pick<EventItem, 'id'>): EventItem {
  return {
    title: 'Sample Event',
    category: 'Music',
    date: new Date(2025, 5, 15, 18).toISOString(),
    venue: 'Sample Venue',
    status: 'upcoming',
    ticketCapacity: 100,
    ticketsSold: 50,
    image: '/images/events/sample.svg',
    ...overrides,
  };
}

/** Fixed reference date: 15 November 2026. */
const REFERENCE = new Date(2026, 10, 15, 12);

describe('report filter constants', () => {
  it('defaults to a six-month window across all categories', () => {
    expect(DEFAULT_REPORT_FILTERS).toEqual({ period: '6m', category: 'all' });
  });

  it('labels every supported period', () => {
    expect(Object.keys(REPORT_PERIOD_LABELS)).toEqual(['3m', '6m', '12m', 'all']);
    expect(REPORT_PERIOD_LABELS.all).toBe('All Time');
  });
});

describe('resolvePeriodStart', () => {
  it('returns null for the all-time period', () => {
    expect(resolvePeriodStart('all', REFERENCE)).toBeNull();
  });

  it('includes the current month in the window', () => {
    // Six months ending November 2026 spans June – November inclusive.
    expect(resolvePeriodStart('6m', REFERENCE)).toEqual(new Date(2026, 5, 1));
    expect(resolvePeriodStart('3m', REFERENCE)).toEqual(new Date(2026, 8, 1));
    expect(resolvePeriodStart('12m', REFERENCE)).toEqual(new Date(2025, 11, 1));
  });

  it('normalises the reference date to the start of its month', () => {
    expect(resolvePeriodStart('3m', new Date(2026, 10, 1))).toEqual(new Date(2026, 8, 1));
  });
});

describe('filterEventsByCategory', () => {
  const music = makeEvent({ id: 'e1', category: 'Music' });
  const sports = makeEvent({ id: 'e2', category: 'Sports' });

  it('keeps every event when the category is "all"', () => {
    expect(filterEventsByCategory([music, sports], 'all')).toEqual([music, sports]);
  });

  it('returns only matching events otherwise', () => {
    expect(filterEventsByCategory([music, sports], 'Sports')).toEqual([sports]);
  });
});

describe('filterBookingsByScope', () => {
  const inScope = makeBooking({ id: 'b1', eventId: 'evt-001', createdAt: new Date(2026, 8, 10).toISOString() });
  const otherEvent = makeBooking({ id: 'b2', eventId: 'evt-002', createdAt: new Date(2026, 8, 10).toISOString() });
  const tooOld = makeBooking({ id: 'b3', eventId: 'evt-001', createdAt: new Date(2026, 6, 1).toISOString() });

  it('keeps bookings for scoped events inside the period', () => {
    const result = filterBookingsByScope(
      [inScope, otherEvent, tooOld],
      new Set(['evt-001']),
      new Date(2026, 8, 1),
    );
    expect(result.map((booking) => booking.id)).toEqual(['b1']);
  });

  it('keeps every scoped booking when the period is all-time', () => {
    const result = filterBookingsByScope([inScope, otherEvent, tooOld], new Set(['evt-001']), null);
    expect(result.map((booking) => booking.id)).toEqual(['b1', 'b3']);
  });
});

describe('buildReportSummary', () => {
  it('combines event totals with period registrations and paid revenue', () => {
    const scopedEvents = [
      makeEvent({ id: 'e1', ticketCapacity: 200, ticketsSold: 150 }),
      makeEvent({ id: 'e2', ticketCapacity: 100, ticketsSold: 50 }),
    ];
    const scopedBookings = [
      makeBooking({ id: 'b1', amount: 100, paymentStatus: 'paid' }),
      makeBooking({ id: 'b2', amount: 40, paymentStatus: 'pending' }),
      makeBooking({ id: 'b3', amount: 60, paymentStatus: 'failed' }),
    ];

    const summary = buildReportSummary(scopedEvents, scopedBookings);

    expect(summary.totalEvents).toBe(2);
    expect(summary.registrations).toBe(3);
    expect(summary.totalTicketsSold).toBe(200);
    expect(summary.totalTicketCapacity).toBe(300);
    expect(summary.occupancyRate).toBe(66.7);
    expect(summary.totalRevenue).toBe(100);
  });

  it('is safe on empty scopes', () => {
    expect(buildReportSummary([], [])).toEqual({
      totalEvents: 0,
      registrations: 0,
      totalTicketsSold: 0,
      totalTicketCapacity: 0,
      occupancyRate: 0,
      totalRevenue: 0,
    });
  });
});

describe('groupReportTrends', () => {
  it('emits one continuous point per month of the period', () => {
    const points = groupReportTrends([], [], resolvePeriodStart('3m', REFERENCE), REFERENCE);

    expect(points.map((point) => point.month)).toEqual(['2026-09', '2026-10', '2026-11']);
    expect(points.map((point) => point.label)).toEqual(['Sep 2026', 'Oct 2026', 'Nov 2026']);
    expect(points.every((point) => point.registrations === 0 && point.attendance === 0)).toBe(true);
  });

  it('counts registrations by booking month and attendance by held-event month', () => {
    const scopedEvents = [
      makeEvent({
        id: 'e1',
        date: new Date(2026, 9, 20, 10).toISOString(), // October, completed
        status: 'completed',
        ticketsSold: 800,
      }),
      makeEvent({
        id: 'e2',
        date: new Date(2026, 10, 20, 10).toISOString(), // November, active
        status: 'active',
        ticketsSold: 300,
      }),
      makeEvent({
        id: 'e3',
        date: new Date(2026, 9, 25, 10).toISOString(), // October but not held yet
        status: 'upcoming',
        ticketsSold: 500,
      }),
    ];
    const scopedBookings = [
      makeBooking({ id: 'b1', createdAt: new Date(2026, 8, 5, 9).toISOString() }),
      makeBooking({ id: 'b2', createdAt: new Date(2026, 8, 25, 9).toISOString() }),
      makeBooking({ id: 'b3', createdAt: new Date(2026, 9, 2, 9).toISOString() }),
      // Outside the September – November window; must not appear anywhere.
      makeBooking({ id: 'b4', createdAt: new Date(2026, 6, 1, 9).toISOString() }),
    ];

    const points = groupReportTrends(
      scopedEvents,
      scopedBookings,
      resolvePeriodStart('3m', REFERENCE),
      REFERENCE,
    );

    expect(points).toEqual([
      { month: '2026-09', label: 'Sep 2026', registrations: 2, attendance: 0 },
      { month: '2026-10', label: 'Oct 2026', registrations: 1, attendance: 800 },
      { month: '2026-11', label: 'Nov 2026', registrations: 0, attendance: 300 },
    ]);
  });

  it('sizes the all-time window from the earliest scoped activity', () => {
    const scopedBookings = [makeBooking({ id: 'b1', createdAt: new Date(2026, 6, 20, 9).toISOString() })];

    const points = groupReportTrends([], scopedBookings, null, REFERENCE);

    expect(points.map((point) => point.month)).toEqual([
      '2026-07',
      '2026-08',
      '2026-09',
      '2026-10',
      '2026-11',
    ]);
    expect(points[0].registrations).toBe(1);
  });

  it('falls back to a six-month window when there is no activity at all', () => {
    const points = groupReportTrends([], [], null, REFERENCE);

    expect(points.map((point) => point.month)).toEqual([
      '2026-06',
      '2026-07',
      '2026-08',
      '2026-09',
      '2026-10',
      '2026-11',
    ]);
  });
});

describe('buildCategoryRows', () => {
  const musicA = makeEvent({ id: 'e1', category: 'Music', ticketCapacity: 100, ticketsSold: 80 });
  const musicB = makeEvent({ id: 'e2', category: 'Music', ticketCapacity: 200, ticketsSold: 60 });
  const sports = makeEvent({ id: 'e3', category: 'Sports', ticketCapacity: 90, ticketsSold: 90 });

  it('aggregates ticket totals per category and computes occupancy', () => {
    const rows = buildCategoryRows([musicA, musicB, sports], []);

    const music = rows.find((row) => row.category === 'Music');
    expect(music).toMatchObject({ ticketsSold: 140, ticketCapacity: 300, occupancyRate: 46.7 });
    expect(rows.find((row) => row.category === 'Sports')).toMatchObject({
      ticketsSold: 90,
      occupancyRate: 100,
    });
  });

  it('sums paid revenue for the events of each category only', () => {
    const bookings = [
      makeBooking({ id: 'b1', eventId: 'e1', amount: 50, paymentStatus: 'paid' }),
      makeBooking({ id: 'b2', eventId: 'e2', amount: 30, paymentStatus: 'paid' }),
      makeBooking({ id: 'b3', eventId: 'e2', amount: 99, paymentStatus: 'pending' }),
      makeBooking({ id: 'b4', eventId: 'e3', amount: 70, paymentStatus: 'paid' }),
      // Booking for an event outside the scope must be ignored.
      makeBooking({ id: 'b5', eventId: 'e-other', amount: 10, paymentStatus: 'paid' }),
    ];

    const rows = buildCategoryRows([musicA, musicB, sports], bookings);

    expect(rows.find((row) => row.category === 'Music')?.revenue).toBe(80);
    expect(rows.find((row) => row.category === 'Sports')?.revenue).toBe(70);
  });

  it('ranks categories by tickets sold, highest first', () => {
    const rows = buildCategoryRows([musicA, musicB, sports], []);
    expect(rows.map((row) => row.category)).toEqual(['Music', 'Sports']);
  });
});

describe('buildReportEventRows', () => {
  const popular = makeEvent({ id: 'e1', ticketCapacity: 100, ticketsSold: 90 });
  const niche = makeEvent({ id: 'e2', ticketCapacity: 100, ticketsSold: 20 });

  it('joins period registrations and paid revenue onto each event', () => {
    const bookings = [
      makeBooking({ id: 'b1', eventId: 'e1', amount: 40, paymentStatus: 'paid' }),
      makeBooking({ id: 'b2', eventId: 'e1', amount: 25, paymentStatus: 'failed' }),
      makeBooking({ id: 'b3', eventId: 'e1', amount: 60, paymentStatus: 'paid' }),
    ];

    const rows = buildReportEventRows([popular, niche], bookings);

    expect(rows[0]).toMatchObject({
      id: 'e1',
      registrations: 3,
      revenue: 100,
      occupancyRate: 90,
    });
    expect(rows[1]).toMatchObject({ id: 'e2', registrations: 0, revenue: 0, occupancyRate: 20 });
  });

  it('ranks events by tickets sold, highest first', () => {
    const rows = buildReportEventRows([niche, popular], []);
    expect(rows.map((row) => row.id)).toEqual(['e1', 'e2']);
  });
});
