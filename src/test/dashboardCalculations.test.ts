import { describe, expect, it } from 'vitest';

import type { Booking } from '../types/booking';
import type { EventItem } from '../types/event';
import {
  buildDashboardSummary,
  calculateAverageOrderValue,
  calculateEventRevenue,
  calculateFailedRevenue,
  calculateOccupancyRate,
  calculateOutstandingRevenue,
  calculatePopularEvents,
  calculateSalesByCategory,
  calculateTicketSalesByStatus,
  calculateTicketTotals,
  calculateTotalRevenue,
  countBookingsByStatus,
  countEventsByStatus,
  filterEventsInMonth,
  filterUpcomingEvents,
  groupPaidRevenueByMonth,
  isPaidBooking,
  roundCurrency,
} from '../utils/dashboardCalculations';

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

describe('roundCurrency', () => {
  it('rounds to two decimal places', () => {
    expect(roundCurrency(10.005)).toBe(10.01);
    expect(roundCurrency(2.344)).toBe(2.34);
  });

  it('neutralises floating point artefacts', () => {
    expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
  });
});

describe('revenue calculations', () => {
  const mixedBookings: Booking[] = [
    makeBooking({ id: 'b1', amount: 100, paymentStatus: 'paid' }),
    makeBooking({ id: 'b2', amount: 50, paymentStatus: 'pending' }),
    makeBooking({ id: 'b3', amount: 25, paymentStatus: 'failed' }),
    makeBooking({ id: 'b4', amount: 40, paymentStatus: 'paid' }),
  ];

  it('identifies paid bookings', () => {
    expect(isPaidBooking(mixedBookings[0])).toBe(true);
    expect(isPaidBooking(mixedBookings[1])).toBe(false);
    expect(isPaidBooking(mixedBookings[2])).toBe(false);
  });

  it('includes only paid bookings in total revenue', () => {
    expect(calculateTotalRevenue(mixedBookings)).toBe(140);
  });

  it('reports pending and failed amounts separately', () => {
    expect(calculateOutstandingRevenue(mixedBookings)).toBe(50);
    expect(calculateFailedRevenue(mixedBookings)).toBe(25);
  });

  it('returns zero revenue when there are no bookings', () => {
    expect(calculateTotalRevenue([])).toBe(0);
  });

  it('averages paid bookings only', () => {
    expect(calculateAverageOrderValue(mixedBookings)).toBe(70);
    expect(
      calculateAverageOrderValue([
        makeBooking({ id: 'b5', amount: 60, paymentStatus: 'pending' }),
      ]),
    ).toBe(0);
  });

  it('sums paid revenue for a single event', () => {
    const bookings = [
      makeBooking({ id: 'b6', eventId: 'evt-001', amount: 30 }),
      makeBooking({ id: 'b7', eventId: 'evt-002', amount: 70 }),
      makeBooking({ id: 'b8', eventId: 'evt-001', amount: 90, paymentStatus: 'failed' }),
    ];
    expect(calculateEventRevenue(bookings, 'evt-001')).toBe(30);
  });
});

describe('countBookingsByStatus', () => {
  it('counts every payment status', () => {
    const counts = countBookingsByStatus([
      makeBooking({ id: 'b1', paymentStatus: 'paid' }),
      makeBooking({ id: 'b2', paymentStatus: 'paid' }),
      makeBooking({ id: 'b3', paymentStatus: 'pending' }),
      makeBooking({ id: 'b4', paymentStatus: 'failed' }),
    ]);
    expect(counts).toEqual({ paid: 2, pending: 1, failed: 1 });
  });

  it('returns zeroed counts for an empty list', () => {
    expect(countBookingsByStatus([])).toEqual({ paid: 0, pending: 0, failed: 0 });
  });
});

describe('countEventsByStatus', () => {
  it('counts every event status', () => {
    const counts = countEventsByStatus([
      makeEvent({ id: 'e1', status: 'upcoming' }),
      makeEvent({ id: 'e2', status: 'active' }),
      makeEvent({ id: 'e3', status: 'completed' }),
      makeEvent({ id: 'e4', status: 'upcoming' }),
      makeEvent({ id: 'e5', status: 'draft' }),
    ]);
    expect(counts).toEqual({ upcoming: 2, active: 1, completed: 1, draft: 1 });
  });
});

