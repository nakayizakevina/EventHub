import type { BookingDisplayStatus } from '../../types/bookings';

/** Colour scheme per display status, matching the dashboard badge palette. */
const STATUS_STYLES: Record<BookingDisplayStatus, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-orange-50 text-orange-700',
  cancelled: 'bg-slate-100 text-slate-600',
};

const STATUS_LABELS: Record<BookingDisplayStatus, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  cancelled: 'Cancelled',
};

interface BookingStatusBadgeProps {
  status: BookingDisplayStatus;
}

/** Rounded status pill used in the bookings table and details view. */
export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
