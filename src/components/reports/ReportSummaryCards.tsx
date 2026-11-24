import { CalendarDays, DollarSign, Percent, Ticket, type LucideIcon } from 'lucide-react';

import type { ReportFilters, ReportSummary } from '../../types/reports';
import { REPORT_PERIOD_LABELS } from '../../utils/reportCalculations';

const CURRENCY_FORMAT = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

interface SummaryMetric {
  label: string;
  icon: LucideIcon;
  value: (summary: ReportSummary) => string;
  /** Small line clarifying which scope produced the figure. */
  caption: (filters: ReportFilters) => string;
}

const METRICS: SummaryMetric[] = [
  {
    label: 'Total Events',
    icon: CalendarDays,
    value: (s) => s.totalEvents.toLocaleString(),
    caption: (f) => (f.category === 'all' ? 'All categories' : f.category),
  },
  {
    label: 'Registrations',
    icon: Ticket,
    value: (s) => s.registrations.toLocaleString(),
    caption: (f) => `Bookings · ${REPORT_PERIOD_LABELS[f.period]}`,
  },
  {
    label: 'Occupancy Rate',
    icon: Percent,
    value: (s) => `${s.occupancyRate}%`,
    caption: () => 'Tickets sold vs capacity',
  },
  {
    label: 'Revenue',
    icon: DollarSign,
    value: (s) => CURRENCY_FORMAT.format(s.totalRevenue),
    caption: (f) => `Paid only · ${REPORT_PERIOD_LABELS[f.period]}`,
  },
];

interface ReportSummaryCardsProps {
  summary: ReportSummary;
  filters: ReportFilters;
}

/**
 * Four headline report cards — every figure comes from the report summary
 * (seed data), never from hardcoded values. The caption on each card
 * states which filter scope produced the number.
 */
export function ReportSummaryCards({ summary, filters }: ReportSummaryCardsProps) {
  return (
    <section
      aria-label="Report summary"
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
                {metric.value(summary)}
              </p>
              <p className="truncate text-xs text-slate-400">{metric.caption(filters)}</p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
