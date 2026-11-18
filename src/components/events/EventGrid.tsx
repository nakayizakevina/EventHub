import { SearchX } from 'lucide-react';

import type { EventItem } from '../../types/event';

import { EventCard } from './EventCard';

interface EventGridProps {
  /** Events left after searching and filtering. */
  events: EventItem[];
  /** True while a search or filter is narrowing the listing. */
  hasActiveFilters: boolean;
  /** Resets the search box and both filters. */
  onClearFilters: () => void;
  /** Opens the read-only details dialog for an event. */
  onViewDetails: (event: EventItem) => void;
}

/**
 * Responsive event card grid (1 column on mobile, 2 on tablet, 3 on
 * desktop) with a friendly empty state when nothing matches the current
 * search or filters.
 */
export function EventGrid({
  events,
  hasActiveFilters,
  onClearFilters,
  onViewDetails,
}: EventGridProps) {
  if (events.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center px-6 py-12 text-center">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500"
        >
          <SearchX size={22} />
        </span>
        <h2 className="mt-4 text-base font-semibold text-slate-900">No events found</h2>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          {hasActiveFilters
            ? 'No events match your current search or filters.'
            : 'Events you create will appear here.'}
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-5 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} onViewDetails={onViewDetails} />
      ))}
    </div>
  );
}
