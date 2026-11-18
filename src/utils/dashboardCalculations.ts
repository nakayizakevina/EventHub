/**
 * Reusable business calculations for the dashboard.
 *
 * Every function here is pure: it takes data in and returns derived data out.
 * UI components must never compute dashboard figures themselves — they call
 * these utilities (usually via `dashboardService`) instead.
 *
 * ── Documented data rules ────────────────────────────────────────────────
 * 1. REVENUE includes only bookings with `paymentStatus === 'paid'`.
 *    Pending and failed payments never contribute to revenue; their totals
 *    are reported separately as `outstandingRevenue` / `failedRevenue`.
 * 2. TICKET SALES come from `event.ticketsSold`, the authoritative
 *    per-event sold count. Ticket figures, occupancy and sales breakdowns
 *    all derive from that single field so every view agrees.
 * 3. OCCUPANCY = ticketsSold / ticketCapacity (0-100%, 1 decimal).
 * 4. `ticketsSold` never exceeds `ticketCapacity` (enforced by seed tests).
 * 5. Booking amounts are USD totals for the order (quantity x unit price).
 */
import { endOfMonth, format, isWithinInterval, startOfMonth, subMonths } from 'date-fns';

import type { Booking, PaymentStatus } from '../types/booking';
import type {
  DashboardSummary,
  MonthlyRevenuePoint,
  PopularEvent,
  TicketSalesByCategory,
  TicketSalesByStatus,
} from '../types/dashboard';
import type { EventCategory, EventItem, EventStatus } from '../types/event';

/** Rounds a monetary value to 2 decimal places to avoid floating point artefacts. */
export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** True when a booking's payment has been captured. */
export function isPaidBooking(booking: Booking): boolean {
  return booking.paymentStatus === 'paid';
}

/**
 * Total revenue from paid bookings only.
 * Pending and failed payments are deliberately excluded.
 */
export function calculateTotalRevenue(bookings: readonly Booking[]): number {
  const paidTotal = bookings
    .filter(isPaidBooking)
    .reduce((sum, booking) => sum + booking.amount, 0);
  return roundCurrency(paidTotal);
}

/** Amounts waiting on payment (excluded from revenue). */
export function calculateOutstandingRevenue(bookings: readonly Booking[]): number {
  const pendingTotal = bookings
    .filter((booking) => booking.paymentStatus === 'pending')
    .reduce((sum, booking) => sum + booking.amount, 0);
  return roundCurrency(pendingTotal);
}

/** Amounts whose payment failed (excluded from revenue). */
export function calculateFailedRevenue(bookings: readonly Booking[]): number {
  const failedTotal = bookings
    .filter((booking) => booking.paymentStatus === 'failed')
    .reduce((sum, booking) => sum + booking.amount, 0);
  return roundCurrency(failedTotal);
}

/** Counts bookings grouped by payment status. */
export function countBookingsByStatus(
  bookings: readonly Booking[],
): Record<PaymentStatus, number> {
  const counts: Record<PaymentStatus, number> = { paid: 0, pending: 0, failed: 0 };
  for (const booking of bookings) {
    counts[booking.paymentStatus] += 1;
  }
  return counts;
}

/**
 * Average value of a paid booking.
 * Returns 0 when there are no paid bookings.
 */
export function calculateAverageOrderValue(bookings: readonly Booking[]): number {
  const paidBookings = bookings.filter(isPaidBooking);
  if (paidBookings.length === 0) {
    return 0;
  }
  return roundCurrency(calculateTotalRevenue(paidBookings) / paidBookings.length);
}

/** Revenue from paid bookings belonging to a single event. */
export function calculateEventRevenue(
  bookings: readonly Booking[],
  eventId: string,
): number {
  const eventTotal = bookings
    .filter((booking) => booking.eventId === eventId && isPaidBooking(booking))
    .reduce((sum, booking) => sum + booking.amount, 0);
  return roundCurrency(eventTotal);
}

/** Percentage of an event's capacity that has been sold (0-100, 1 decimal). */
export function calculateOccupancyRate(
  event: Pick<EventItem, 'ticketsSold' | 'ticketCapacity'>,
): number {
  if (event.ticketCapacity === 0) {
    return 0;
  }
  return Math.round((event.ticketsSold / event.ticketCapacity) * 1000) / 10;
}

/** Combined ticket totals across a list of events. */
export function calculateTicketTotals(events: readonly EventItem[]): {
  ticketsSold: number;
  ticketCapacity: number;
  occupancyRate: number;
} {
  const ticketsSold = events.reduce((sum, event) => sum + event.ticketsSold, 0);
  const ticketCapacity = events.reduce((sum, event) => sum + event.ticketCapacity, 0);
  const occupancyRate =
    ticketCapacity === 0 ? 0 : Math.round((ticketsSold / ticketCapacity) * 1000) / 10;

  return { ticketsSold, ticketCapacity, occupancyRate };
}

/** Counts events grouped by lifecycle status. */
export function countEventsByStatus(
  events: readonly EventItem[],
): Record<EventStatus, number> {
  const counts: Record<EventStatus, number> = { upcoming: 0, active: 0, completed: 0, draft: 0 };
  for (const event of events) {
    counts[event.status] += 1;
  }
  return counts;
}

/**
 * Ticket sales broken down by event category, ordered by tickets sold
 * (highest first).
 */
export function calculateSalesByCategory(
  events: readonly EventItem[],
): TicketSalesByCategory[] {
  const byCategory = new Map<EventCategory, EventItem[]>();

  for (const event of events) {
    const bucket = byCategory.get(event.category) ?? [];
    bucket.push(event);
    byCategory.set(event.category, bucket);
  }

  return Array.from(byCategory.entries()).map(([category, categoryEvents]) => {
    const { ticketsSold, ticketCapacity, occupancyRate } =
      calculateTicketTotals(categoryEvents);

    return { category, ticketsSold, ticketCapacity, occupancyRate };
  });
}

