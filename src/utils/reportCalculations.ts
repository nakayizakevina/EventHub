/**
 * Reusable business calculations for the Reports page.
 *
 * Every function here is pure: data in, derived data out. Components never
 * compute report figures themselves — they call these utilities (via
 * `reportService`) instead, exactly like the dashboard and bookings pages.
 *
 * ── Documented data rules ────────────────────────────────────────────────
 * 1. SCOPE: `category` filters events (and, through them, their bookings);
 *    `period` filters bookings by `createdAt`. Event-driven figures (event
 *    counts, tickets sold, occupancy) are current-state, so the period only
 *    ever narrows booking-driven figures.
 * 2. REVENUE includes only bookings with `paymentStatus === 'paid'` —
 *    reuses `dashboardCalculations.calculateTotalRevenue`, so the report
 *    and the dashboard always agree.
 * 3. REGISTRATIONS count bookings of any payment status placed inside the
 *    period (a registration exists even when its payment failed).
 * 4. ATTENDANCE per month is the `ticketsSold` of events *held* in that
 *    month (`completed` or `active` only). The seed has no check-in data,
 *    so sold tickets of events that have taken place are the honest
 *    turnout proxy; upcoming events never contribute.
 * 5. OCCUPANCY = ticketsSold / ticketCapacity (0-100%, 1 decimal), reusing
 *    the shared dashboard helpers.
 */
import { addMonths, format, startOfMonth, subMonths } from 'date-fns';

import type { Booking } from '../types/booking';
import type { EventCategory, EventItem } from '../types/event';
import type {
  ReportCategoryRow,
  ReportEventRow,
  ReportFilters,
  ReportPeriod,
  ReportSummary,
  ReportTrendPoint,
} from '../types/reports';

import {
  calculateOccupancyRate,
  calculateTicketTotals,
  calculateTotalRevenue,
  roundCurrency,
} from './dashboardCalculations';

/** Default filter state: a six-month window across all categories. */
export const DEFAULT_REPORT_FILTERS: ReportFilters = { period: '6m', category: 'all' };

/** Display labels for the period filter, in the order they are offered. */
export const REPORT_PERIOD_LABELS: Record<ReportPeriod, string> = {
  '3m': 'Last 3 Months',
  '6m': 'Last 6 Months',
  '12m': 'Last 12 Months',
  all: 'All Time',
};

/** Window length in calendar months for the bounded periods. */
const PERIOD_MONTHS: Record<Exclude<ReportPeriod, 'all'>, number> = {
  '3m': 3,
  '6m': 6,
  '12m': 12,
};

/**
 * Start of the reporting window, or `null` for `'all'` (full history).
 *
 * The window always includes the current calendar month, so a `'6m'`
 * period ending in November covers June through November (six months).
 *
 * @param period        Selected report period.
 * @param referenceDate Month the window ends on; defaults to "now".
 */
export function resolvePeriodStart(
  period: ReportPeriod,
  referenceDate: Date = new Date(),
): Date | null {
  if (period === 'all') {
    return null;
  }
  return subMonths(startOfMonth(referenceDate), PERIOD_MONTHS[period] - 1);
}

/** Events whose category matches the filter (`'all'` keeps everything). */
export function filterEventsByCategory(
  events: readonly EventItem[],
  category: EventCategory | 'all',
): EventItem[] {
  if (category === 'all') {
    return [...events];
  }
  return events.filter((event) => event.category === category);
}

/**
 * Bookings belonging to one of `eventIds` and placed inside the period.
 *
 * @param periodStart Window start; `null` keeps every booking (all time).
 */
export function filterBookingsByScope(
  bookings: readonly Booking[],
  eventIds: ReadonlySet<string>,
  periodStart: Date | null,
): Booking[] {
  return bookings.filter((booking) => {
    if (!eventIds.has(booking.eventId)) {
      return false;
    }
    if (periodStart !== null && new Date(booking.createdAt) < periodStart) {
      return false;
    }
    return true;
  });
}

/**
 * Headline figures for the summary cards over the scoped events and
 * bookings (see the scope rules in the module comment).
 */
export function buildReportSummary(
  events: readonly EventItem[],
  bookings: readonly Booking[],
): ReportSummary {
  const { ticketsSold, ticketCapacity, occupancyRate } = calculateTicketTotals(events);

  return {
    totalEvents: events.length,
    registrations: bookings.length,
    totalTicketsSold: ticketsSold,
    totalTicketCapacity: ticketCapacity,
    occupancyRate,
    totalRevenue: calculateTotalRevenue(bookings),
  };
}

/**
 * Monthly registration and attendance series for the trend chart.
 *
 * Months are continuous from the window start through the reference month
 * (months without activity are included with zeros so the chart stays
 * readable). For `periodStart === null` (`'all'`) the window starts at the
 * earliest scoped activity, falling back to a six-month window when there
 * is no data at all.
 *
 * @param events        Category-scoped events (attendance source).
 * @param bookings      Category- and period-scoped bookings (registrations).
 * @param periodStart   Window start, or `null` for `'all'`.
 * @param referenceDate Month the window ends on; defaults to "now".
 * @returns Oldest month first.
 */
