import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Bell, Cpu, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';

const EASE = [0.32, 0.72, 0, 1] as const;

const FEATURES = [
  {
    icon: Bell,
    tone: 'pivot',
    title: 'CAPTURE',
    body: 'A notification listener reads only the text WhatsApp already surfaces. No chat-history API, no scraping.',
  },
  {
    icon: Cpu,
    tone: 'refine',
    title: 'RANK',
    body: 'Rules score every message HIGH / MEDIUM / LOW. A local model refines the call when installed.',
  },
  {
    icon: ShieldCheck,
    tone: 'strong',
    title: 'RESOLVE',
    body: 'Extract deadlines into actions, summarise threads, and ask the assistant — entirely offline.',
  },
];

export function WelcomePage() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-20 md:px-8">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 border border-[color:var(--color-edge)] px-3 py-1.5 font-pixel text-[10px] uppercase tracking-[0.24em] text-[color:var(--color-text-mute)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-strong)] shadow-[0_0_6px_var(--color-strong)]" />
            ANDROID · ON-DEVICE · NO BACKEND
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
            className="mt-6 font-pixel text-4xl leading-[1.05] tracking-[0.02em] text-[color:var(--color-text)] sm:text-5xl"
          >
            THE_UNREAD_
            <br />
            PROBLEM
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
            className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-[color:var(--color-text-mute)]"
          >
            Drowning in notifications. Nothing urgent. Everything loud. This app reads only what
            your phone already shows, scores it, and tells you the one thing that actually matters —
            before you open a single chat.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to="/how">
              <Button size="lg">
                How it works <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/setup">
              <Button size="lg" variant="outline">
                Skip to setup
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        >
          <Panel dots className="bg-[color:var(--color-surface)]/50 p-6">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[11px] uppercase tracking-[0.24em] text-[color:var(--color-text-mute)]">
                TODAY · SUMMARY
              </span>
              <span className="font-mono text-[10px] text-[color:var(--color-text-dim)]">
                local · 0 bytes sent
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {[
                { tone: 'weak', label: 'HIGH', text: 'Rent split — reply before 9pm' },
                { tone: 'pivot', label: 'MED', text: 'Standup moved to 10:30' },
                { tone: 'strong', label: 'LOW', text: 'Dark mode memes (14 unread)' },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center gap-3 border border-[color:var(--color-edge)] bg-[color:var(--color-deep)]/60 px-3 py-2.5"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      background: `var(--color-${row.tone})`,
                      boxShadow: `0 0 6px var(--color-${row.tone})`,
                    }}
                  />
                  <span
                    className="font-pixel text-[10px] tracking-[0.14em]"
                    style={{ color: `var(--color-${row.tone})` }}
                  >
                    {row.label}
                  </span>
                  <span className="font-mono text-[12px] text-[color:var(--color-text)]">
                    {row.text}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </motion.div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-3 md:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: i * 0.08, ease: EASE }}
          >
            <Panel ticks={false} className="h-full bg-[color:var(--color-surface)]/40 p-5">
              <f.icon className="h-4 w-4" style={{ color: `var(--color-${f.tone})` }} />
              <h3 className="mt-4 font-pixel text-sm uppercase tracking-[0.2em] text-[color:var(--color-text)]">
                {f.title}
              </h3>
              <p className="mt-2 font-mono text-[12px] leading-relaxed text-[color:var(--color-text-mute)]">
                {f.body}
              </p>
            </Panel>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
