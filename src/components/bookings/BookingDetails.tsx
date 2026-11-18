import { format, parseISO } from 'date-fns';
import { CalendarDays, Ticket, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import type { BookingRow } from '../../types/bookings';

import { BookingStatusBadge } from './BookingStatusBadge';

interface BookingDetailsProps {
  booking: BookingRow;
  onClose: () => void;
}

/** Read-only detail rows inside the dialog. */
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}

/**
 * Modal dialog showing the full details of one booking. Closes on
 * backdrop click, the close button or Escape; focus stays on the close
 * button while open.
 */
export function BookingDetails({ booking, onClose }: BookingDetailsProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-details-title"
        onClick={(event) => event.stopPropagation()}
        className="card w-full max-w-lg rounded-b-none p-5 sm:rounded-b-2xl"
      >
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Booking reference
            </p>
            <h2
              id="booking-details-title"
              className="truncate text-lg font-bold text-slate-900"
            >
              {booking.id}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <BookingStatusBadge status={booking.status} />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close booking details"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </header>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailItem label="Attendee" value={booking.attendeeName ?? 'Anonymous'} />
          <DetailItem
            label="Tickets"
            value={`${booking.ticketQuantity} ${booking.ticketQuantity === 1 ? 'ticket' : 'tickets'}`}
          />
          <DetailItem label="Amount" value={`$${booking.amount.toLocaleString()}`} />
          <DetailItem
            label="Booking date"
            value={format(parseISO(booking.createdAt), 'MMM dd, yyyy')}
          />
          <div className="sm:col-span-2">
            <DetailItem label="Event" value={booking.eventTitle} />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays size={15} aria-hidden="true" className="shrink-0" />
            <span>Event starts {format(parseISO(booking.eventDate), 'MMM dd, yyyy · HH:mm')}</span>
            <Ticket size={15} aria-hidden="true" className="ml-3 shrink-0" />
            <span className="tabular-nums">
              ${Math.round((booking.amount / booking.ticketQuantity) * 100) / 100} per ticket
            </span>
          </div>
        </dl>

        <footer className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
