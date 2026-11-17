import type { ReactNode } from 'react';

interface SectionCardProps {
  /** Card heading, e.g. "Ticket Sales". */
  title: string;
  /** Right-aligned control in the card header (pill, select or link). */
  action?: ReactNode;
  children: ReactNode;
  /** Extra classes merged onto the card surface. */
  className?: string;
}

/**
 * Standard white dashboard card with a title row — keeps every dashboard
 * section visually consistent and its markup DRY.
 */
export function SectionCard({ title, action, children, className }: SectionCardProps) {
  return (
    <section className={`card p-5 ${className ?? ''}`}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}
