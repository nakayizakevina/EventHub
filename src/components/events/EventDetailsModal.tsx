import { format, parseISO } from 'date-fns';
import { CalendarDays, Layers, MapPin, Video, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import type { EventItem } from '../../types/event';
import { EVENT_STATUS_LABELS, EVENT_STATUS_STYLES } from '../../utils/eventList';

interface EventDetailsModalProps {
  /** Event whose details are shown. */
  event: EventItem;
  /** Closes the dialog (close icon, Escape key, backdrop click or Close). */
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Formats the event's start, appending the end time when it is known. */
function formatDateTimeRange(event: EventItem): string {
  const start = format(parseISO(event.date), 'EEE, MMM d yyyy · h:mm a');
  if (!event.endDate) {
    return start;
  }
  return `${start} – ${format(parseISO(event.endDate), 'h:mm a')}`;
}

/**
 * Read-only event details dialog. Follows the same dialog conventions as
 * `CreateEventModal` (Escape and backdrop close, `aria-modal`, focus trap
 * and focus restore) without offering any editing — the backend has been
 * removed, so this only presents the temporary frontend event data.
 */
export function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  /* Focus the dialog on open, lock background scroll, restore focus on close. */
  useEffect(() => {
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, []);

  /* Escape closes; Tab is trapped inside the dialog. */
  useEffect(() => {
    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === 'Escape') {
        onClose();
        return;
      }

      if (keyboardEvent.key !== 'Tab') {
        return;
      }

      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.getClientRects().length > 0);

      if (focusable.length === 0) {
        keyboardEvent.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (keyboardEvent.shiftKey && (active === first || active === dialog)) {
        keyboardEvent.preventDefault();
        last.focus();
      } else if (!keyboardEvent.shiftKey && (active === last || active === dialog)) {
        keyboardEvent.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isOnline = event.eventType === 'Online';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div aria-hidden="true" className="fixed inset-0 bg-slate-900/50" onClick={onClose} />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-details-title"
        tabIndex={-1}
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl focus:outline-none sm:rounded-2xl"
      >
        <div className="relative">
          <img src={event.image} alt="" className="h-44 w-full object-cover" />
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            {event.category}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-sm transition-colors hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${EVENT_STATUS_STYLES[event.status]}`}
          >
            {EVENT_STATUS_LABELS[event.status]}
          </span>

          <h2
            id="event-details-title"
            className="mt-2 text-lg font-semibold leading-snug text-slate-900"
          >
            {event.title}
          </h2>

          {event.description && (
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{event.description}</p>
          )}

          <dl className="mt-5 space-y-3.5">
            <div className="flex gap-3">
              <CalendarDays
                size={16}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-slate-400"
              />
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-400">Date &amp; time</dt>
                <dd className="mt-0.5 text-sm text-slate-700">
                  {formatDateTimeRange(event)}
                </dd>
              </div>
            </div>

            <div className="flex gap-3">
              {isOnline ? (
                <Video size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" />
              ) : (
                <MapPin size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" />
              )}
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-400">Location</dt>
                <dd className="mt-0.5 text-sm text-slate-700">
                  {isOnline ? 'Online event' : event.venue}
                  {isOnline && event.venue && (
                    <span className="mt-0.5 block text-xs text-slate-500">{event.venue}</span>
                  )}
                </dd>
              </div>
            </div>

            <div className="flex gap-3">
              <Layers size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" />
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-400">Category</dt>
                <dd className="mt-0.5 text-sm text-slate-700">{event.category}</dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
