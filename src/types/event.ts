/**
 * Domain model for an event hosted on the EventHub platform.
 */

/** Lifecycle status of an event. */
export type EventStatus = 'upcoming' | 'active' | 'completed';

/** High-level grouping used for filtering and reporting. */
export type EventCategory =
  | 'Music'
  | 'Sports'
  | 'Fashion'
  | 'Technology'
  | 'Food & Culinary';

/**
 * A single event.
 *
 * Named `EventItem` rather than `Event` so that it never shadows the
 * DOM `Event` global type in components.
 */
export interface EventItem {
  /** Unique, stable identifier (e.g. "evt-001"). */
  id: string;
  title: string;
  category: EventCategory;
  /** ISO 8601 date-time of the event start (e.g. "2026-12-05T19:00:00.000Z"). */
  date: string;
  /** Human readable venue, including city (e.g. "Kampala Serena Conference Centre"). */
  venue: string;
  status: EventStatus;
  /** Maximum number of tickets the event can ever sell. */
  ticketCapacity: number;
  /** Tickets sold to date. Always `<= ticketCapacity`. */
  ticketsSold: number;
  /** Path to the event image served from `public/images/events/`. */
  image: string;
  /** Short marketing blurb shown on featured/event cards. */
  description?: string;
}
