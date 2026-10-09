import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import DotPattern from './DotPattern';

export function CornerTicks({ tone = 'var(--color-text-dim)' }: { tone?: string }) {
  return (
    <>
      <span className="absolute -left-px -top-px h-2 w-2" style={{ background: tone }} />
      <span className="absolute -right-px -top-px h-2 w-2" style={{ background: tone }} />
      <span className="absolute -bottom-px -left-px h-2 w-2" style={{ background: tone }} />
      <span className="absolute -bottom-px -right-px h-2 w-2" style={{ background: tone }} />
    </>
  );
}

interface PanelProps {
  children: ReactNode;
  className?: string;
  tone?: string;
  ticks?: boolean;
  dots?: boolean;
}

/** Hairline-bordered translucent panel with the signature corner brackets. */
export function Panel({ children, className, tone, ticks = true, dots = false }: PanelProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden border border-[color:var(--color-edge)]',
        'bg-[color:var(--color-surface)]/60 backdrop-blur-md',
        className,
      )}
    >
      {dots && (
        <DotPattern
          width={6}
          height={6}
          className="fill-[color:var(--color-edge-glow)] opacity-30"
        />
      )}
      {ticks && <CornerTicks tone={tone} />}
      <div className="relative">{children}</div>
    </div>
  );
}
