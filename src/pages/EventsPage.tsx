import { CheckCircle2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CreateEventModal } from '../components/events/CreateEventModal';
import { EventDetailsModal } from '../components/events/EventDetailsModal';
import { EventFilters } from '../components/events/EventFilters';
import { EventGrid } from '../components/events/EventGrid';
import { EventsHeader } from '../components/events/EventsHeader';
import { EventStatsCards } from '../components/events/EventStatsCards';
import { listEvents } from '../services/eventsService';
import type { EventItem } from '../types/event';
import {
  filterEvents,
  sortEventsForListing,
  summarizeEvents,
  type EventCategoryFilter,
  type EventStatusFilter,
} from '../utils/eventList';

/**
 * Events page — heading with the primary "+ Create Event" action, a
 * dismissible success banner, four summary statistics, a search/filter
 * toolbar and the responsive event card grid.
 *
 * All event data is temporary frontend data: it is loaded once into
 * component state (there is no backend) and every derived figure —
 * statistics, search results, filter results — is computed from that
 * state, so creating an event updates the listing immediately.
 */
export function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<EventCategoryFilter>('all');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [detailsEvent, setDetailsEvent] = useState<EventItem | null>(null);

  /* Load the temporary frontend event data once, like the dashboard pages. */
  useEffect(() => {
    let isActive = true;

    listEvents()
      .then((data) => {
        if (isActive) {
          setEvents(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isActive) {
          setLoadError(true);
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  /* Statistics always cover the full listing, never just the filtered view. */
  const statistics = useMemo(() => summarizeEvents(events), [events]);

  const visibleEvents = useMemo(
    () =>
      sortEventsForListing(
        filterEvents(events, { search, status: statusFilter, category: categoryFilter }),
      ),
    [events, search, statusFilter, categoryFilter],
  );

  const hasActiveFilters =
    search.trim() !== '' || statusFilter !== 'all' || categoryFilter !== 'all';

  const handleOpenCreate = useCallback(() => setIsCreateOpen(true), []);
  const handleCloseCreate = useCallback(() => setIsCreateOpen(false), []);
  const handleViewDetails = useCallback((event: EventItem) => setDetailsEvent(event), []);
  const handleCloseDetails = useCallback(() => setDetailsEvent(null), []);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
  }, []);

  /* A created event is added to the listing immediately; filters reset so
     the new event is always visible right away. */
  const handleCreated = useCallback(
    (created: EventItem) => {
      setEvents((current) => [created, ...current]);
      handleClearFilters();
      setSuccessMessage(`“${created.title}” was created successfully.`);
    },
    [handleClearFilters],
  );

  return (
    <div className="space-y-6">
      <EventsHeader onCreateClick={handleOpenCreate} />

      {successMessage && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700"
        >
          <CheckCircle2 size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
          <p className="min-w-0 flex-1 font-medium">{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            aria-label="Dismiss notification"
            className="-m-1 shrink-0 rounded-full p-1 text-emerald-600 transition-colors hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {isLoading ? (
        <p role="status" className="text-sm text-slate-500">
          Loading events…
        </p>
      ) : loadError ? (
        <div className="card p-6">
          <p className="text-sm text-red-600">Events could not be loaded.</p>
        </div>
      ) : (
        <>
          <EventStatsCards statistics={statistics} />

          <EventFilters
            search={search}
            onSearchChange={setSearch}
            status={statusFilter}
            onStatusChange={setStatusFilter}
            category={categoryFilter}
            onCategoryChange={setCategoryFilter}
          />

          <EventGrid
            events={visibleEvents}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
            onViewDetails={handleViewDetails}
          />
        </>
      )}

      {isCreateOpen && (
        <CreateEventModal onClose={handleCloseCreate} onSuccess={handleCreated} />
      )}

      {detailsEvent && (
        <EventDetailsModal event={detailsEvent} onClose={handleCloseDetails} />
      )}
    </div>
  );
}
