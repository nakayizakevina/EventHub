import type { ReportCategoryRow } from '../../types/reports';
import { Pill } from '../shared/Pill';
import { SectionCard } from '../shared/SectionCard';

const CURRENCY_FORMAT = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

interface CategoryPerformanceProps {
  rows: ReportCategoryRow[];
  /** Category scope shown in the card header pill. */
  categoryLabel: string;
  className?: string;
}

/**
 * Per-category breakdown: period revenue on the top line, with the
 * category's occupancy (tickets sold vs capacity) as a progress bar.
 * Rows arrive highest selling first.
 */
export function CategoryPerformance({ rows, categoryLabel, className }: CategoryPerformanceProps) {
  return (
    <SectionCard title="Category Performance" action={<Pill>{categoryLabel}</Pill>} className={className}>
      {rows.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm font-medium text-slate-700">No categories in scope</p>
          <p className="mt-1 text-sm text-slate-500">Try clearing the category filter.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => (
            <li key={row.category}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{row.category}</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {CURRENCY_FORMAT.format(row.revenue)}
                </span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{ width: `${row.occupancyRate}%` }}
                />
              </div>
              <p className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span className="tabular-nums">
                  {row.ticketsSold.toLocaleString()} of {row.ticketCapacity.toLocaleString()} tickets
                </span>
                <span className="font-semibold text-slate-600">{row.occupancyRate}%</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
