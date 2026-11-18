import { useEffect, useMemo, useState } from 'react';

import { BookingDetails } from '../components/bookings/BookingDetails';
import { BookingFilters } from '../components/bookings/BookingFilters';
import { BookingsStats } from '../components/bookings/BookingsStats';
import { BookingsTable } from '../components/bookings/BookingsTable';
import { SectionCard } from '../components/shared/SectionCard';
import { getBookingRows, getBookableEvents } from '../services/bookingService';
import type { BookingFilterState, BookingRow } from '../types/bookings';
import { filterBookingRows } from '../utils/bookingCalculations';

const INITIAL_FILTERS: BookingFilterState = { query: '', status: 'all', eventId: 'all' };

/**
 * Bookings page: overview stats, search/filter controls and the bookings
 * table with a details dialog. Loading, error and empty states are handled
 * here so the table component stays presentational.
 */
export function BookingsPage() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [filters, setFilters] = useState<BookingFilterState>(INITIAL_FILTERS);
  const [selected, setSelected] = useState<BookingRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isActive = true;

    Promise.all([getBookingRows(), getBookableEvents()])
      .then(([bookingRows, bookableEvents]) => {
        if (isActive) {
          setRows(bookingRows);
          setEvents(bookableEvents);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isActive) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const visibleRows = useMemo(() => filterBookingRows(rows, filters), [rows, filters]);

  if (error) {
    return (
      <div className="card p-6">
        <p className="text-sm text-red-600">Bookings could not be loaded.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card p-6" aria-busy="true">
        <p className="text-sm text-slate-500">Loading bookings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BookingsStats />

      <SectionCard title="All Bookings">
        <div className="mb-4">
          <BookingFilters
            filters={filters}
            events={events}
            resultCount={visibleRows.length}
            onChange={setFilters}
          />
        </div>

        {visibleRows.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-slate-700">No bookings found</p>
            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your search or clearing the filters.
            </p>
            <button
              type="button"
              onClick={() => setFilters(INITIAL_FILTERS)}
              className="mt-4 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <BookingsTable rows={visibleRows} onSelect={setSelected} />
        )}
      </SectionCard>

      {selected && <BookingDetails booking={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
