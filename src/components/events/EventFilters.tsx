import { ChevronDown, Search } from 'lucide-react';

import type { EventCategory } from '../../types/event';
import type { EventCategoryFilter, EventStatusFilter } from '../../utils/eventList';

interface EventFiltersProps {
  /** Current title search text. */
  search: string;
  onSearchChange: (value: string) => void;
  /** Currently selected status filter. */
  status: EventStatusFilter;
  onStatusChange: (value: EventStatusFilter) => void;
  /** Currently selected category filter. */
  category: EventCategoryFilter;
  onCategoryChange: (value: EventCategoryFilter) => void;
}

const STATUS_OPTIONS: { value: EventStatusFilter; label: string }[] = [
  { value: 'all', label: 'All Events' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'active', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'draft', label: 'Drafts' },
];

const CATEGORY_OPTIONS: EventCategoryFilter[] = [
  'all',
  'Music',
  'Sports',
  'Fashion',
  'Technology',
  'Food & Culinary',
];

const SELECT_CLASSES =
  'appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3.5 pr-9 text-sm text-slate-700 transition-colors focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/40';

/**
 * Search and filter toolbar for the Events page: a title search input, a
 * status segmented control (All Events / Upcoming / Ongoing / Completed /
 * Drafts) and a category select. All three work against the temporary
 * frontend data held by the page.
 */
export function EventFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
}: EventFiltersProps) {
  return (
    <section
      aria-label="Search and filter events"
      className="card flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="relative w-full lg:max-w-xs">
        <label htmlFor="event-search" className="sr-only">
          Search events by title
        </label>
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          id="event-search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search events by title…"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-sm text-slate-700 placeholder:text-slate-400 transition-colors focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/40"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          role="group"
          aria-label="Filter by status"
          className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1"
        >
          {STATUS_OPTIONS.map((option) => {
            const isActive = status === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onStatusChange(option.value)}
                aria-pressed={isActive}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${
                  isActive
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <label className="relative block">
          <span className="sr-only">Filter by category</span>
          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value as EventCategoryFilter)}
            className={SELECT_CLASSES}
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.filter(
              (option): option is EventCategory => option !== 'all',
            ).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </label>
      </div>
    </section>
  );
}
