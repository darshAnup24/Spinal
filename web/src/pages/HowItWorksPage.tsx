import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ScanLine, Sparkles, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { Pipeline } from '@/components/sections/Pipeline';

const EASE = [0.32, 0.72, 0, 1] as const;

const DETAIL = [
  {
    icon: ScanLine,
    tone: 'pivot',
    title: 'READS ONLY THE SURFACE',
    body: 'The Android NotificationListenerService receives title, text and app package. That is the entire input. Message text never leaves the device and logs stay free of content.',
  },
  {
    icon: Sparkles,
    tone: 'refine',
    title: 'SCORES BEFORE YOU LOOK',
    body: 'A deterministic rules pass flags urgency signals — deadlines, money, direct questions, repeat senders. When a LiteRT-LM model is present, it re-ranks the ambiguous ones.',
  },
  {
    icon: ListChecks,
    tone: 'strong',
    title: 'TURNS NOISE INTO ACTION',
    body: 'Deadlines become open action items with due times. Threads get a one-line summary. The assistant answers “what did I miss?” without ever reaching the network.',
  },
];

export function HowItWorksPage() {
  return (
    <div className="relative z-10">
      <section className="mx-auto max-w-6xl px-4 pt-16 md:px-8">
        <div className="font-pixel text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-text-mute)]">
          the_machine
        </div>
        <h1 className="mt-3 font-pixel text-3xl tracking-[0.03em] text-[color:var(--color-text)] sm:text-4xl">
          HOW IT WORKS
        </h1>
        <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-[color:var(--color-text-mute)]">
          Four stages, all on the phone. Nothing is uploaded, nothing is scraped, and no account is
          required.
        </p>
      </section>

      <Pipeline />

      <section className="mx-auto max-w-6xl px-4 pb-8 md:px-8">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {DETAIL.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: EASE }}
            >
              <Panel ticks={false} className="h-full bg-[color:var(--color-deep)]/50 p-5">
                <d.icon className="h-4 w-4" style={{ color: `var(--color-${d.tone})` }} />
                <h3 className="mt-4 font-pixel text-[12px] uppercase tracking-[0.18em] text-[color:var(--color-text)]">
                  {d.title}
                </h3>
                <p className="mt-2 font-mono text-[12px] leading-relaxed text-[color:var(--color-text-mute)]">
                  {d.body}
                </p>
              </Panel>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--color-edge)] pt-6">
          <span className="font-mono text-xs text-[color:var(--color-text-dim)]">
            next: grant access and load the local model
          </span>
          <Link to="/setup">
            <Button size="lg">
              Continue to setup <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
