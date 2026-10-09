import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Footer } from './Footer';
import { useDemo } from '@/state/demo';
import { cn } from '@/lib/utils';

const STEPS = [
  { path: '/', label: 'WELCOME' },
  { path: '/how', label: 'HOW IT WORKS' },
  { path: '/setup', label: 'SETUP' },
];

export function FlowLayout() {
  const { mode } = useDemo();
  const { pathname } = useLocation();
  const active = Math.max(
    0,
    STEPS.findIndex((s) => s.path === pathname),
  );

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <TopBar mode={mode} showStatus={false} />

      <div className="border-b border-[color:var(--color-edge)]">
        <ol className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-3 md:px-8">
          {STEPS.map((step, i) => {
            const state = i === active ? 'active' : i < active ? 'done' : 'todo';
            return (
              <li key={step.path} className="flex items-center gap-2">
                <span
                  className={cn(
                    'grid h-5 w-5 place-items-center border font-pixel text-[9px]',
                    state === 'active' &&
                      'border-[color:var(--color-edge-glow)] bg-[color:var(--color-surface)] text-[color:var(--color-text)]',
                    state === 'done' &&
                      'border-transparent text-[color:var(--color-strong)]',
                    state === 'todo' && 'border-[color:var(--color-edge)] text-[color:var(--color-text-dim)]',
                  )}
                >
                  {state === 'done' ? '✓' : String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={cn(
                    'font-pixel text-[10px] uppercase tracking-[0.2em]',
                    state === 'active'
                      ? 'text-[color:var(--color-text)]'
                      : 'text-[color:var(--color-text-dim)]',
                  )}
                >
                  {step.label}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="mx-1 h-px w-6 bg-[color:var(--color-edge)]" aria-hidden />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
