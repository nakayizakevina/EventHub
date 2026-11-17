import type { ReactNode } from 'react';

/** Small neutral badge used as a card-header control label. */
export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
      {children}
    </span>
  );
}
