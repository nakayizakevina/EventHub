import { describe, expect, it } from 'vitest';

import { bookings, events } from '../data/seed';
import { getReportData } from '../services/reportService';
import { filterEventsByCategory } from '../utils/reportCalculations';

describe('reportService', () => {
  it('exposes an async API so it can later be swapped for HTTP calls', () => {
    expect(getReportData({ period: '6m', category: 'all' })).toBeInstanceOf(Promise);
  });

  it('returns every section the Reports page renders', async () => {
    const data = await getReportData({ period: '6m', category: 'all' });

    expect(Object.keys(data).sort()).toEqual(['categories', 'eventRows', 'summary', 'trends']);
    expect(data.trends.length).toBe(6);
    expect(data.eventRows.length).toBe(events.length);
  });

  it('scopes every section to the selected category', async () => {
    const data = await getReportData({ period: 'all', category: 'Sports' });
    const sportsEvents = filterEventsByCategory(events, 'Sports');

    expect(data.summary.totalEvents).toBe(sportsEvents.length);
    expect(data.eventRows.every((row) => row.category === 'Sports')).toBe(true);
    expect(data.categories.map((row) => row.category)).toEqual(['Sports']);
    expect(data.trends.length).toBeGreaterThan(0);
  });

  it('narrows registrations and revenue when the period shrinks', async () => {
    const allTime = await getReportData({ period: 'all', category: 'all' });
    const threeMonths = await getReportData({ period: '3m', category: 'all' });

    expect(threeMonths.trends.length).toBe(3);
    expect(threeMonths.summary.registrations).toBeLessThanOrEqual(
      allTime.summary.registrations,
    );
    expect(threeMonths.summary.totalRevenue).toBeLessThanOrEqual(allTime.summary.totalRevenue);
    expect(threeMonths.summary.totalEvents).toBe(allTime.summary.totalEvents);
  });

  it('keeps the summary consistent with the detailed sections', async () => {
    const data = await getReportData({ period: 'all', category: 'all' });

    const revenueFromRows = data.eventRows.reduce((sum, row) => sum + row.revenue, 0);
    const registrationsFromRows = data.eventRows.reduce((sum, row) => sum + row.registrations, 0);
    const ticketsFromCategories = data.categories.reduce((sum, row) => sum + row.ticketsSold, 0);

    expect(revenueFromRows).toBeCloseTo(data.summary.totalRevenue, 2);
    expect(registrationsFromRows).toBe(data.summary.registrations);
    expect(ticketsFromCategories).toBe(data.summary.totalTicketsSold);
    expect(data.summary.totalTicketsSold).toBeLessThanOrEqual(data.summary.totalTicketCapacity);
    expect(data.summary.totalRevenue).toBeGreaterThan(0);
    expect(data.summary.registrations).toBe(bookings.length);
  });

  it('ranks events by tickets sold and categories by tickets sold', async () => {
    const data = await getReportData({ period: '6m', category: 'all' });

    const soldByRow = data.eventRows.map((row) => row.ticketsSold);
    expect([...soldByRow].sort((a, b) => b - a)).toEqual(soldByRow);

    const soldByCategory = data.categories.map((row) => row.ticketsSold);
    expect([...soldByCategory].sort((a, b) => b - a)).toEqual(soldByCategory);
  });
});
