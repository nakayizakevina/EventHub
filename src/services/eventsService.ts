/**
 * Data access layer for the Events page (frontend-only).
 *
 * There is no backend: every function reads or updates in-memory arrays,
 * so swapping the bodies for `fetch(...)` later does not touch any UI
 * component. Follows the same async contract as `dashboardService.ts`.
 *
 * `listEvents` merges the seed events with anything created in this
 * session. Created events live in their own store (the seed arrays are
 * never mutated), so this feature cannot change any Dashboard figure.
 */
import { draftEvents, events } from '../data/seed';
import type { CreateEventInput, EventItem } from '../types/event';
import { buildEventItem } from '../utils/eventForm';

/** Events created during this session (frontend-only, never persisted). */
const createdEvents: EventItem[] = [];

/** Simulated network latency so loading states are visible in the UI. */
const MOCK_LATENCY_MS = 600;

/**
 * All temporary frontend events for the Events page listing: the seed
 * events plus drafts plus anything created in this session.
 */
export async function listEvents(): Promise<EventItem[]> {
  return [...events, ...draftEvents, ...createdEvents];
}

/**
 * Builds a new event from the Create Event form and remembers it for this
 * session. The caller adds the returned event to its own state so the
 * listing and the statistics update immediately.
 *
 * @throws if the request is interrupted (never with the mock store).
 */
export async function createEvent(input: CreateEventInput): Promise<EventItem> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, MOCK_LATENCY_MS);
  });

  const event = buildEventItem(input);
  createdEvents.push(event);
  return event;
}
