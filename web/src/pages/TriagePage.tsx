import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BellRing,
  Cpu,
  Lock,
  RotateCcw,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { NoticeCard } from '@/components/unread/NoticeCard';
import { StatTile } from '@/components/unread/StatTile';
import { FilterBar, type Filter } from '@/components/unread/FilterBar';
import { ActionCard } from '@/components/unread/ActionCard';
import { MessageCard } from '@/components/unread/MessageCard';
import { PRIORITY_META } from '@/lib/format';
import { useDemo } from '@/state/demo';
import type { Priority } from '@/lib/types';

const EASE = [0.32, 0.72, 0, 1] as const;

export function TriagePage() {
  const navigate = useNavigate();
  const {
    access,
    modelInstalled,
    messages,
    actions,
    enableAccess,
    installModel,
    acknowledge,
    setActionStatus,
    clearAll,
    reset,
    summarize,
  } = useDemo();

  const [filter, setFilter] = useState<Filter>('ALL');
  const [summaryKey, setSummaryKey] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);

  const counts = useMemo(
    () => ({
      HIGH: messages.filter((m) => m.priority === 'HIGH').length,
      MEDIUM: messages.filter((m) => m.priority === 'MEDIUM').length,
      LOW: messages.filter((m) => m.priority === 'LOW').length,
    }),
    [messages],
  );

  const visible = messages.filter((m) => filter === 'ALL' || m.priority === filter);
  const summaryConv = summaryKey
    ? messages.find((m) => m.conversationKey === summaryKey)?.conversation ?? summaryKey
    : '';

  const priorities: Priority[] = ['HIGH', 'MEDIUM', 'LOW'];
  const priorityIcons: Record<Priority, ReactNode> = {
    HIGH: <TrendingUp className="h-3.5 w-3.5" />,
    MEDIUM: <Activity className="h-3.5 w-3.5" />,
    LOW: <TrendingDown className="h-3.5 w-3.5" />,
  };

  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-10 md:px-8">
      {/* section header */}
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-pixel text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-text-mute)]">
            triage_console
          </div>
          <h2 className="mt-2 font-pixel text-2xl tracking-[0.1em] text-[color:var(--color-text)]">
            CAPTURED_NOTIFICATIONS
          </h2>
          <p className="mt-2 max-w-xl font-mono text-xs leading-relaxed text-[color:var(--color-text-mute)]">
            The live stream: notifications scored by priority. Acknowledge, summarise a thread, or
            clear everything. All data here is simulated in your browser.
          </p>
        </div>
        <button
          onClick={() => {
            reset();
            navigate('/');
          }}
          className="inline-flex items-center gap-2 self-start border border-[color:var(--color-edge)] px-4 py-2 font-pixel text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-text-mute)] transition-colors hover:text-[color:var(--color-text)]"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset demo
        </button>
      </div>

      {/* notices */}
      <AnimatePresence initial={false}>
        {!access && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <NoticeCard
              tone="var(--color-pivot)"
              icon={<BellRing className="h-4 w-4" />}
              title="Enable notification access"
              body="Android only exposes message text that WhatsApp includes in notifications. Grant access to start capturing."
              cta="Grant access (simulated)"
              onCta={enableAccess}
            />
          </motion.div>
        )}
        {access && !modelInstalled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <NoticeCard
              tone="var(--color-refine)"
              icon={<Cpu className="h-4 w-4" />}
              title="Local LLM not installed"
              body="Rules still work offline. Install a compatible LiteRT-LM model at filesDir/models/model.litertlm to enable on-device summaries."
              cta="Load local model (simulated)"
              onCta={installModel}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!access ? (
        <LockedStream onEnable={enableAccess} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {/* open actions */}
          <div className="mt-6 flex items-baseline justify-between">
            <h3 className="font-pixel text-[12px] uppercase tracking-[0.25em] text-[color:var(--color-text-mute)]">
              OPEN_ACTIONS
            </h3>
            <span className="font-mono text-[10px] text-[color:var(--color-text-dim)]">
              {actions.length} open
            </span>
          </div>

          {actions.length === 0 ? (
            <Panel ticks={false} className="mt-3 bg-[color:var(--color-deep)]/60 p-4">
              <p className="font-mono text-xs text-[color:var(--color-text-mute)]">
                No pending deadline actions. Nothing demands you right now.
              </p>
            </Panel>
          ) : (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
              {actions.map((a) => (
                <ActionCard
                  key={a.id}
                  item={a}
                  onDone={() => setActionStatus(a.id, 'DONE')}
                  onDismiss={() => setActionStatus(a.id, 'DISMISSED')}
                />
              ))}
            </div>
          )}

          {/* stats */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {priorities.map((p) => (
              <StatTile
                key={p}
                icon={priorityIcons[p]}
                label={p}
                value={counts[p]}
                tone={PRIORITY_META[p].tone}
              />
            ))}
          </div>

          {/* filters */}
          <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <FilterBar value={filter} onChange={setFilter} />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-text-dim)]">
              {visible.length} shown · {messages.length} captured
            </span>
          </div>

          {/* captured stream */}
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {visible.map((m) => (
                <MessageCard
                  key={m.id}
                  message={m}
                  onAcknowledge={() => acknowledge(m.id)}
                  onSummarize={() => setSummaryKey(m.conversationKey)}
                />
              ))}
            </AnimatePresence>
          </div>

          {visible.length === 0 && (
            <div className="py-20 text-center">
              <pre className="mb-6 inline-block font-pixel text-[11px] leading-tight text-[color:var(--color-text-dim)]">
{`┌──────────────────┐
│   NO_SIGNAL      │
│   ────────       │
│   ▓░░░░░░░░░░    │
└──────────────────┘`}
              </pre>
              <p className="font-mono text-sm text-[color:var(--color-text-mute)]">
                {messages.length === 0
                  ? 'no captured notifications. reset the demo to capture again.'
                  : 'no matches. adjust the filter.'}
              </p>
            </div>
          )}

          {/* footer actions */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--color-edge)] pt-5">
            <span className="font-mono text-[11px] text-[color:var(--color-text-mute)]">
              No backend · message data stays on-device
            </span>
            <button
              onClick={() => setClearOpen(true)}
              className="inline-flex items-center gap-2 font-pixel text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-weak)] transition-opacity hover:opacity-80"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear data
            </button>
          </div>
        </motion.div>
      )}

      {/* summary dialog */}
      <Dialog
        open={!!summaryKey}
        onClose={() => setSummaryKey(null)}
        eyebrow="local summary · on-device"
        title={summaryConv}
        footer={
          <Button variant="outline" onClick={() => setSummaryKey(null)}>
            Close
          </Button>
        }
      >
        <p className="font-mono text-sm leading-relaxed text-[color:var(--color-text)]">
          {summaryKey ? summarize(summaryKey) : ''}
        </p>
        <p className="mt-4 font-mono text-[11px] text-[color:var(--color-text-dim)]">
          generated by the local model · {modelInstalled ? 'LiteRT-LM' : 'rules engine (no model)'}
        </p>
      </Dialog>

      {/* clear dialog */}
      <Dialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        eyebrow="destructive"
        title="Delete all local data?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setClearOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearAll();
                setClearOpen(false);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4" style={{ color: 'var(--color-weak)' }} />
          <p className="font-mono text-sm leading-relaxed text-[color:var(--color-text-mute)]">
            This deletes captured messages and open action items. Summaries are generated on
            demand, so nothing else is affected. This cannot be undone.
          </p>
        </div>
      </Dialog>
    </section>
  );
}

function LockedStream({ onEnable }: { onEnable: () => void }) {
  return (
    <Panel ticks={false} className="mt-4 bg-[color:var(--color-deep)]/50 p-10 text-center">
      <Lock className="mx-auto h-5 w-5 text-[color:var(--color-text-dim)]" />
      <pre className="mx-auto mt-5 inline-block font-pixel text-[11px] leading-tight text-[color:var(--color-text-dim)]">
{`┌──────────────────┐
│   LOW_SIGNAL     │
│   ░░░░░░░░░░░░   │
└──────────────────┘`}
      </pre>
      <p className="mx-auto mt-5 max-w-md font-mono text-sm leading-relaxed text-[color:var(--color-text-mute)]">
        No notifications captured yet. Grant notification access to let the listener score
        incoming WhatsApp messages.
      </p>
      <Button className="mt-6" onClick={onEnable}>
        Grant access (simulated)
      </Button>
    </Panel>
  );
}
