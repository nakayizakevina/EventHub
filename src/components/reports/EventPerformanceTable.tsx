import { format, parseISO } from 'date-fns';
import { Ticket } from 'lucide-react';

import type { ReportEventRow } from '../../types/reports';
import { Pill } from '../shared/Pill';
import { SectionCard } from '../shared/SectionCard';

interface EventPerformanceTableProps {
  rows: ReportEventRow[];
  /** Period label for the registration/revenue columns, shown as a pill. */
  periodLabel: string;
  className?: string;
}

const HEADERS = [
  'Rank',
  'Event',
  'Category',
  'Date',
  'Tickets',
  'Occupancy',
  'Registrations',
  'Revenue',
];

/**
 * All events in scope ranked by tickets sold, with occupancy, period
 * registrations and period revenue per event. Horizontally scrollable on
 * small screens, matching the bookings table behaviour.
 */
export function EventPerformanceTable({ rows, periodLabel, className }: EventPerformanceTableProps) {
  return (
    <SectionCard title="Event Performance" action={<Pill>{periodLabel}</Pill>} className={className}>
      {rows.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm font-medium text-slate-700">No events match the selected filters</p>
          <p className="mt-1 text-sm text-slate-500">Try clearing the category filter.</p>
        </div>
      ) : (
        <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                {HEADERS.map((header) => (
                  <th key={header} scope="col" className="px-3 py-3 font-semibold first:pl-0 last:pr-0">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-3 py-3.5 pl-0 font-medium text-slate-400 tabular-nums">
                    {index + 1}
                  </td>
                  <td
                    className="max-w-52 truncate px-3 py-3.5 font-medium text-slate-900"
                    title={row.title}
                  >
                    {row.title}
                  </td>
                  <td className="px-3 py-3.5 text-slate-600">{row.category}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-500">
                    {format(parseISO(row.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-slate-700 tabular-nums">
                      <Ticket size={14} aria-hidden="true" className="text-slate-400" />
                      {row.ticketsSold.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100"
                      >
                        <span
                          className="block h-full rounded-full bg-orange-500"
                          style={{ width: `${row.occupancyRate}%` }}
                        />
                      </span>
                      <span className="text-slate-600 tabular-nums">{row.occupancyRate}%</span>
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-slate-700 tabular-nums">
                    {row.registrations.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 pr-0 font-medium text-slate-900 tabular-nums">
                    ${row.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}
