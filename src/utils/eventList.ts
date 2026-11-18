/**
 * Pure logic for the Events page listing: headline statistics, the
 * search/status/category filters and the card-grid display order.
 *
 * Kept free of React and DOM APIs so it can be unit-tested directly
 * (see `src/test/eventList.test.ts`), mirroring `dashboardCalculations.ts`.
 *
 * Everything here operates on temporary frontend data only — there is no
 * backend, so the functions simply take the current event array in and
 * return derived data out.
 */
import type { EventCategory, EventItem, EventStatus } from '../types/event';

/** Status filter selection: every status, or one specific status. */
export type EventStatusFilter = 'all' | EventStatus;

/** Category filter selection: every category, or one specific category. */
export type EventCategoryFilter = 'all' | EventCategory;

/** Headline counts shown in the Events page summary cards. */
export interface EventStatistics {
  /** Every event in the listing, regardless of status. */
  total: number;
  upcoming: number;
  completed: number;
  draft: number;
}

/** Active search and filter state of the Events page. */
export interface EventListFilters {
  /** Free-text title search (matched case-insensitively). */
  search: string;
  status: EventStatusFilter;
  category: EventCategoryFilter;
}

/** Badge labels used for a status on the Events page. */
export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  upcoming: 'Upcoming',
  active: 'Ongoing',
  completed: 'Completed',
  draft: 'Draft',
};

/** Badge colour classes per status (same palette as the dashboard cards). */
export const EVENT_STATUS_STYLES: Record<EventStatus, string> = {
  upcoming: 'bg-orange-50 text-orange-600',
  active: 'bg-emerald-50 text-emerald-600',
  completed: 'bg-slate-100 text-slate-500',
  draft: 'bg-violet-50 text-violet-600',
};

/**
 * Summary-card statistics derived from the current event list.
 * Counts every status, so the figures update as events are added.
 */
export function summarizeEvents(events: readonly EventItem[]): EventStatistics {
  const statistics: EventStatistics = {
    total: events.length,
    upcoming: 0,
    completed: 0,
    draft: 0,
  };

  for (const event of events) {
    if (event.status === 'upcoming') {
      statistics.upcoming += 1;
    } else if (event.status === 'completed') {
      statistics.completed += 1;
    } else if (event.status === 'draft') {
      statistics.draft += 1;
    }
  }

  return statistics;
}

/**
 * Applies the title search and the status/category filters.
 * An empty search or an `'all'` selection matches everything.
 */
export function filterEvents(
  events: readonly EventItem[],
  filters: EventListFilters,
): EventItem[] {
  const query = filters.search.trim().toLowerCase();

  return events.filter((event) => {
    if (query !== '' && !event.title.toLowerCase().includes(query)) {
      return false;
    }
    if (filters.status !== 'all' && event.status !== filters.status) {
      return false;
    }
    if (filters.category !== 'all' && event.category !== filters.category) {
      return false;
    }
    return true;
  });
}

/**
 * Display order for the card grid:
 * 1. ongoing and upcoming events, soonest first,
 * 2. drafts (still being prepared),
 * 3. completed events as history, most recent first.
 */
export function sortEventsForListing(events: readonly EventItem[]): EventItem[] {
  const rank = (event: EventItem): number => {
    if (event.status === 'completed') {
      return 2;
    }
    return event.status === 'draft' ? 1 : 0;
  };

  return [...events].sort((a, b) => {
    const rankDifference = rank(a) - rank(b);
    if (rankDifference !== 0) {
      return rankDifference;
    }
    return a.status === 'completed'
      ? b.date.localeCompare(a.date)
      : a.date.localeCompare(b.date);
  });
}
