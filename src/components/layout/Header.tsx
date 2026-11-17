import { Bell, Menu, Search, Settings } from 'lucide-react';

const AVATAR_INITIALS = 'LB';
const AVATAR_NAME = 'Life Becca';
const AVATAR_ROLE = 'Admin';

const ICON_BUTTON_CLASSES =
  'inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200';

interface HeaderProps {
  /** Current page title (derived from the active route). */
  title: string;
  /** Short supporting message shown under the title. */
  subtitle: string;
  /** Opens the mobile navigation drawer. */
  onMenuClick: () => void;
  /** Reflects the drawer state for assistive technology. */
  isMobileNavOpen: boolean;
}

/**
 * Page header shared by every route: title + welcome message on the left,
 * search, notifications, settings and the user profile on the right.
 */
export function Header({ title, subtitle, onMenuClick, isMobileNavOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          aria-expanded={isMobileNavOpen}
          aria-controls="mobile-navigation"
          className={`${ICON_BUTTON_CLASSES} lg:hidden`}
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">{title}</h1>
          <p className="hidden truncate text-sm text-slate-500 sm:block">{subtitle}</p>
        </div>

        <label className="relative hidden md:block">
          <span className="sr-only">Search anything</span>
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            placeholder="Search anything"
            className="w-40 rounded-full bg-slate-100 py-2.5 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 lg:w-60"
          />
        </label>

        <button type="button" aria-label="Notifications" className={ICON_BUTTON_CLASSES}>
          <span className="relative">
            <Bell size={18} aria-hidden="true" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-slate-100" />
          </span>
        </button>

        <button
          type="button"
          aria-label="Settings"
          className={`${ICON_BUTTON_CLASSES} hidden sm:inline-flex`}
        >
          <Settings size={18} aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-xs font-bold text-white"
          >
            {AVATAR_INITIALS}
          </span>
          <div className="hidden leading-tight lg:block">
            <p className="text-sm font-semibold text-slate-900">{AVATAR_NAME}</p>
            <p className="text-xs text-slate-500">{AVATAR_ROLE}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
