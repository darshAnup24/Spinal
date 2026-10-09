import { cn } from '@/lib/utils';
import type { Priority } from '@/lib/types';

export type Filter = 'ALL' | Priority;

const FILTERS: Filter[] = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];

export function FilterBar({
  value,
  onChange,
}: {
  value: Filter;
  onChange: (f: Filter) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((f) => {
        const active = value === f;
        return (
          <button
            key={f}
            onClick={() => onChange(f)}
            className={cn(
              'rounded-full border px-4 py-2 font-pixel text-[10px] uppercase tracking-[0.18em] transition-colors',
              active
                ? 'border-[color:var(--color-edge-glow)] bg-[color:var(--color-surface)] text-[color:var(--color-text)]'
                : 'border-[color:var(--color-edge)] text-[color:var(--color-text-mute)] hover:border-[color:var(--color-edge-glow)] hover:text-[color:var(--color-text)]',
            )}
          >
            {f}
          </button>
        );
      })}
    </div>
  );
}
