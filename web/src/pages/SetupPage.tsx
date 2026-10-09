import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  Cpu,
  Database,
  Rocket,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { useDemo } from '@/state/demo';
import { cn } from '@/lib/utils';

const EASE = [0.32, 0.72, 0, 1] as const;

export function SetupPage() {
  const navigate = useNavigate();
  const { access, modelInstalled, enableAccess, installModel, completeSetup } = useDemo();
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: Bell,
      tone: 'pivot',
      eyebrow: 'step 01 · permission',
      title: 'NOTIFICATION_ACCESS',
      body: 'Android exposes the text a notification already contains. Enable the listener so the app can score incoming WhatsApp messages.',
      detail: 'No chat-history access is requested or possible.',
      done: access,
      cta: access ? 'Access granted' : 'Grant access (simulated)',
      onCta: enableAccess,
    },
    {
      icon: Cpu,
      tone: 'refine',
      eyebrow: 'step 02 · model',
      title: 'LOCAL_LLM',
      body: 'Paste a compatible LiteRT-LM model into filesDir/models/model.litertlm to enable on-device summaries and smarter ranking.',
      detail: 'Optional — rules keep working without it.',
      done: modelInstalled,
      cta: modelInstalled ? 'Model installed' : 'Load local model (simulated)',
      onCta: installModel,
    },
    {
      icon: Database,
      tone: 'strong',
      eyebrow: 'step 03 · retention',
      title: 'LOCAL_STORAGE',
      body: 'Captured messages live in an on-device database. You can clear everything from the dashboard at any time.',
      detail: 'Message text is kept out of logs in production builds.',
      done: false,
      cta: null as string | null,
      onCta: () => {},
    },
    {
      icon: Rocket,
      tone: 'dither',
      eyebrow: 'step 04 · ready',
      title: 'ENTER_DASHBOARD',
      body: 'You are set. Head into the console to triage captured notifications, open actions, and talk to the on-device assistant.',
      detail: 'Everything below is simulated in your browser.',
      done: false,
      cta: null,
      onCta: () => {},
    },
  ];

  const current = steps[step];
  const last = step === steps.length - 1;

  const finish = () => {
    completeSetup();
    navigate('/app');
  };

  return (
    <section className="relative z-10 mx-auto max-w-3xl px-4 py-16 md:px-8">
      <div className="mb-6 flex items-center justify-between">
        <span className="font-pixel text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-text-mute)]">
          {current.eyebrow}
        </span>
        <div className="flex items-center gap-1.5">
          {steps.map((s, i) => (
            <span
              key={s.title}
              className={cn(
                'h-1.5 w-6 transition-colors',
                i === step
                  ? 'bg-[color:var(--color-text)]'
                  : i < step
                    ? 'bg-[color:var(--color-edge-glow)]'
                    : 'bg-[color:var(--color-edge)]',
              )}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <Panel dots ticks className="bg-[color:var(--color-surface)]/50 p-7 md:p-9">
            <div className="flex items-start justify-between gap-4">
              <current.icon className="h-5 w-5" style={{ color: `var(--color-${current.tone})` }} />
              {current.done && (
                <span className="inline-flex items-center gap-1.5 font-pixel text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-strong)]">
                  <Check className="h-3.5 w-3.5" /> done
                </span>
              )}
            </div>

            <h1 className="mt-6 font-pixel text-2xl tracking-[0.04em] text-[color:var(--color-text)]">
              {current.title}
            </h1>
            <p className="mt-4 font-mono text-sm leading-relaxed text-[color:var(--color-text-mute)]">
              {current.body}
            </p>
            <p className="mt-3 font-mono text-[11px] text-[color:var(--color-text-dim)]">
              {current.detail}
            </p>

            {current.cta && (
              <Button
                className="mt-6"
                variant={current.done ? 'outline' : 'default'}
                onClick={current.onCta}
                disabled={current.done}
              >
                {current.done && <Check className="h-4 w-4" />}
                {current.cta}
              </Button>
            )}

            {last && (
              <div className="mt-6 grid grid-cols-2 gap-3">
                <StatusBit label="ACCESS" ok={access} />
                <StatusBit label="MODEL" ok={modelInstalled} />
              </div>
            )}
          </Panel>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => (step === 0 ? navigate('/how') : setStep((s) => s - 1))}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {last ? (
          <Button size="lg" onClick={finish}>
            <Rocket className="h-4 w-4" /> Enter dashboard
          </Button>
        ) : (
          <Button size="lg" onClick={() => setStep((s) => s + 1)}>
            {steps[step].done ? 'Continue' : 'Skip for now'} <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {!access && (
        <p className="mt-4 flex items-center gap-2 font-mono text-[11px] text-[color:var(--color-text-dim)]">
          <ShieldCheck className="h-3.5 w-3.5" />
          You can grant access later from the dashboard.
        </p>
      )}
    </section>
  );
}

function StatusBit({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between border border-[color:var(--color-edge)] bg-[color:var(--color-deep)]/60 px-3 py-2">
      <span className="font-pixel text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-text-mute)]">
        {label}
      </span>
      <span
        className="font-pixel text-[10px] uppercase tracking-[0.16em]"
        style={{ color: ok ? 'var(--color-strong)' : 'var(--color-pivot)' }}
      >
        {ok ? 'ON' : 'OFF'}
      </span>
    </div>
  );
}
