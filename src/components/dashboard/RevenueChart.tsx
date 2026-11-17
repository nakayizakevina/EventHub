import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { getMonthlyRevenue } from '../../services/dashboardService';
import type { MonthlyRevenuePoint } from '../../types/dashboard';
import { SectionCard } from '../shared/SectionCard';

const CURRENCY_FORMAT = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

interface RevenueChartProps {
  className?: string;
}

/**
 * Monthly revenue bar chart. Only paid bookings contribute to revenue —
 * pending and failed payments are excluded by the calculation layer.
 */
export function RevenueChart({ className }: RevenueChartProps) {
  const [monthCount, setMonthCount] = useState(6);
  const [points, setPoints] = useState<MonthlyRevenuePoint[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isActive = true;

    getMonthlyRevenue(monthCount)
      .then((data) => {
        if (isActive) {
          setPoints(data);
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
  }, [monthCount]);

  const totalRevenue = points.reduce((sum, point) => sum + point.revenue, 0);

  return (
    <SectionCard
      title="Sales Revenue"
      className={className}
      action={
        <label className="relative block">
          <span className="sr-only">Revenue period</span>
          <select
            value={monthCount}
            onChange={(event) => setMonthCount(Number(event.target.value))}
            className="appearance-none rounded-lg border border-slate-100 bg-slate-50 py-1.5 pl-3 pr-8 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
          >
            <option value={6}>Last 6 Months</option>
            <option value={12}>Last 12 Months</option>
          </select>
          <ChevronDown
            size={14}
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </label>
      }
    >
      {error ? (
        <p className="text-sm text-red-600">Revenue data could not be loaded.</p>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-slate-500">Total Revenue</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">
              {CURRENCY_FORMAT.format(totalRevenue)}
            </p>
          </div>

          <div className="h-52 w-full sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={points} margin={{ top: 8, right: 4, left: -14, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#eef1f5" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(label: string) => label.split(' ')[0]}
                />
                <YAxis
                  width={44}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(value: number) =>
                    value >= 1000 ? `${Math.round(value / 1000)}K` : `${value}`
                  }
                />
                <Tooltip
                  cursor={{ fill: 'rgba(249, 115, 22, 0.06)' }}
                  contentStyle={{
                    border: '1px solid #eef1f5',
                    borderRadius: '0.75rem',
                    fontSize: 12,
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                  }}
                  formatter={(value) => [CURRENCY_FORMAT.format(Number(value)), 'Revenue']}
                />
                <Bar
                  dataKey="revenue"
                  fill="#f97316"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </SectionCard>
  );
}
