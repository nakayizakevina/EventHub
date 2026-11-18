import { CalendarDays, CheckCircle2, Clock, FilePen, type LucideIcon } from 'lucide-react';

import type { EventStatistics } from '../../utils/eventList';

interface EventStatsCardsProps {
  /** Headline counts derived from the temporary frontend event data. */
  statistics: EventStatistics;
}

interface StatCard {
  label: string;
  icon: LucideIcon;
  value: (statistics: EventStatistics) => number;
}

const STAT_CARDS: StatCard[] = [
  { label: 'Total Events', icon: CalendarDays, value: (s) => s.total },
  { label: 'Upcoming Events', icon: Clock, value: (s) => s.upcoming },
  { label: 'Completed Events', icon: CheckCircle2, value: (s) => s.completed },
  { label: 'Draft Events', icon: FilePen, value: (s) => s.draft },
];

/**
 * Four summary cards for the Events page — Total, Upcoming, Completed and
 * Draft events. Every figure comes from the current event list, so the
 * cards update as soon as an event is added.
 */
export function EventStatsCards({ statistics }: EventStatsCardsProps) {
  return (
    <section
      aria-label="Event statistics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {STAT_CARDS.map((card) => {
        const Icon = card.icon;

        return (
          <article key={card.label} className="card flex items-center gap-4 p-5">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white"
            >
              <Icon size={22} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-500">{card.label}</p>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">
                {card.value(statistics).toLocaleString()}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
