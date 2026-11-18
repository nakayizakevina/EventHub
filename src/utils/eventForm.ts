/**
 * Pure logic for the Create Event form.
 *
 * Kept free of React and DOM APIs so it can be unit-tested directly
 * (see `src/test/eventForm.test.ts`), mirroring `dashboardCalculations.ts`.
 */
import type { CreateEventInput, EventCategory, EventItem, EventType } from '../types/event';

/** Raw values captured by the Create Event form (pre-validation). */
export interface EventFormValues {
  name: string;
  description: string;
  /** `''` until the user picks a category. */
  category: EventCategory | '';
  /** `datetime-local` value, e.g. "2026-12-05T19:00". */
  start: string;
  /** `datetime-local` value, e.g. "2026-12-05T22:00". */
  end: string;
  location: string;
  eventType: EventType;
}

/** Validation message per field; absent key = field is valid. */
export type EventFormErrors = Partial<Record<keyof EventFormValues, string>>;

/** Empty starting state for the form (event type has a sensible default). */
export const EMPTY_EVENT_FORM: EventFormValues = {
  name: '',
  description: '',
  category: '',
  start: '',
  end: '',
  location: '',
  eventType: 'Physical',
};

/**
 * Neutral cover used when no image is uploaded — a self-contained SVG so
 * `<img>` always has something to render without adding asset files.
 */
export const DEFAULT_EVENT_COVER: string = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">' +
    '<rect width="640" height="360" fill="#fff7ed"/>' +
    '<circle cx="320" cy="180" r="72" fill="#f97316"/>' +
    '<rect x="288" y="156" width="64" height="48" rx="10" fill="#ffffff"/>' +
    '</svg>',
)}`;

/**
 * Validates the form. Returns an empty object when every required field is
 * present and the end date/time falls after the start date/time.
 */
export function validateEventForm(values: EventFormValues): EventFormErrors {
  const errors: EventFormErrors = {};

  if (values.name.trim() === '') {
    errors.name = 'Event name is required.';
  }

  if (values.description.trim() === '') {
    errors.description = 'Event description is required.';
  }

  if (values.category === '') {
    errors.category = 'Please select an event category.';
  }

  if (values.start === '') {
    errors.start = 'Start date and time is required.';
  }

  if (values.end === '') {
    errors.end = 'End date and time is required.';
  } else if (values.start !== '' && new Date(values.end) <= new Date(values.start)) {
    errors.end = 'End date and time must be after the start date and time.';
  }

  if (values.location.trim() === '') {
    errors.location = 'Event location is required.';
  }

  return errors;
}

/** Converts validated form values into the service-level payload. */
export function toCreateEventInput(values: EventFormValues): CreateEventInput {
  return {
    title: values.name.trim(),
    description: values.description.trim(),
    category: values.category as EventCategory,
    start: new Date(values.start).toISOString(),
    end: new Date(values.end).toISOString(),
    location: values.location.trim(),
    eventType: values.eventType,
    image: DEFAULT_EVENT_COVER,
  };
}

/**
 * Maps a payload to the existing `EventItem` model.
 *
 * Ticketing fields are out of scope for this feature, so a created event
 * starts with zero capacity/sales; the list feature will extend the form
 * with ticket settings later.
 */
export function buildEventItem(
  input: CreateEventInput,
  coverImage?: string,
  now: Date = new Date(),
): EventItem {
  const start = new Date(input.start);
  const end = new Date(input.end);

  return {
    id: `evt-${now.getTime().toString(36)}`,
    title: input.title,
    category: input.category,
    date: input.start,
    endDate: input.end,
    venue: input.location,
    status: end < now ? 'completed' : start > now ? 'upcoming' : 'active',
    eventType: input.eventType,
    ticketCapacity: 0,
    ticketsSold: 0,
    image: coverImage ?? input.image,
    description: input.description,
  };
}
