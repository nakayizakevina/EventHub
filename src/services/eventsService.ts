/**
 * Data access layer for event management (create flow).
 *
 * Follows the same contract as `dashboardService.ts`: every function is
 * `async` and returns a `Promise`, so swapping the in-memory store for
 * `fetch(...)` later does not touch any UI component.
 *
 * Created events live in a separate store from the dashboard seed data so
 * this feature cannot change any Dashboard figures.
 */
import type { CreateEventInput, EventItem } from '../types/event';
import { buildEventItem } from '../utils/eventForm';

/** In-memory store standing in for the backend's event collection. */
const createdEvents: EventItem[] = [];

/** Simulated network latency so loading states are visible in the UI. */
const MOCK_LATENCY_MS = 600;

/**
 * Persists a new event and returns the stored `EventItem`.
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
