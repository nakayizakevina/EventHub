import { useEffect } from 'react';

import { Sidebar } from './Sidebar';

interface MobileNavigationProps {
  /** Whether the drawer is open. */
  open: boolean;
  /** Closes the drawer (backdrop click, Escape key, or a nav link). */
  onClose: () => void;
}

/**
 * Mobile-only navigation drawer. Hidden on desktop (`lg:` and up), where the
 * persistent Sidebar is rendered instead.
 */
export function MobileNavigation({ open, onClose }: MobileNavigationProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      id="mobile-navigation"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className="fixed inset-0 z-40 lg:hidden"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-2xl">
        <Sidebar onNavigate={onClose} />
      </div>
    </div>
  );
}