export function groupReportTrends(
  events: readonly EventItem[],
  bookings: readonly Booking[],
  periodStart: Date | null,
  referenceDate: Date = new Date(),
): ReportTrendPoint[] {
  const windowStart =
    periodStart ?? earliestActivityMonth(events, bookings) ?? subMonths(startOfMonth(referenceDate), 5);
  const lastMonth = startOfMonth(referenceDate);
  if (windowStart.getTime() > lastMonth.getTime()) {
    return [];
  }

  const registrationsByMonth = new Map<string, number>();
  for (const booking of bookings) {
    const key = format(new Date(booking.createdAt), 'yyyy-MM');
    registrationsByMonth.set(key, (registrationsByMonth.get(key) ?? 0) + 1);
  }

  const attendanceByMonth = new Map<string, number>();
  for (const event of events) {
    // Only events that have taken place contribute attendance.
    if (event.status !== 'completed' && event.status !== 'active') {
      continue;
    }
    const key = format(new Date(event.date), 'yyyy-MM');
    attendanceByMonth.set(key, (attendanceByMonth.get(key) ?? 0) + event.ticketsSold);
  }

  const points: ReportTrendPoint[] = [];
  let cursor = windowStart;
  while (cursor.getTime() <= lastMonth.getTime()) {
    const key = format(cursor, 'yyyy-MM');
    points.push({
      month: key,
      label: format(cursor, 'MMM yyyy'),
      registrations: registrationsByMonth.get(key) ?? 0,
      attendance: attendanceByMonth.get(key) ?? 0,
    });
    cursor = addMonths(cursor, 1);
  }
  return points;
}

/**
 * Ticket sales and period revenue per event category, highest selling
 * first. Categories without any event in scope are omitted.
 */
export function buildCategoryRows(
  events: readonly EventItem[],
  bookings: readonly Booking[],
): ReportCategoryRow[] {
  const categoryByEventId = new Map(events.map((event) => [event.id, event.category]));
  const rowsByCategory = new Map<EventCategory, ReportCategoryRow>();

  for (const event of events) {
    const existing = rowsByCategory.get(event.category);
    if (existing) {
      existing.ticketsSold += event.ticketsSold;
      existing.ticketCapacity += event.ticketCapacity;
      continue;
    }
    rowsByCategory.set(event.category, {
      category: event.category,
      ticketsSold: event.ticketsSold,
      ticketCapacity: event.ticketCapacity,
      occupancyRate: 0,
      revenue: 0,
    });
  }

  for (const booking of bookings) {
    if (booking.paymentStatus !== 'paid') {
      continue;
    }
    const category = categoryByEventId.get(booking.eventId);
    const row = category === undefined ? undefined : rowsByCategory.get(category);
    if (row) {
      row.revenue += booking.amount;
    }
  }

  for (const row of rowsByCategory.values()) {
    row.occupancyRate =
      row.ticketCapacity === 0 ? 0 : Math.round((row.ticketsSold / row.ticketCapacity) * 1000) / 10;
    row.revenue = roundCurrency(row.revenue);
  }

  return Array.from(rowsByCategory.values()).sort((a, b) => {
    if (b.ticketsSold !== a.ticketsSold) {
      return b.ticketsSold - a.ticketsSold;
    }
    return a.category.localeCompare(b.category);
  });
}

/**
 * One row per scoped event with its period registrations and revenue,
 * ranked by tickets sold (highest first).
 */
export function buildReportEventRows(
  events: readonly EventItem[],
  bookings: readonly Booking[],
): ReportEventRow[] {
  const bookingsByEventId = new Map<string, Booking[]>();
  for (const booking of bookings) {
    const bucket = bookingsByEventId.get(booking.eventId) ?? [];
    bucket.push(booking);
    bookingsByEventId.set(booking.eventId, bucket);
  }

  return events
    .map((event) => {
      const eventBookings = bookingsByEventId.get(event.id) ?? [];
      return {
        id: event.id,
        title: event.title,
        category: event.category,
        date: event.date,
        ticketsSold: event.ticketsSold,
        occupancyRate: calculateOccupancyRate(event),
        registrations: eventBookings.length,
        revenue: calculateTotalRevenue(eventBookings),
      };
    })
    .sort((a, b) => {
      if (b.ticketsSold !== a.ticketsSold) {
        return b.ticketsSold - a.ticketsSold;
      }
      return a.title.localeCompare(b.title);
    });
}

/**
 * Earliest month touched by the scoped data (bookings plus events that
 * have already taken place), used to size the `'all'` window. Returns
 * `null` when there is no activity to anchor on.
 */
function earliestActivityMonth(
  events: readonly EventItem[],
  bookings: readonly Booking[],
): Date | null {
  let earliest: number | null = null;
  const consider = (iso: string): void => {
    const time = new Date(iso).getTime();
    if (earliest === null || time < earliest) {
      earliest = time;
    }
  };

  for (const booking of bookings) {
    consider(booking.createdAt);
  }
  for (const event of events) {
    if (event.status === 'completed' || event.status === 'active') {
      consider(event.date);
    }
  }

  return earliest === null ? null : startOfMonth(new Date(earliest));
}
