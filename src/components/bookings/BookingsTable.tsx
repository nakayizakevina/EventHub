import { format, parseISO } from 'date-fns';
import { Eye, Ticket } from 'lucide-react';

import type { BookingRow } from '../../types/bookings';

import { BookingStatusBadge } from './BookingStatusBadge';

interface BookingsTableProps {
  rows: BookingRow[];
  /** Opens the details dialog for a row. */
  onSelect: (row: BookingRow) => void;
}

const HEADERS = [
  'Reference',
  'Attendee',
  'Event',
  'Tickets',
  'Date',
  'Amount',
  'Status',
  'Actions',
];

/**
 * Bookings table — reference, attendee, event, tickets, date, amount and
 * status, newest booking first. Horizontally scrollable on small screens;
 * each row opens a details dialog via the "View" action.
 */
export function BookingsTable({ rows, onSelect }: BookingsTableProps) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
            {HEADERS.map((header) => (
              <th
                key={header}
                scope="col"
                className={`px-3 py-3 font-semibold first:pl-0 last:pr-0 ${
                  header === 'Actions' ? 'sr-only' : ''
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-50 last:border-0">
              <td className="px-3 py-3.5 pl-0 font-medium text-slate-900">{row.id}</td>
              <td className="px-3 py-3.5 text-slate-700">
                {row.attendeeName ?? <span className="text-slate-500">Anonymous</span>}
              </td>
              <td className="max-w-48 truncate px-3 py-3.5 text-slate-700" title={row.eventTitle}>
                {row.eventTitle}
              </td>
              <td className="px-3 py-3.5">
                <span className="inline-flex items-center gap-1.5 text-slate-700 tabular-nums">
                  <Ticket size={14} aria-hidden="true" className="text-slate-400" />
                  {row.ticketQuantity}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-3.5 text-slate-500">
                {format(parseISO(row.createdAt), 'MMM dd, yyyy')}
              </td>
              <td className="whitespace-nowrap px-3 py-3.5 font-medium text-slate-900 tabular-nums">
                ${row.amount.toLocaleString()}
              </td>
              <td className="px-3 py-3.5">
                <BookingStatusBadge status={row.status} />
              </td>
              <td className="px-3 py-3.5 pr-0 text-right">
                <button
                  type="button"
                  onClick={() => onSelect(row)}
                  aria-label={`View details for booking ${row.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-50"
                >
                  <Eye size={14} aria-hidden="true" />
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
