import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { Sidebar } from './Sidebar';

const WELCOME_MESSAGE = 'Hello Becca, welcome back!';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/events': 'Events',
  '/bookings': 'Bookings',
  '/reports': 'Reports',
};

/**
 * Shared application shell: persistent sidebar (desktop), header and the
 * routed page content. All routes render inside this single layout via
 * React Router's <Outlet />.
 */
export function AppLayout() {
  const { pathname } = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const title = PAGE_TITLES[pathname] ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-canvas">
      <div className="flex min-h-screen w-full">
        {/* Desktop: persistent sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-slate-100 bg-white lg:block xl:w-64">
          <Sidebar />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            title={title}
            subtitle={WELCOME_MESSAGE}
            onMenuClick={() => setIsMobileNavOpen(true)}
            isMobileNavOpen={isMobileNavOpen}
          />

          <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile: drawer navigation */}
      <MobileNavigation
        open={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
    </div>
  );
}
