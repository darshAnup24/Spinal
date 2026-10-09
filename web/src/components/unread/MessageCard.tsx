import { motion } from 'framer-motion';
import { Check, FileText } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { StatusDot } from '@/components/ui/StatusDot';
import { fmtTime, priorityTone } from '@/lib/format';
import type { CapturedMessage } from '@/lib/types';

export function MessageCard({
  message,
  onAcknowledge,
  onSummarize,
}: {
  message: CapturedMessage;
  onAcknowledge: () => void;
  onSummarize: () => void;
}) {
  const tone = priorityTone(message.priority);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 140, damping: 22 }}
    >
      <Panel tone={tone} className="p-5 hover:border-[color:var(--color-edge-glow)]">
        <div className="flex flex-wrap items-center gap-2">
          <StatusDot tone={tone} />
          <span
            className="font-pixel text-[11px] uppercase tracking-[0.18em]"
            style={{ color: tone }}
          >
            {message.priority}
          </span>
          <span className="font-pixel text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)]">
            {message.conversation}
          </span>
          <span className="ml-auto font-mono text-[10px] text-[color:var(--color-text-dim)]">
            score {message.score}
          </span>
        </div>

        <p className="mt-3 font-mono text-[14px] leading-relaxed text-[color:var(--color-text)] md:text-[15px]">
          {message.messageText}
        </p>

        <p className="mt-2 font-mono text-[11px] leading-relaxed text-[color:var(--color-text-mute)]">
          {message.reason}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[11px] text-[color:var(--color-text-dim)]">
            {fmtTime(message.timestamp)}
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={onSummarize}
              className="inline-flex items-center gap-1.5 font-pixel text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-text)] transition-colors hover:text-[color:var(--color-dither)]"
            >
              <FileText className="h-3 w-3" /> Summarize
            </button>
            <button
              onClick={onAcknowledge}
              disabled={message.acknowledged}
              className="inline-flex items-center gap-1.5 font-pixel text-[11px] uppercase tracking-[0.14em] transition-colors disabled:opacity-100"
              style={{
                color: message.acknowledged
                  ? 'var(--color-strong)'
                  : 'var(--color-text)',
              }}
            >
              <Check className="h-3 w-3" />
              {message.acknowledged ? 'Done' : 'Mark done'}
            </button>
          </div>
        </div>
      </Panel>
    </motion.div>
  );
}
