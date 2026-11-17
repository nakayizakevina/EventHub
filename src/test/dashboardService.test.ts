import { describe, expect, it } from 'vitest';

import { bookings, events } from '../data/seed';
import {
  getCalendarEvents,
  getAllEvents,
  getDashboardSummary,
  getFeaturedEvent,
  getMonthlyRevenue,
  getPopularEvents,
  getTicketSalesBreakdown,
  getTicketSalesByStatus,
  getUpcomingEvents,
} from '../services/dashboardService';
import {
  buildDashboardSummary,
  calculateSalesByCategory,
  calculateTotalRevenue,
} from '../utils/dashboardCalculations';

describe('dashboardService', () => {
  it('exposes an async API so it can later be swapped for HTTP calls', () => {
    expect(getDashboardSummary()).toBeInstanceOf(Promise);
    expect(getTicketSalesBreakdown()).toBeInstanceOf(Promise);
    expect(getMonthlyRevenue()).toBeInstanceOf(Promise);
    expect(getPopularEvents()).toBeInstanceOf(Promise);
    expect(getAllEvents()).toBeInstanceOf(Promise);
    expect(getUpcomingEvents()).toBeInstanceOf(Promise);
    expect(getCalendarEvents()).toBeInstanceOf(Promise);
  });

  describe('getDashboardSummary', () => {
    it('derives the summary from the seed data', async () => {
      const summary = await getDashboardSummary();

      expect(summary).toEqual(buildDashboardSummary(events, bookings));
      expect(summary.totalEvents).toBe(events.length);
      expect(summary.totalBookings).toBe(bookings.length);
    });

    it('counts revenue from paid bookings only', async () => {
      const summary = await getDashboardSummary();

      expect(summary.totalRevenue).toBe(calculateTotalRevenue(bookings));
      expect(summary.paidBookings + summary.pendingBookings + summary.failedBookings).toBe(
        summary.totalBookings,
      );
      expect(summary.totalRevenue).toBeGreaterThan(0);
      expect(summary.outstandingRevenue).toBeGreaterThan(0);
      expect(summary.failedRevenue).toBeGreaterThan(0);
    });

    it('keeps ticket totals consistent with capacity', async () => {
      const summary = await getDashboardSummary();

      expect(summary.totalTicketsSold).toBeLessThanOrEqual(summary.totalTicketCapacity);
      expect(summary.ticketOccupancyRate).toBeGreaterThanOrEqual(0);
      expect(summary.ticketOccupancyRate).toBeLessThanOrEqual(100);
    });
  });

  describe('getTicketSalesBreakdown', () => {
    it('matches the calculation layer and totals the same tickets as the summary', async () => {
      const breakdown = await getTicketSalesBreakdown();
      const summary = await getDashboardSummary();

      expect(breakdown).toEqual(calculateSalesByCategory(events));

      const soldFromBreakdown = breakdown.reduce((sum, row) => sum + row.ticketsSold, 0);
      expect(soldFromBreakdown).toBe(summary.totalTicketsSold);
    });
  });

  describe('getTicketSalesByStatus', () => {
    it('splits the full ticket capacity across the three donut buckets', async () => {
      const buckets = await getTicketSalesByStatus();
      const summary = await getDashboardSummary();
      const bucketTotal = buckets.reduce((sum, bucket) => sum + bucket.tickets, 0);

      expect(buckets.map((bucket) => bucket.status)).toEqual([
        'sold-out',
        'fully-booked',
        'available',
      ]);
      expect(bucketTotal).toBe(summary.totalTicketCapacity);
      expect(buckets.every((bucket) => bucket.tickets >= 0)).toBe(true);
    });
  });

  describe('getFeaturedEvent', () => {
    it('returns the soonest upcoming event', async () => {
      const featured = await getFeaturedEvent();
      const upcoming = await getUpcomingEvents();

      expect(featured).not.toBeNull();
      expect(featured?.id).toBe(upcoming[0].id);
      expect(featured?.status).toBe('upcoming');
    });
  });

  describe('getMonthlyRevenue', () => {
    it('returns six months by default, oldest first', async () => {
      const points = await getMonthlyRevenue();

      expect(points).toHaveLength(6);
      expect(points.map((point) => point.month)).toEqual(
        [...points.map((point) => point.month)].sort(),
      );
      expect(points.every((point) => point.revenue >= 0)).toBe(true);
    });

    it('sums to the total paid revenue across a full year', async () => {
      const points = await getMonthlyRevenue(12);
      const monthlyTotal = points.reduce((sum, point) => sum + point.revenue, 0);

      expect(monthlyTotal).toBe(calculateTotalRevenue(bookings));
    });
  });

  describe('getPopularEvents', () => {
    it('ranks events by tickets sold and honours the limit', async () => {
      const popular = await getPopularEvents(3);

      expect(popular).toHaveLength(3);
      const sold = popular.map((event) => event.ticketsSold);
      expect(sold).toEqual([...sold].sort((a, b) => b - a));

      const mostPopular = popular[0];
      const topSeedEvent = [...events].sort((a, b) => b.ticketsSold - a.ticketsSold)[0];
      expect(mostPopular.id).toBe(topSeedEvent.id);
    });
  });

  describe('getAllEvents', () => {
    it('returns every event, soonest first', async () => {
      const allEvents = await getAllEvents();
      const dates = allEvents.map((event) => event.date);

      expect(allEvents).toHaveLength(events.length);
      expect(dates).toEqual([...dates].sort());
    });
  });

  describe('getUpcomingEvents', () => {
    it('returns only upcoming events in chronological order', async () => {
      const upcoming = await getUpcomingEvents();
      const dates = upcoming.map((event) => event.date);

      expect(upcoming.length).toBeGreaterThan(0);
      expect(upcoming.every((event) => event.status === 'upcoming')).toBe(true);
      expect(dates).toEqual([...dates].sort());
      expect(upcoming.every((event) => new Date(event.date).getTime() > Date.now())).toBe(true);
    });
  });

  describe('getCalendarEvents', () => {
    it('returns the events scheduled in the current month', async () => {
      const today = new Date();
      const calendarEvents = await getCalendarEvents(today);

      expect(calendarEvents.length).toBeGreaterThan(0);
      expect(
        calendarEvents.every(
          (event) => new Date(event.date).getMonth() === today.getMonth(),
        ),
      ).toBe(true);
    });

    it('returns an empty list for a month without events', async () => {
      const calendarEvents = await getCalendarEvents(new Date(2000, 0, 15));
      expect(calendarEvents).toEqual([]);
    });
  });
});
