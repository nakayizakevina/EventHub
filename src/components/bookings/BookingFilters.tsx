import { Search, X } from 'lucide-react';

import type { BookingDisplayStatus, BookingFilterState } from '../../types/bookings';

const STATUS_OPTIONS: { value: BookingDisplayStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
];

const SELECT_CLASSES =
  'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40';

interface BookingFiltersProps {
  filters: BookingFilterState;
  /** Events that have at least one booking (for the event dropdown). */
  events: { id: string; title: string }[];
  /** Number of rows currently shown (after filtering). */
  resultCount: number;
  onChange: (filters: BookingFilterState) => void;
}

/**
 * Search box plus status and event dropdowns for the bookings table.
 * Fully controlled by the page; renders a clear button when a filter is active.
 */
export function BookingFilters({ filters, events, resultCount, onChange }: BookingFiltersProps) {
  const hasActiveFilters =
    filters.query.trim().length > 0 || filters.status !== 'all' || filters.eventId !== 'all';

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search bookings</span>
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="Search by reference, attendee or event"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <span className="sr-only">Filter by status</span>
          <select
            value={filters.status}
            onChange={(event) =>
              onChange({ ...filters, status: event.target.value as BookingFilterState['status'] })
            }
            className={SELECT_CLASSES}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="sr-only">Filter by event</span>
          <select
            value={filters.eventId}
            onChange={(event) => onChange({ ...filters, eventId: event.target.value })}
            className={`${SELECT_CLASSES} max-w-56 truncate`}
          >
            <option value="all">All events</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </label>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => onChange({ query: '', status: 'all', eventId: 'all' })}
            className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={14} aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      <p aria-live="polite" className="text-xs text-slate-500 md:ml-auto">
        {resultCount} {resultCount === 1 ? 'booking' : 'bookings'} shown
      </p>
    </div>
  );
}
