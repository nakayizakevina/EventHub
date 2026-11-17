/**
 * Read models (DTOs) returned by the dashboard service.
 *
 * These shapes are what UI components consume. They are derived from the
 * `EventItem` and `Booking` seed data by the calculation utilities, never
 * hardcoded inside components.
 */
import type { EventCategory } from './event';

/** Aggregate figures shown on the dashboard overview. */
export interface DashboardSummary {
  // Events
  totalEvents: number;
  upcomingEvents: number;
  activeEvents: number;
  completedEvents: number;

  // Tickets
  totalTicketsSold: number;
  totalTicketCapacity: number;
  /** Percentage of capacity sold, 0-100, rounded to one decimal. */
  ticketOccupancyRate: number;

  // Money (USD) — revenue only ever includes paid bookings.
  totalRevenue: number;
  /** Amounts in `pending` state; never included in `totalRevenue`. */
  outstandingRevenue: number;
  /** Amounts in `failed` state; never included in `totalRevenue`. */
  failedRevenue: number;
  averageOrderValue: number;

  // Bookings
  totalBookings: number;
  paidBookings: number;
  pendingBookings: number;
  failedBookings: number;
}

/** Fill-state buckets used by the ticket-sales donut chart. */
export type TicketSalesStatus = 'sold-out' | 'fully-booked' | 'available';

/** A slice of the total ticket pool grouped by event fullness. */
export interface TicketSalesByStatus {
  status: TicketSalesStatus;
  /** Number of tickets in this bucket. */
  tickets: number;
  /** Share of the total ticket pool, 0-100, rounded to one decimal. */
  percentage: number;
}

/** Ticket sales aggregated per event category. */
export interface TicketSalesByCategory {
  category: EventCategory;
  ticketsSold: number;
  ticketCapacity: number;
  /** Percentage of capacity sold, 0-100, rounded to one decimal. */
  occupancyRate: number;
}

/** Paid revenue for a single calendar month. */
export interface MonthlyRevenuePoint {
  /** Month key in `yyyy-MM` form (stable identifier for charts). */
  month: string;
  /** Display label such as "Nov 2026". */
  label: string;
  /** Sum of paid booking amounts created in that month (USD). */
  revenue: number;
}

/** An event ranked by popularity, ready for chart/table rendering. */
export interface PopularEvent {
  id: string;
  title: string;
  category: EventCategory;
  ticketsSold: number;
  /** Percentage of capacity sold, 0-100, rounded to one decimal. */
  occupancyRate: number;
  /** Revenue from paid bookings for this event (USD). */
  revenue: number;
}
