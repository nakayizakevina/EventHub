import { Plus } from 'lucide-react';

interface EventsHeaderProps {
  /** Opens the Create Event modal. */
  onCreateClick: () => void;
}

/**
 * Events page heading — title, supporting description and the primary
 * "+ Create Event" action, aligned like the rest of the application.
 */
export function EventsHeader({ onCreateClick }: EventsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Events</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage and track all your events in one place.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreateClick}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:ring-offset-2"
      >
        <Plus size={16} aria-hidden="true" />
        Create Event
      </button>
    </div>
  );
}
