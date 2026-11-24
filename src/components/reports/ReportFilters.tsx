import { ChevronDown, X } from 'lucide-react';

import type { EventCategory } from '../../types/event';
import type { ReportFilters as ReportFilterState, ReportPeriod } from '../../types/reports';
import { DEFAULT_REPORT_FILTERS, REPORT_PERIOD_LABELS } from '../../utils/reportCalculations';

const PERIOD_OPTIONS: ReportPeriod[] = ['3m', '6m', '12m', 'all'];

const CATEGORY_OPTIONS: (EventCategory | 'all')[] = [
  'all',
  'Music',
  'Sports',
  'Fashion',
  'Technology',
  'Food & Culinary',
];

const SELECT_CLASSES =
  'appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3.5 pr-9 text-sm text-slate-700 transition-colors focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/40';

interface ReportFiltersProps {
  filters: ReportFilterState;
  onChange: (filters: ReportFilterState) => void;
}

/**
 * Period and category controls for the Reports page, plus a short note
 * explaining how each filter scopes the report. Fully controlled by the
 * page; renders a clear button whenever a non-default filter is active.
 */
export function ReportFilters({ filters, onChange }: ReportFiltersProps) {
  const hasActiveFilters = filters.period !== '6m' || filters.category !== 'all';

  return (
    <section
      aria-label="Report filters"
      className="card flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative block">
          <span className="sr-only">Report period</span>
          <select
            value={filters.period}
            onChange={(event) =>
              onChange({ ...filters, period: event.target.value as ReportPeriod })
            }
            className={SELECT_CLASSES}
          >
            {PERIOD_OPTIONS.map((period) => (
              <option key={period} value={period}>
                {REPORT_PERIOD_LABELS[period]}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </label>

        <label className="relative block">
          <span className="sr-only">Filter by category</span>
          <select
            value={filters.category}
            onChange={(event) =>
              onChange({ ...filters, category: event.target.value as ReportFilterState['category'] })
            }
            className={SELECT_CLASSES}
          >
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </label>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_REPORT_FILTERS })}
            className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={14} aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      <p className="text-xs leading-relaxed text-slate-500 md:max-w-64 md:text-right">
        Registrations, attendance and revenue follow the period; event counts and occupancy
        follow the category.
      </p>
    </section>
  );
}
