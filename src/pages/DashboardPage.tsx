import { AllEvents } from '../components/dashboard/AllEvents';
import { EventCalendar } from '../components/dashboard/EventCalendar';
import { FeaturedEvent } from '../components/dashboard/FeaturedEvent';
import { PopularEvents } from '../components/dashboard/PopularEvents';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { TicketSalesChart } from '../components/dashboard/TicketSalesChart';

/**
 * Dashboard overview — mirrors the reference arrangement:
 * summary cards, then ticket sales + revenue/popular stack in the main
 * column, with the featured event and calendar in the right column.
 */
export function DashboardPage() {
  return (
    <div className="space-y-6">
      <SummaryCards />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-2">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <TicketSalesChart className="lg:col-span-1" />
            <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
              <RevenueChart />
              <PopularEvents />
            </div>
          </div>

          <AllEvents />
        </div>

        <div className="flex flex-col gap-6">
          <FeaturedEvent />
          <EventCalendar />
        </div>
      </div>
    </div>
  );
}
