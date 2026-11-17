import {
  addDays,
  addMonths,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { getCalendarEvents, getUpcomingEvents } from '../../services/dashboardService';
import type { EventItem } from '../../types/event';
import { SectionCard } from '../shared/SectionCard';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * "Today" is captured once at module load so renders stay pure while the
 * calendar still highlights the current day.
 */
const TODAY = new Date();

interface EventCalendarProps {
  className?: string;
}

/**
 * Month calendar (with event-day markers and month navigation) plus the
 * upcoming-event schedule underneath.
 */
export function EventCalendar({ className }: EventCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(TODAY));
  const [monthEvents, setMonthEvents] = useState<EventItem[]>([]);
  const [upcoming, setUpcoming] = useState<EventItem[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isActive = true;

    getCalendarEvents(visibleMonth)
      .then((data) => {
        if (isActive) {
          setMonthEvents(data);
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
  }, [visibleMonth]);

  useEffect(() => {
    let isActive = true;

    getUpcomingEvents()
      .then((data) => {
        if (isActive) {
          setUpcoming(data.slice(0, 4));
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

  /** Six full weeks (42 cells) starting on the Sunday of the first week. */
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(visibleMonth);
    const gridStart = subDays(monthStart, getDay(monthStart));
    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  }, [visibleMonth]);

  const eventDayKeys = new Set(
    monthEvents.map((event) => format(new Date(event.date), 'yyyy-MM-dd')),
  );

  return (
    <SectionCard
      title={format(visibleMonth, 'MMMM yyyy')}
      className={className}
      action={
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setVisibleMonth((month) => subMonths(month, 1))}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      }
    >
      {error ? (
        <p className="text-sm text-red-600">Calendar data could not be loaded.</p>
      ) : (
        <>
          <div
            role="group"
            aria-label={format(visibleMonth, 'MMMM yyyy')}
            className="grid grid-cols-7 gap-y-1.5"
          >
            {WEEKDAYS.map((weekday) => (
              <span
                key={weekday}
                className="text-center text-xs font-semibold text-slate-400"
              >
                {weekday}
              </span>
            ))}

            {calendarDays.map((day) => {
              const inMonth = isSameMonth(day, visibleMonth);
              const hasEvent = eventDayKeys.has(format(day, 'yyyy-MM-dd'));
              const isCurrentDay = isSameDay(day, TODAY);

              let cellClass = 'text-slate-300';
              if (isCurrentDay) {
                cellClass = 'bg-orange-500 font-semibold text-white shadow-sm';
              } else if (hasEvent && inMonth) {
                cellClass = 'font-medium text-orange-600';
              } else if (inMonth) {
                cellClass = 'text-slate-700';
              }

              return (
                <span
                  key={day.toISOString()}
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm ${cellClass}`}
                >
                  {format(day, 'd')}
                </span>
              );
            })}
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Upcoming Schedule
            </h3>
            <ul className="space-y-3">
              {upcoming.map((event) => {
                const eventDate = new Date(event.date);

                return (
                  <li key={event.id} className="flex items-center gap-3">
                    <span className="flex w-12 shrink-0 flex-col items-center rounded-xl bg-orange-50 py-1.5 text-orange-600">
                      <span className="text-base font-bold leading-none">
                        {format(eventDate, 'd')}
                      </span>
                      <span className="mt-0.5 text-[10px] font-semibold uppercase">
                        {format(eventDate, 'MMM')}
                      </span>
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {event.title}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {event.venue} · {format(eventDate, 'h:mm a')}
                      </p>
                    </div>
                  </li>
                );
              })}
              {upcoming.length === 0 && (
                <li className="text-sm text-slate-500">No upcoming events.</li>
              )}
            </ul>
          </div>
        </>
      )}
    </SectionCard>
  );
}
