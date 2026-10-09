import { Link } from 'react-router-dom';
import { BellRing, Cpu, MessageSquareText } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Pipeline } from '@/components/sections/Pipeline';
import { useDemo } from '@/state/demo';

export function SystemPage() {
  const { access, modelInstalled, mode, enableAccess, installModel, messages, actions } = useDemo();

  const bits = [
    {
      icon: BellRing,
      label: 'NOTIFICATION ACCESS',
      value: access ? 'GRANTED' : 'NOT GRANTED',
      ok: access,
      cta: access ? null : { label: 'Grant access', onClick: enableAccess },
    },
    {
      icon: Cpu,
      label: 'LOCAL MODEL',
      value: mode === 'HYBRID' ? 'LITERT-LM' : 'RULES ONLY',
      ok: modelInstalled,
      cta: modelInstalled ? null : { label: 'Load model', onClick: installModel },
    },
  ];

  return (
    <div className="relative z-10">
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="font-pixel text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-text-mute)]">
          system_status
        </div>
        <h2 className="mt-2 font-pixel text-2xl tracking-[0.1em] text-[color:var(--color-text)]">
          THIS DEVICE
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {bits.map((b) => (
            <Panel key={b.label} ticks={false} className="bg-[color:var(--color-surface)]/40 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <b.icon className="h-4 w-4" style={{ color: 'var(--color-text-mute)' }} />
                  <span className="font-pixel text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-text-mute)]">
                    {b.label}
                  </span>
                </div>
                <span
                  className="font-pixel text-[11px] uppercase tracking-[0.16em]"
                  style={{ color: b.ok ? 'var(--color-strong)' : 'var(--color-pivot)' }}
                >
                  {b.value}
                </span>
              </div>
              {b.cta && (
                <Button size="sm" variant="outline" className="mt-4" onClick={b.cta.onClick}>
                  {b.cta.label}
                </Button>
              )}
            </Panel>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric label="CAPTURED" value={messages.length} />
          <Metric label="OPEN ACTIONS" value={actions.length} />
          <Metric label="SENT TO CLOUD" value="0" />
          <Metric label="NETWORK" value="OFF" />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border border-[color:var(--color-edge)] bg-[color:var(--color-deep)]/50 p-5">
          <p className="max-w-xl font-mono text-xs leading-relaxed text-[color:var(--color-text-mute)]">
            The assistant reads the same on-device data shown in the triage console. Ask it to
            summarise today, the last two days, or list your todos.
          </p>
          <Link to="/app/chat">
            <Button>
              <MessageSquareText className="h-4 w-4" /> Open assistant
            </Button>
          </Link>
        </div>
      </section>
      <Pipeline />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-[color:var(--color-edge)] bg-[color:var(--color-surface)]/40 p-4">
      <div className="font-mono text-2xl text-[color:var(--color-text)]">{value}</div>
      <div className="mt-1 font-pixel text-[9px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)]">
        {label}
      </div>
    </div>
  );
}
