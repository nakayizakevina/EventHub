import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { getTicketSalesByStatus } from '../../services/dashboardService';
import type { TicketSalesByStatus } from '../../types/dashboard';
import { Pill } from '../shared/Pill';
import { SectionCard } from '../shared/SectionCard';

const STATUS_META: Record<
  TicketSalesByStatus['status'],
  { label: string; color: string }
> = {
  'sold-out': { label: 'Sold Out', color: '#f97316' },
  'fully-booked': { label: 'Fully Booked', color: '#0f172a' },
  available: { label: 'Available', color: '#e2e8f0' },
};

interface TicketSalesChartProps {
  className?: string;
}

/**
 * Donut chart of the ticket pool grouped by event fullness
 * (see calculateTicketSalesByStatus for the bucket rules).
 */
export function TicketSalesChart({ className }: TicketSalesChartProps) {
  const [buckets, setBuckets] = useState<TicketSalesByStatus[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isActive = true;

    getTicketSalesByStatus()
      .then((data) => {
        if (isActive) {
          setBuckets(data);
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

  const totalTickets = buckets?.reduce((sum, bucket) => sum + bucket.tickets, 0) ?? 0;

  return (
    <SectionCard title="Ticket Sales" action={<Pill>All Events</Pill>} className={className}>
      {error ? (
        <p className="text-sm text-red-600">Ticket data could not be loaded.</p>
      ) : (
        <>
          <div className="relative mx-auto h-52 w-full max-w-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={buckets ?? []}
                  dataKey="tickets"
                  nameKey="status"
                  innerRadius="70%"
                  outerRadius="100%"
                  paddingAngle={3}
                  stroke="none"
                >
                  {(buckets ?? []).map((bucket) => (
                    <Cell key={bucket.status} fill={STATUS_META[bucket.status].color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-slate-500">Total Ticket</span>
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {totalTickets.toLocaleString()}
              </span>
            </div>
          </div>

          <ul className="mt-6 space-y-3.5">
            {(buckets ?? []).map((bucket) => (
              <li key={bucket.status} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-5 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: STATUS_META[bucket.status].color }}
                />
                <span className="flex-1 text-sm font-medium text-slate-700">
                  {STATUS_META[bucket.status].label}
                </span>
                <span className="text-sm font-semibold text-slate-900 tabular-nums">
                  {bucket.tickets.toLocaleString()}
                </span>
                <span className="min-w-12 rounded-md bg-slate-50 px-2 py-1 text-center text-xs font-semibold text-slate-600">
                  {bucket.percentage}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </SectionCard>
  );
}
