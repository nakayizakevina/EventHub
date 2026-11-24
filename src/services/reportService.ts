/**
 * Data access layer for the Reports page.
 *
 * Mirrors the contract of `dashboardService` / `bookingService`: every
 * function is `async` and returns a `Promise`, so replacing the seed
 * lookups with `fetch(...)` later only changes these function bodies —
 * no Reports UI needs rewriting.
 *
 * This is the single place where the report filters (period + category)
 * are applied to the seed data; all figures are derived by
 * `reportCalculations`, never hardcoded here.
 */
import { bookings, events } from '../data/seed';
import type { ReportData, ReportFilters } from '../types/reports';
import {
  buildCategoryRows,
  buildReportEventRows,
  buildReportSummary,
  filterBookingsByScope,
  filterEventsByCategory,
  groupReportTrends,
  resolvePeriodStart,
} from '../utils/reportCalculations';

/**
 * Everything the Reports page renders for the given filters, fetched in
 * one round trip so the page only manages a single loading/error state.
 *
 * @param filters Selected period and event category.
 */
export async function getReportData(filters: ReportFilters): Promise<ReportData> {
  const referenceDate = new Date();
  const periodStart = resolvePeriodStart(filters.period, referenceDate);

  const scopedEvents = filterEventsByCategory(events, filters.category);
  const scopedEventIds = new Set(scopedEvents.map((event) => event.id));
  const scopedBookings = filterBookingsByScope(bookings, scopedEventIds, periodStart);

  return {
    summary: buildReportSummary(scopedEvents, scopedBookings),
    trends: groupReportTrends(scopedEvents, scopedBookings, periodStart, referenceDate),
    categories: buildCategoryRows(scopedEvents, scopedBookings),
    eventRows: buildReportEventRows(scopedEvents, scopedBookings),
  };
}
