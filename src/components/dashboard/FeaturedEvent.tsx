import { format, parseISO } from 'date-fns';
import { CalendarDays, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getFeaturedEvent } from '../../services/dashboardService';
import type { EventItem } from '../../types/event';

interface FeaturedEventProps {
  className?: string;
}

/**
 * Featured upcoming event card (right-hand column) — image, category,
 * venue, description, date/time and a View Details action.
 */
export function FeaturedEvent({ className }: FeaturedEventProps) {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isActive = true;

    getFeaturedEvent()
      .then((data) => {
        if (isActive) {
          setEvent(data);
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
    <section className={`card overflow-hidden ${className ?? ''}`}>
      {event === null ? (
        <p className="p-5 text-sm text-slate-500">
          {error ? 'Featured event could not be loaded.' : 'Loading featured event…'}
        </p>
      ) : (
        <>
          <div className="relative">
            <img
              src={event.image}
              alt=""
              className="h-44 w-full object-cover"
              loading="lazy"
            />
            <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
              {event.category}
            </span>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <p className="text-sm font-semibold capitalize text-slate-900">
                {event.title}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                <span className="capitalize">{event.status}</span>
                <span aria-hidden="true"> • </span>
                {event.venue}
              </p>
            </div>

            {event.description && (
              <p className="text-sm leading-relaxed text-slate-500">{event.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm font-medium text-orange-600">
                <CalendarDays size={16} aria-hidden="true" />
                {format(parseISO(event.date), 'MMM dd, yyyy')}
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                <Clock size={16} aria-hidden="true" />
                {format(parseISO(event.date), 'h:mm a')}
              </span>
            </div>

            <Link
              to="/events"
              className="inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            >
              View Details
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
