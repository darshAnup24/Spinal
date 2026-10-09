import type { ReactNode } from 'react';
import { Panel } from '@/components/ui/Panel';

export function StatTile({
  icon,
  label,
  value,
  tone,
}: {
  icon?: ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <Panel ticks={false} className="bg-[color:var(--color-surface)]/40 p-4">
      <div className="flex items-center gap-2 text-[color:var(--color-text-mute)]">
        <span style={{ color: tone }}>{icon}</span>
        <span className="font-pixel text-[10px] uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="mt-2 font-mono text-2xl md:text-3xl" style={{ color: tone }}>
        {value}
      </p>
    </Panel>
  );
}
