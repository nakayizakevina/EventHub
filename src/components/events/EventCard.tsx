import { format, parseISO } from 'date-fns';
import { CalendarDays, Eye, MapPin, MoreHorizontal, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { EventItem } from '../../types/event';
import { EVENT_STATUS_LABELS, EVENT_STATUS_STYLES } from '../../utils/eventList';

interface EventCardProps {
  /** Event to render. */
  event: EventItem;
  /** Opens the read-only details dialog for this event. */
  onViewDetails: (event: EventItem) => void;
}

/**
 * Single event card for the Events page grid — cover image with category
 * and status badges, title, date/time, venue or an Online indicator, the
 * three-dot actions menu and a "View Details" action. Styling mirrors the
 * dashboard's event cards (`.card`, same badge palette).
 */
export function EventCard({ event, onViewDetails }: EventCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Close the actions menu on outside clicks and Escape. */
  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleMouseDown = (mouseEvent: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(mouseEvent.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const isOnline = event.eventType === 'Online';

  return (
    <article className="card flex flex-col overflow-hidden">
      <div className="relative">
        <img
          src={event.image}
          alt=""
          className="h-44 w-full object-cover"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {event.category}
        </span>

        <div ref={menuRef} className="absolute right-2.5 top-2.5">
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-label={`Actions for ${event.title}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-sm transition-colors hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
          >
            <MoreHorizontal size={16} aria-hidden="true" />
          </button>

          {isMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-30 mt-1.5 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  onViewDetails(event);
                }}
                className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 focus:outline-none"
              >
                <Eye size={14} aria-hidden="true" />
                View Details
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
          {event.title}
        </h3>

        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDays size={13} aria-hidden="true" className="shrink-0" />
          <span>{format(parseISO(event.date), 'EEE, MMM d yyyy · h:mm a')}</span>
        </p>

        {isOnline ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <Video size={13} aria-hidden="true" className="shrink-0" />
            Online event
          </span>
        ) : (
          <p className="flex items-start gap-1.5 text-xs text-slate-500">
            <MapPin size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${EVENT_STATUS_STYLES[event.status]}`}
          >
            {EVENT_STATUS_LABELS[event.status]}
          </span>
          <button
            type="button"
            onClick={() => onViewDetails(event)}
            className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:ring-offset-2"
          >
            <Eye size={13} aria-hidden="true" />
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}