describe('occupancy and ticket totals', () => {
  it('calculates occupancy as a percentage of capacity', () => {
    expect(calculateOccupancyRate({ ticketsSold: 30, ticketCapacity: 40 })).toBe(75);
    expect(calculateOccupancyRate({ ticketsSold: 1, ticketCapacity: 3 })).toBe(33.3);
  });

  it('guards against zero capacity', () => {
    expect(calculateOccupancyRate({ ticketsSold: 0, ticketCapacity: 0 })).toBe(0);
  });

  it('totals sold tickets and capacity across events', () => {
    const totals = calculateTicketTotals([
      makeEvent({ id: 'e1', ticketsSold: 75, ticketCapacity: 100 }),
      makeEvent({ id: 'e2', ticketsSold: 50, ticketCapacity: 50, category: 'Sports' }),
    ]);
    expect(totals).toEqual({ ticketsSold: 125, ticketCapacity: 150, occupancyRate: 83.3 });
  });
});

describe('calculateSalesByCategory', () => {
  it('aggregates ticket sales per category, highest first', () => {
    const breakdown = calculateSalesByCategory([
      makeEvent({ id: 'e1', category: 'Music', ticketsSold: 100, ticketCapacity: 200 }),
      makeEvent({ id: 'e2', category: 'Sports', ticketsSold: 50, ticketCapacity: 100 }),
      makeEvent({ id: 'e3', category: 'Music', ticketsSold: 30, ticketCapacity: 50 }),
    ]);

    expect(breakdown).toEqual([
      { category: 'Music', ticketsSold: 130, ticketCapacity: 250, occupancyRate: 52 },
      { category: 'Sports', ticketsSold: 50, ticketCapacity: 100, occupancyRate: 50 },
    ]);
  });
});

describe('groupPaidRevenueByMonth', () => {
  const referenceDate = new Date(2025, 5, 15, 12); // 15 Jun 2025 (local time)
  const bookings: Booking[] = [
    makeBooking({
      id: 'b1',
      amount: 100,
      createdAt: new Date(2025, 4, 15, 10).toISOString(), // May, paid
    }),
    makeBooking({
      id: 'b2',
      amount: 60,
      paymentStatus: 'pending',
      createdAt: new Date(2025, 3, 15, 10).toISOString(), // April, pending
    }),
    makeBooking({
      id: 'b3',
      amount: 40,
      paymentStatus: 'failed',
      createdAt: new Date(2025, 5, 15, 10).toISOString(), // June, failed
    }),
  ];

  it('returns one point per month, oldest first, with zero-filled months', () => {
    const points = groupPaidRevenueByMonth(bookings, 3, referenceDate);

    expect(points).toEqual([
      { month: '2025-04', label: 'Apr 2025', revenue: 0 },
      { month: '2025-05', label: 'May 2025', revenue: 100 },
      { month: '2025-06', label: 'Jun 2025', revenue: 0 },
    ]);
  });

  it('excludes pending and failed payments from monthly revenue', () => {
    const points = groupPaidRevenueByMonth(bookings, 3, referenceDate);
    const total = points.reduce((sum, point) => sum + point.revenue, 0);
    expect(total).toBe(100);
  });

  it('returns an empty series when no months are requested', () => {
    expect(groupPaidRevenueByMonth(bookings, 0, referenceDate)).toEqual([]);
  });
});

describe('filterUpcomingEvents', () => {
  it('keeps only upcoming events, soonest first', () => {
    const upcoming = filterUpcomingEvents([
      makeEvent({ id: 'e1', status: 'upcoming', date: new Date(2025, 8, 1).toISOString() }),
      makeEvent({ id: 'e2', status: 'completed', date: new Date(2025, 0, 1).toISOString() }),
      makeEvent({ id: 'e3', status: 'upcoming', date: new Date(2025, 6, 1).toISOString() }),
      makeEvent({ id: 'e4', status: 'active', date: new Date(2025, 7, 1).toISOString() }),
    ]);

    expect(upcoming.map((event) => event.id)).toEqual(['e3', 'e1']);
  });
});

