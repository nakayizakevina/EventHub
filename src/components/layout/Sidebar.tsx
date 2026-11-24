import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Settings,
  Ticket,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Routes outside the current assignment scope render as disabled items. */
  enabled: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, enabled: true },
  { label: 'Events', href: '/events', icon: CalendarDays, enabled: true },
  { label: 'Bookings', href: '/bookings', icon: Ticket, enabled: true },
  { label: 'Attendees', href: '/attendees', icon: Users, enabled: false },
  { label: 'Reports', href: '/reports', icon: BarChart3, enabled: true },
  { label: 'Settings', href: '/settings', icon: Settings, enabled: false },
];

const LINK_CLASSES =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors';

interface SidebarProps {
  /** Called after an enabled link is clicked — used to close the mobile drawer. */
  onNavigate?: () => void;
}

/**
 * Persistent navigation: brand + primary routes. Rendered statically on
 * desktop and inside the mobile drawer (see MobileNavigation).
 */
export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <nav aria-label="Main navigation" className="flex h-full flex-col px-4 py-6">
      <div className="mb-8 flex items-center gap-2.5 px-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white"
        >
          <Ticket size={20} />
        </span>
        <span className="text-lg font-bold tracking-tight text-slate-900">EventHub</span>
      </div>

      <ul className="flex flex-col gap-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <li key={item.label}>
                <button
                  type="button"
                  disabled
                  title="Coming soon"
                  className={`${LINK_CLASSES} text-slate-600 hover:bg-slate-50`}
                >
                  <Icon size={20} aria-hidden="true" />
                  {item.label}
                </button>
              </li>
            );
          }

          return (
            <li key={item.label}>
              <NavLink
                to={item.href}
                end={item.href === '/dashboard'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `${LINK_CLASSES} ${
                    isActive
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon size={20} aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
