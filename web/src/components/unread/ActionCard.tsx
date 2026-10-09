import { CalendarClock, Check, X } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { StatusDot } from '@/components/ui/StatusDot';
import { fmtTime, priorityTone } from '@/lib/format';
import type { ActionItem } from '@/lib/types';

export function ActionCard({
  item,
  onDone,
  onDismiss,
}: {
  item: ActionItem;
  onDone: () => void;
  onDismiss: () => void;
}) {
  const tone = priorityTone(item.priority);
  return (
    <Panel tone={tone} className="flex w-[260px] shrink-0 flex-col bg-[color:var(--color-deep)]/70 p-4">
      <div className="flex items-center gap-2">
        <StatusDot tone={tone} />
        <span
          className="font-pixel text-[10px] uppercase tracking-[0.2em]"
          style={{ color: tone }}
        >
          Action required
        </span>
      </div>

      <p className="mt-3 font-mono text-sm leading-snug text-[color:var(--color-text)]">
        {item.title}
      </p>

      <div className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-[color:var(--color-text-mute)]">
        <CalendarClock className="h-3 w-3" />
        {item.dueAt ? fmtTime(item.dueAt) : 'Deadline unclear'}
      </div>

      <p className="mt-1 font-mono text-[10px] text-[color:var(--color-text-dim)]">{item.reason}</p>

      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={onDone}
          className="inline-flex items-center gap-1 font-pixel text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-text)] transition-colors hover:text-[color:var(--color-strong)]"
        >
          <Check className="h-3 w-3" /> Done
        </button>
        <button
          onClick={onDismiss}
          className="inline-flex items-center gap-1 font-pixel text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-text-mute)] transition-colors hover:text-[color:var(--color-text)]"
        >
          <X className="h-3 w-3" /> Dismiss
        </button>
      </div>
    </Panel>
  );
}
