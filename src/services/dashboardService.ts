/**
 * Data access layer for the dashboard.
 *
 * Every function is `async` and returns a `Promise`, mirroring the shape of
 * a future REST/GraphQL API. Components are written against this contract
 * today, so replacing the seed lookups with `fetch(...)` calls later only
 * requires changing the bodies of these functions — no UI rewrites.
 *
 * All figures are derived from the seed data via `dashboardCalculations`;
 * nothing is hardcoded at this layer either.
 */
import { bookings, events } from '../data/seed';
import type {
  DashboardSummary,
  MonthlyRevenuePoint,
  PopularEvent,
  TicketSalesByCategory,
  TicketSalesByStatus,
} from '../types/dashboard';
import type { EventItem } from '../types/event';
import {
  buildDashboardSummary,
  calculatePopularEvents,
  calculateSalesByCategory,
  calculateTicketSalesByStatus,
  filterEventsInMonth,
  filterUpcomingEvents,
  groupPaidRevenueByMonth,
} from '../utils/dashboardCalculations';

/** Headline figures for the dashboard overview. */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  return buildDashboardSummary(events, bookings);
}

/** Ticket sales broken down by event category (highest selling first). */
export async function getTicketSalesBreakdown(): Promise<TicketSalesByCategory[]> {
  return calculateSalesByCategory(events);
}

/**
 * Paid revenue per calendar month (oldest first).
 *
 * @param monthCount Number of months of history to return (default 6).
 */
export async function getMonthlyRevenue(monthCount = 6): Promise<MonthlyRevenuePoint[]> {
  return groupPaidRevenueByMonth(bookings, monthCount);
}

/** Events ranked by tickets sold, most popular first. */
export async function getPopularEvents(limit = 5): Promise<PopularEvent[]> {
  return calculatePopularEvents(events, bookings, limit);
}

/** All events, soonest first. */
export async function getAllEvents(): Promise<EventItem[]> {
  return [...events].sort((a, b) => a.date.localeCompare(b.date));
}

/** Upcoming events only, soonest first. */
export async function getUpcomingEvents(): Promise<EventItem[]> {
  return filterUpcomingEvents(events);
}

/**
 * Events taking place in a given calendar month — the data source for the
 * calendar view.
 *
 * @param month Any date inside the desired month; defaults to "now".
 */
export async function getCalendarEvents(month: Date = new Date()): Promise<EventItem[]> {
  return filterEventsInMonth(events, month);
}

/** Ticket pool grouped by event fullness (powers the donut chart). */
export async function getTicketSalesByStatus(): Promise<TicketSalesByStatus[]> {
  return calculateTicketSalesByStatus(events);
}

/** The next upcoming event, used for the featured-event card. */
export async function getFeaturedEvent(): Promise<EventItem | null> {
  return filterUpcomingEvents(events)[0] ?? null;
}
