/**
 * Read models (DTOs) returned by the report service.
 *
 * Same contract as `types/dashboard.ts`: these shapes are what the Reports
 * page consumes, derived from the `EventItem` and `Booking` seed data by
 * `reportCalculations` — never hardcoded inside components.
 *
 * Scoping rules applied by the service before these DTOs are built:
 * - `category` scopes every section (events, and the bookings that belong
 *   to them).
 * - `period` scopes booking-driven figures only (registrations, revenue,
 *   trend points); event-driven figures (event counts, tickets sold,
 *   occupancy) are current-state and therefore always all-time.
 */
import type { EventCategory } from './event';

/**
 * Reporting window: the last N calendar months (including the current
 * one) or `'all'` for the full history available in the data.
 */
export type ReportPeriod = '3m' | '6m' | '12m' | 'all';

/** Active filter state controlling the whole report. */
export interface ReportFilters {
  period: ReportPeriod;
  /** `'all'` disables category filtering. */
  category: EventCategory | 'all';
}

/** Headline figures shown in the report's summary cards. */
export interface ReportSummary {
  /** Events matching the category filter (all-time). */
  totalEvents: number;
  /** Bookings placed inside the period for the events in scope. */
  registrations: number;
  /** Tickets sold across the events in scope (all-time). */
  totalTicketsSold: number;
  /** Capacity across the events in scope (all-time). */
  totalTicketCapacity: number;
  /** Percentage of capacity sold, 0-100, rounded to one decimal. */
  occupancyRate: number;
  /** Paid bookings inside the period for the events in scope (USD). */
  totalRevenue: number;
}

/** One month of registration and attendance activity. */
export interface ReportTrendPoint {
  /** Month key in `yyyy-MM` form (stable identifier for charts). */
  month: string;
  /** Display label such as "Nov 2026". */
  label: string;
  /** Bookings created in this month (all payment statuses). */
  registrations: number;
  /**
   * Tickets sold by events held in this month (completed and active
   * events only — upcoming events have not taken place yet).
   */
  attendance: number;
}

/** Ticket sales and paid revenue for a single event category. */
export interface ReportCategoryRow {
  category: EventCategory;
  ticketsSold: number;
  ticketCapacity: number;
  /** Percentage of capacity sold, 0-100, rounded to one decimal. */
  occupancyRate: number;
  /** Paid bookings inside the period for this category's events (USD). */
  revenue: number;
}

/** One event, ranked and ready for the performance table. */
export interface ReportEventRow {
  id: string;
  title: string;
  category: EventCategory;
  /** ISO 8601 date-time of the event start. */
  date: string;
  ticketsSold: number;
  /** Percentage of capacity sold, 0-100, rounded to one decimal. */
  occupancyRate: number;
  /** Bookings placed inside the period for this event. */
  registrations: number;
  /** Paid bookings inside the period for this event (USD). */
  revenue: number;
}

/** Everything the Reports page renders, fetched in one round trip. */
export interface ReportData {
  summary: ReportSummary;
  /** Oldest month first; one point per month in the selected period. */
  trends: ReportTrendPoint[];
  /** Categories with sales in scope, highest selling first. */
  categories: ReportCategoryRow[];
  /** Events in scope ranked by tickets sold, highest first. */
  eventRows: ReportEventRow[];
}
