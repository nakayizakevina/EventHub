import { CalendarCheck, ClipboardList, Clock, XCircle, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getBookingSummary } from '../../services/bookingService';
import type { BookingSummary } from '../../types/bookings';

interface SummaryMetric {
  label: string;
  icon: LucideIcon;
  value: (summary: BookingSummary) => number;
}

/** Four overview cards: total, confirmed, pending and cancelled bookings. */
const METRICS: SummaryMetric[] = [
  { label: 'Total Bookings', icon: ClipboardList, value: (s) => s.total },
  { label: 'Confirmed', icon: CalendarCheck, value: (s) => s.confirmed },
  { label: 'Pending', icon: Clock, value: (s) => s.pending },
  { label: 'Cancelled', icon: XCircle, value: (s) => s.cancelled },
];

/**
 * Bookings overview stat cards — every figure comes from the bookings
 * summary (seed data), never from hardcoded values.
 */
export function BookingsStats() {
  const [summary, setSummary] = useState<BookingSummary | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isActive = true;

    getBookingSummary()
      .then((data) => {
        if (isActive) {
          setSummary(data);
        }
      })
      .catch(() => {
        if (isActive) {
          setError(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (error) {
    return <p className="text-sm text-red-600">Booking summary could not be loaded.</p>;
  }

  return (
    <section
      aria-label="Bookings summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {METRICS.map((metric) => {
        const Icon = metric.icon;

        return (
          <article key={metric.label} className="card flex items-center gap-4 p-5">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white"
            >
              <Icon size={22} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-500">{metric.label}</p>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">
                {summary ? metric.value(summary).toLocaleString() : '—'}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
