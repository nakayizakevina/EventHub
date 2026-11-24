import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { ReportTrendPoint } from '../../types/reports';
import { Pill } from '../shared/Pill';
import { SectionCard } from '../shared/SectionCard';

const AXIS_TICK = { fontSize: 11, fill: '#94a3b8' };

/** Compact count axis: 1500 → "2K" style labels, small values as-is. */
function formatCount(value: number): string {
  return value >= 1000 ? `${Math.round(value / 1000)}K` : `${value}`;
}

interface RegistrationTrendChartProps {
  trends: ReportTrendPoint[];
  /** Period label shown in the card header pill. */
  periodLabel: string;
  className?: string;
}

/**
 * Dual-series monthly trend: bookings placed (registrations, left axis)
 * against tickets sold by events held in each month (attendance, right
 * axis). The two measures differ by orders of magnitude, hence the two
 * axes; the legend states which is which.
 */
export function RegistrationTrendChart({ trends, periodLabel, className }: RegistrationTrendChartProps) {
  return (
    <SectionCard title="Registrations & Attendance" action={<Pill>{periodLabel}</Pill>} className={className}>
      {trends.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm font-medium text-slate-700">No activity in this period</p>
          <p className="mt-1 text-sm text-slate-500">Try widening the report period.</p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              Registrations (orders)
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-slate-900" />
              Attendance (tickets)
            </span>
          </div>

          <div className="h-52 w-full sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 8, right: 4, left: -14, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#eef1f5" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  tick={AXIS_TICK}
                  tickFormatter={(label: string) => label.split(' ')[0]}
                />
                <YAxis
                  yAxisId="reg"
                  width={44}
                  tickLine={false}
                  axisLine={false}
                  tick={AXIS_TICK}
                  tickFormatter={formatCount}
                />
                <YAxis
                  yAxisId="att"
                  orientation="right"
                  width={44}
                  tickLine={false}
                  axisLine={false}
                  tick={AXIS_TICK}
                  tickFormatter={formatCount}
                />
                <Tooltip
                  cursor={{ stroke: '#eef1f5' }}
                  contentStyle={{
                    border: '1px solid #eef1f5',
                    borderRadius: '0.75rem',
                    fontSize: 12,
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                  }}
                  formatter={(value) => Number(value).toLocaleString()}
                />
                <Line
                  yAxisId="reg"
                  type="monotone"
                  dataKey="registrations"
                  name="Registrations"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 4 }}
                />
                <Line
                  yAxisId="att"
                  type="monotone"
                  dataKey="attendance"
                  name="Attendance"
                  stroke="#0f172a"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </SectionCard>
  );
}
