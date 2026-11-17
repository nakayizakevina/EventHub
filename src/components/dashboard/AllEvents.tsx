import { format, parseISO } from 'date-fns';
import { CalendarDays, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getUpcomingEvents } from '../../services/dashboardService';
import type { EventItem, EventStatus } from '../../types/event';
import { SectionCard } from '../shared/SectionCard';

const STATUS_STYLES: Record<EventStatus, string> = {
  upcoming: 'bg-orange-50 text-orange-600',
  active: 'bg-emerald-50 text-emerald-600',
  completed: 'bg-slate-100 text-slate-500',
};

/**
 * Event card grid ("All Events" section) — image with category badge,
 * title, venue, date and status.
 */
export function AllEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isActive = true;

    getUpcomingEvents()
      .then((data) => {
        if (isActive) {
          setEvents(data.slice(0, 3));
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

  return (
    <SectionCard
      title="All Events"
      action={
        <Link
          to="/events"
          className="text-sm font-medium text-orange-600 transition-colors hover:text-orange-700"
        >
          View All Event
        </Link>
      }
    >
      {error ? (
        <p className="text-sm text-red-600">Events could not be loaded.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {events.map((event) => (
            <article key={event.id} className="card overflow-hidden">
              <div className="relative">
                <img src={event.image} alt="" className="h-40 w-full object-cover" loading="lazy" />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                  {event.category}
                </span>
              </div>

              <div className="space-y-2 p-4">
                <h3 className="text-sm font-semibold leading-snug text-slate-900">
                  {event.title}
                </h3>
                <p className="flex items-start gap-1.5 text-xs text-slate-500">
                  <MapPin size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
                  <span className="truncate">{event.venue}</span>
                </p>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarDays size={13} aria-hidden="true" />
                    {format(parseISO(event.date), 'MMM dd, yyyy')}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[event.status]}`}
                  >
                    {event.status}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
