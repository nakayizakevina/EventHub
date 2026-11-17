import { CalendarDays, ClipboardList, Ticket, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getDashboardSummary } from '../../services/dashboardService';
import type { DashboardSummary } from '../../types/dashboard';

interface SummaryMetric {
  label: string;
  icon: LucideIcon;
  value: (summary: DashboardSummary) => number;
}

const METRICS: SummaryMetric[] = [
  { label: 'Upcoming Events', icon: CalendarDays, value: (s) => s.upcomingEvents },
  { label: 'Total Bookings', icon: ClipboardList, value: (s) => s.totalBookings },
  { label: 'Tickets Sold', icon: Ticket, value: (s) => s.totalTicketsSold },
];

/**
 * Three headline stat cards — every figure comes from the dashboard
 * summary (seed data), never from hardcoded values.
 */
export function SummaryCards() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isActive = true;

    getDashboardSummary()
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
    return <p className="text-sm text-red-600">Summary data could not be loaded.</p>;
  }

  return (
    <section
      aria-label="Dashboard summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
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
