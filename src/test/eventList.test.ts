import { describe, expect, it } from 'vitest';

import type { EventItem } from '../types/event';
import { filterEvents, sortEventsForListing, summarizeEvents } from '../utils/eventList';

/** Compact event factory for fixtures. */
function makeEvent(overrides: Partial<EventItem> & Pick<EventItem, 'id'>): EventItem {
  return {
    title: 'Sample Event',
    category: 'Music',
    date: new Date(2026, 5, 15, 18).toISOString(),
    venue: 'Sample Venue',
    status: 'upcoming',
    ticketCapacity: 100,
    ticketsSold: 50,
    image: '/images/events/sample.svg',
    ...overrides,
  };
}

describe('summarizeEvents', () => {
  it('counts total, upcoming, completed and draft events', () => {
    const statistics = summarizeEvents([
      makeEvent({ id: 'e1', status: 'upcoming' }),
      makeEvent({ id: 'e2', status: 'active' }),
      makeEvent({ id: 'e3', status: 'completed' }),
      makeEvent({ id: 'e4', status: 'draft' }),
      makeEvent({ id: 'e5', status: 'draft' }),
    ]);

    expect(statistics).toEqual({ total: 5, upcoming: 1, completed: 1, draft: 2 });
  });

  it('returns zeroed statistics for an empty list', () => {
    expect(summarizeEvents([])).toEqual({ total: 0, upcoming: 0, completed: 0, draft: 0 });
  });
});

describe('filterEvents', () => {
  const events = [
    makeEvent({ id: 'e1', title: 'Afrobeat Night Live', category: 'Music', status: 'upcoming' }),
    makeEvent({
      id: 'e2',
      title: 'Kampala City Marathon',
      category: 'Sports',
      status: 'completed',
    }),
    makeEvent({ id: 'e3', title: 'Women in Tech Summit', category: 'Technology', status: 'draft' }),
  ];

  it('returns every event when nothing is filtered', () => {
    const result = filterEvents(events, { search: '', status: 'all', category: 'all' });
    expect(result.map((event) => event.id)).toEqual(['e1', 'e2', 'e3']);
  });

  it('matches titles case-insensitively', () => {
    const result = filterEvents(events, { search: 'afro', status: 'all', category: 'all' });
    expect(result.map((event) => event.id)).toEqual(['e1']);
  });

  it('ignores surrounding whitespace in the search text', () => {
    const result = filterEvents(events, { search: '  MARATHON  ', status: 'all', category: 'all' });
    expect(result.map((event) => event.id)).toEqual(['e2']);
  });

  it('filters by status', () => {
    const result = filterEvents(events, { search: '', status: 'draft', category: 'all' });
    expect(result.map((event) => event.id)).toEqual(['e3']);
  });

  it('filters by category', () => {
    const result = filterEvents(events, { search: '', status: 'all', category: 'Sports' });
    expect(result.map((event) => event.id)).toEqual(['e2']);
  });

  it('combines search, status and category', () => {
    const result = filterEvents(events, { search: 'summit', status: 'draft', category: 'Technology' });
    expect(result.map((event) => event.id)).toEqual(['e3']);
  });

  it('returns an empty list when nothing matches', () => {
    const result = filterEvents(events, { search: 'zzz', status: 'all', category: 'all' });
    expect(result).toEqual([]);
  });
});

describe('sortEventsForListing', () => {
  it('lists ongoing/upcoming soonest first, then drafts, then completed (most recent first)', () => {
    const events = [
      makeEvent({ id: 'older-completed', status: 'completed', date: new Date(2026, 0, 10).toISOString() }),
      makeEvent({ id: 'draft', status: 'draft', date: new Date(2026, 6, 1).toISOString() }),
      makeEvent({ id: 'later-upcoming', status: 'upcoming', date: new Date(2026, 5, 1).toISOString() }),
      makeEvent({ id: 'soonest-active', status: 'active', date: new Date(2026, 4, 1).toISOString() }),
      makeEvent({ id: 'newer-completed', status: 'completed', date: new Date(2026, 1, 20).toISOString() }),
    ];

    const sorted = sortEventsForListing(events);

    expect(sorted.map((event) => event.id)).toEqual([
      'soonest-active',
      'later-upcoming',
      'draft',
      'newer-completed',
      'older-completed',
    ]);
  });

  it('does not mutate the input list', () => {
    const events = [
      makeEvent({ id: 'e1', status: 'completed' }),
      makeEvent({ id: 'e2', status: 'upcoming' }),
    ];
    const originalOrder = events.map((event) => event.id);

    sortEventsForListing(events);

    expect(events.map((event) => event.id)).toEqual(originalOrder);
  });
});
