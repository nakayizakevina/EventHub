import { CheckCircle2, X } from 'lucide-react';
import { useCallback, useState } from 'react';

import { CreateEventModal } from '../components/events/CreateEventModal';
import { EventsHeader } from '../components/events/EventsHeader';

/**
 * Events page — heading with the primary "+ Create Event" action, a
 * dismissible success banner, and the creation modal. Additional Events
 * features (list, filters, …) arrive in later tasks.
 */
export function EventsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOpenCreate = useCallback(() => setIsCreateOpen(true), []);
  const handleCloseCreate = useCallback(() => setIsCreateOpen(false), []);
  const handleCreated = useCallback((eventTitle: string) => {
    setSuccessMessage(`“${eventTitle}” was created successfully.`);
  }, []);

  return (
    <div className="space-y-6">
      <EventsHeader onCreateClick={handleOpenCreate} />

      {successMessage && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700"
        >
          <CheckCircle2 size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
          <p className="min-w-0 flex-1 font-medium">{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            aria-label="Dismiss notification"
            className="-m-1 shrink-0 rounded-full p-1 text-emerald-600 transition-colors hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {isCreateOpen && (
        <CreateEventModal onClose={handleCloseCreate} onSuccess={handleCreated} />
      )}
    </div>
  );
}