/**
 * Splits the total ticket pool (sum of every event's `ticketCapacity`) into
 * three mutually exclusive buckets based on how full each event is:
 *
 * - `sold-out`      — tickets of events that are >=90% sold (effectively sold out)
 * - `fully-booked`  — tickets of events that are 70-90% sold
 * - `available`     — tickets of events that are <70% sold (most still purchasable)
 *
 * The buckets always sum to the total capacity, so the donut chart's centre
 * total matches `calculateTicketTotals().ticketCapacity`.
 */
export function calculateTicketSalesByStatus(
  events: readonly EventItem[],
): TicketSalesByStatus[] {
  const buckets = { soldOut: 0, fullyBooked: 0, available: 0 };

  for (const event of events) {
    const occupancy =
      event.ticketCapacity === 0 ? 0 : event.ticketsSold / event.ticketCapacity;
    if (occupancy >= 0.9) {
      buckets.soldOut += event.ticketCapacity;
    } else if (occupancy >= 0.7) {
      buckets.fullyBooked += event.ticketCapacity;
    } else {
      buckets.available += event.ticketCapacity;
    }
  }

  const pool = buckets.soldOut + buckets.fullyBooked + buckets.available;
  const share = (value: number): number =>
    pool === 0 ? 0 : Math.round((value / pool) * 1000) / 10;

  return [
    { status: 'sold-out', tickets: buckets.soldOut, percentage: share(buckets.soldOut) },
    {
      status: 'fully-booked',
      tickets: buckets.fullyBooked,
      percentage: share(buckets.fullyBooked),
    },
    { status: 'available', tickets: buckets.available, percentage: share(buckets.available) },
  ];
}

/**
 * Paid revenue grouped by calendar month.
 *
 * @param bookings  All bookings (only paid ones are summed).
 * @param monthCount How many months of history to return (including the
 *                   reference month). Months without paid bookings are
 *                   included with a revenue of 0 so charts stay continuous.
 * @param referenceDate Month to end on; defaults to "now".
 * @returns Oldest month first.
 */
export function groupPaidRevenueByMonth(
  bookings: readonly Booking[],
  monthCount: number,
  referenceDate: Date = new Date(),
): MonthlyRevenuePoint[] {
  const paidByMonth = new Map<string, number>();

  for (const booking of bookings) {
    if (!isPaidBooking(booking)) {
      continue;
    }
    const key = format(new Date(booking.createdAt), 'yyyy-MM');
    paidByMonth.set(key, (paidByMonth.get(key) ?? 0) + booking.amount);
  }

  const points: MonthlyRevenuePoint[] = [];
  for (let offset = monthCount - 1; offset >= 0; offset -= 1) {
    const monthStart = subMonths(startOfMonth(referenceDate), offset);
    const key = format(monthStart, 'yyyy-MM');
    points.push({
      month: key,
      label: format(monthStart, 'MMM yyyy'),
      revenue: roundCurrency(paidByMonth.get(key) ?? 0),
    });
  }
  return points;
}

/**
 * Most popular events by tickets sold (highest first).
 *
 * @param limit Maximum number of events to return.
 */
export function calculatePopularEvents(
  events: readonly EventItem[],
  bookings: readonly Booking[],
  limit: number,
): PopularEvent[] {
  return events
    .map((event) => ({
      id: event.id,
      title: event.title,
      category: event.category,
      ticketsSold: event.ticketsSold,
      occupancyRate: calculateOccupancyRate(event),
      revenue: calculateEventRevenue(bookings, event.id),
    }))
    .sort((a, b) => b.ticketsSold - a.ticketsSold)
    .slice(0, Math.max(limit, 0));
}

/** Events with `status === 'upcoming'`, soonest first. */
export function filterUpcomingEvents(events: readonly EventItem[]): EventItem[] {
  return events
    .filter((event) => event.status === 'upcoming')
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** All events whose start date falls inside the given calendar month, soonest first. */
export function filterEventsInMonth(
  events: readonly EventItem[],
  month: Date,
): EventItem[] {
  const interval = { start: startOfMonth(month), end: endOfMonth(month) };
  return events
    .filter((event) => isWithinInterval(new Date(event.date), interval))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Builds the full dashboard summary from raw events and bookings.
 * This is the single source of truth for the headline dashboard figures.
 */
export function buildDashboardSummary(
  events: readonly EventItem[],
  bookings: readonly Booking[],
): DashboardSummary {
  const statusCounts = countEventsByStatus(events);
  const bookingCounts = countBookingsByStatus(bookings);
  const { ticketsSold, ticketCapacity, occupancyRate } = calculateTicketTotals(events);

  return {
    totalEvents: events.length,
    upcomingEvents: statusCounts.upcoming,
    activeEvents: statusCounts.active,
    completedEvents: statusCounts.completed,
    totalTicketsSold: ticketsSold,
    totalTicketCapacity: ticketCapacity,
    ticketOccupancyRate: occupancyRate,
    totalRevenue: calculateTotalRevenue(bookings),
    outstandingRevenue: calculateOutstandingRevenue(bookings),
    failedRevenue: calculateFailedRevenue(bookings),
    averageOrderValue: calculateAverageOrderValue(bookings),
    totalBookings: bookings.length,
    paidBookings: bookingCounts.paid,
    pendingBookings: bookingCounts.pending,
    failedBookings: bookingCounts.failed,
  };
}
