import { useEffect, useState } from 'react';

import { CategoryPerformance } from '../components/reports/CategoryPerformance';
import { EventPerformanceTable } from '../components/reports/EventPerformanceTable';
import { RegistrationTrendChart } from '../components/reports/RegistrationTrendChart';
import { ReportFilters } from '../components/reports/ReportFilters';
import { ReportSummaryCards } from '../components/reports/ReportSummaryCards';
import { getReportData } from '../services/reportService';
import type { ReportData, ReportFilters as ReportFilterState } from '../types/reports';
import { DEFAULT_REPORT_FILTERS, REPORT_PERIOD_LABELS } from '../utils/reportCalculations';

/**
 * Reports page: period/category filters, four headline figures, the
 * registration & attendance trend, the category breakdown and the event
 * performance table. One service call feeds every section, so loading,
 * error and filter changes are handled here and the section components
 * stay presentational.
 */
export function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilterState>(DEFAULT_REPORT_FILTERS);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isActive = true;

    getReportData(filters)
      .then((report) => {
        if (isActive) {
          setData(report);
          setError(false);
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
  }, [filters]);

  if (error) {
    return (
      <div className="card p-6">
        <p className="text-sm text-red-600">Report data could not be loaded.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card p-6" aria-busy="true">
        <p className="text-sm text-slate-500">Loading report…</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const periodLabel = REPORT_PERIOD_LABELS[filters.period];
  const categoryLabel = filters.category === 'all' ? 'All Categories' : filters.category;

  return (
    <div className="space-y-6">
      <ReportFilters filters={filters} onChange={setFilters} />

      <ReportSummaryCards summary={data.summary} filters={filters} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RegistrationTrendChart
          trends={data.trends}
          periodLabel={periodLabel}
          className="lg:col-span-2"
        />
        <CategoryPerformance rows={data.categories} categoryLabel={categoryLabel} />
      </div>

      <EventPerformanceTable rows={data.eventRows} periodLabel={periodLabel} />
    </div>
  );
}
