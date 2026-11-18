/**
 * Domain model for an event hosted on the EventHub platform.
 */

/**
 * Lifecycle status of an event.
 *
 * `draft` is an unpublished event managed on the Events page; the
 * dashboard seed data never contains drafts.
 */
export type EventStatus = 'upcoming' | 'active' | 'completed' | 'draft';

/** High-level grouping used for filtering and reporting. */
export type EventCategory =
  | 'Music'
  | 'Sports'
  | 'Fashion'
  | 'Technology'
  | 'Food & Culinary';

/** Delivery mode of an event (chosen when the event is created). */
export type EventType = 'Physical' | 'Online';

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
  /** ISO 8601 date-time of the event end (set when created via the form). */
  endDate?: string;
  /** Physical or Online — set when created via the form. */
  eventType?: EventType;
}

/**
 * Payload accepted by `createEvent` for events created through the UI.
 *
 * Dates are already ISO 8601 strings (converted from the `datetime-local`
 * form values before submission), so the service stays presentation-agnostic.
 */
export interface CreateEventInput {
  title: string;
  description: string;
  category: EventCategory;
  /** ISO 8601 date-time of the event start. */
  start: string;
  /** ISO 8601 date-time of the event end (always after `start`). */
  end: string;
  /** Venue name for physical events, meeting link/place for online ones. */
  location: string;
  eventType: EventType;
  /** Resolved cover image — an object URL for uploads, or a fallback URI. */
  image: string;
}
