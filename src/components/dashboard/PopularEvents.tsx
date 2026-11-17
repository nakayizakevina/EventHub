import { useEffect, useState } from 'react';

import { getTicketSalesBreakdown } from '../../services/dashboardService';
import type { TicketSalesByCategory } from '../../types/dashboard';
import { Pill } from '../shared/Pill';
import { SectionCard } from '../shared/SectionCard';

/** Row colours follow the reference: orange, dark navy, then neutral. */
const BAR_COLORS = ['#f97316', '#0f172a', '#94a3b8', '#94a3b8', '#94a3b8'];

interface PopularEventsProps {
  className?: string;
}

/**
 * Popular event categories by ticket sales, with each category's share of
 * all tickets sold.
 */
export function PopularEvents({ className }: PopularEventsProps) {
  const [rows, setRows] = useState<TicketSalesByCategory[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isActive = true;

    getTicketSalesBreakdown()
      .then((data) => {
        if (isActive) {
          setRows(data);
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

  const totalSold = rows?.reduce((sum, row) => sum + row.ticketsSold, 0) ?? 0;

  return (
    <SectionCard
      title="Popular Events"
      action={<Pill>All Categories</Pill>}
      className={className}
    >
      {error ? (
        <p className="text-sm text-red-600">Category data could not be loaded.</p>
      ) : (
        <ul className="space-y-4">
          {rows?.map((row, index) => {
            const share =
              totalSold === 0 ? 0 : Math.round((row.ticketsSold / totalSold) * 1000) / 10;

            return (
              <li key={row.category}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{row.category}</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{share}%</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${share}%`,
                      backgroundColor: BAR_COLORS[index] ?? '#94a3b8',
                    }}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-slate-500">
                  {row.ticketsSold.toLocaleString()} Tickets
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
