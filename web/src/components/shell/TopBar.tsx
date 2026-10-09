import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function TopBar({
  mode,
  showStatus = true,
}: {
  mode?: 'HYBRID' | 'RULES_ONLY';
  showStatus?: boolean;
}) {
  const hybrid = mode === 'HYBRID';
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-edge)] bg-[color:var(--color-void)]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span
            className="grid h-7 w-7 place-items-center border border-[color:var(--color-edge-glow)] font-pixel text-[11px] text-[color:var(--color-text)]"
            aria-hidden
          >
            UP
          </span>
          <span className="font-pixel text-[13px] tracking-[0.2em] text-[color:var(--color-text)]">
            THE_UNREAD_PROBLEM
          </span>
        </Link>

        {showStatus && (
          <div className="flex items-center gap-2">
            <ShieldCheck
              className="h-3.5 w-3.5"
              style={{ color: hybrid ? 'var(--color-strong)' : 'var(--color-pivot)' }}
            />
            <span
              className="font-pixel text-[10px] uppercase tracking-[0.18em]"
              style={{ color: hybrid ? 'var(--color-strong)' : 'var(--color-pivot)' }}
            >
              {hybrid ? 'ON-DEVICE · HYBRID' : 'ON-DEVICE · RULES'}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