describe('filterEventsInMonth', () => {
  it('returns only events inside the given calendar month', () => {
    const events = [
      makeEvent({ id: 'e1', date: new Date(2025, 5, 10, 18).toISOString() }),
      makeEvent({ id: 'e2', date: new Date(2025, 5, 25, 9).toISOString() }),
      makeEvent({ id: 'e3', date: new Date(2025, 6, 5, 9).toISOString() }),
      makeEvent({ id: 'e4', date: new Date(2025, 4, 31, 23).toISOString() }),
    ];

    const june = filterEventsInMonth(events, new Date(2025, 5, 15));
    expect(june.map((event) => event.id)).toEqual(['e1', 'e2']);
  });

  it('returns an empty list for a month with no events', () => {
    const events = [makeEvent({ id: 'e1', date: new Date(2025, 5, 10).toISOString() })];
    expect(filterEventsInMonth(events, new Date(2010, 0, 1))).toEqual([]);
  });
});

describe('calculatePopularEvents', () => {
  it('ranks events by tickets sold and respects the limit', () => {
    const events = [
      makeEvent({ id: 'e1', ticketsSold: 100, ticketCapacity: 150 }),
      makeEvent({ id: 'e2', ticketsSold: 300, ticketCapacity: 400 }),
      makeEvent({ id: 'e3', ticketsSold: 200, ticketCapacity: 250 }),
    ];
    const bookings = [
      makeBooking({ id: 'b1', eventId: 'e2', amount: 500 }),
      makeBooking({ id: 'b2', eventId: 'e2', amount: 250, paymentStatus: 'pending' }),
    ];

    const popular = calculatePopularEvents(events, bookings, 2);

    expect(popular.map((event) => event.id)).toEqual(['e2', 'e3']);
    expect(popular[0].revenue).toBe(500); // pending booking excluded
    expect(popular[0].occupancyRate).toBe(75); // 300 / 400
  });
});

describe('calculateTicketSalesByStatus', () => {
  const events = [
    makeEvent({ id: 'e1', ticketsSold: 95, ticketCapacity: 100 }), // 95% -> sold-out
    makeEvent({ id: 'e2', ticketsSold: 80, ticketCapacity: 100 }), // 80% -> fully-booked
    makeEvent({ id: 'e3', ticketsSold: 40, ticketCapacity: 100 }), // 40% -> available
    makeEvent({ id: 'e4', ticketsSold: 0, ticketCapacity: 0 }), // zero capacity guard
  ];

  it('assigns capacity to buckets by event occupancy', () => {
    expect(calculateTicketSalesByStatus(events)).toEqual([
      { status: 'sold-out', tickets: 100, percentage: 33.3 },
      { status: 'fully-booked', tickets: 100, percentage: 33.3 },
      { status: 'available', tickets: 100, percentage: 33.3 },
    ]);
  });

  it('produces buckets that always sum to the total capacity', () => {
    const buckets = calculateTicketSalesByStatus(events);
    const bucketTotal = buckets.reduce((sum, bucket) => sum + bucket.tickets, 0);

    expect(bucketTotal).toBe(300); // sum of capacities (zero-capacity event adds nothing)
    expect(buckets.reduce((sum, bucket) => sum + bucket.percentage, 0)).toBeCloseTo(100, 0);
  });
});

describe('buildDashboardSummary', () => {
  it('derives every headline figure from the supplied data', () => {
    const events = [
      makeEvent({ id: 'e1', status: 'upcoming', ticketsSold: 80, ticketCapacity: 100 }),
      makeEvent({ id: 'e2', status: 'active', ticketsSold: 20, ticketCapacity: 100, category: 'Sports' }),
    ];
    const bookings = [
      makeBooking({ id: 'b1', eventId: 'e1', amount: 400 }),
      makeBooking({ id: 'b2', eventId: 'e2', amount: 100, paymentStatus: 'pending' }),
      makeBooking({ id: 'b3', eventId: 'e2', amount: 50, paymentStatus: 'failed' }),
    ];

    expect(buildDashboardSummary(events, bookings)).toEqual({
      totalEvents: 2,
      upcomingEvents: 1,
      activeEvents: 1,
      completedEvents: 0,
      totalTicketsSold: 100,
      totalTicketCapacity: 200,
      ticketOccupancyRate: 50,
      totalRevenue: 400,
      outstandingRevenue: 100,
      failedRevenue: 50,
      averageOrderValue: 400,
      totalBookings: 3,
      paidBookings: 1,
      pendingBookings: 1,
      failedBookings: 1,
    });
  });
});
