import { motion } from 'framer-motion';
import { Panel } from '@/components/ui/Panel';
import { PIPELINE } from '@/lib/mock';

export function Pipeline() {
  return (
    <section id="pipeline" className="relative z-10 mx-auto max-w-6xl px-4 py-16 md:px-8">
      <div className="mb-8 flex items-baseline justify-between">
        <h2 className="font-pixel text-xl tracking-[0.12em] text-[color:var(--color-text)]">
          PIPELINE
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-text-dim)]">
          runs entirely on the phone
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {PIPELINE.map((step, i) => {
          const tone = `var(--color-${step.tone})`;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [0.32, 0.72, 0, 1] }}
            >
              <Panel dots tone={tone} className="h-full bg-[color:var(--color-surface)]/40 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-2xl" style={{ color: tone }}>
                    {step.step}
                  </span>
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: tone, boxShadow: `0 0 6px ${tone}` }}
                  />
                </div>
                <h3 className="mt-4 font-pixel text-sm uppercase tracking-[0.18em] text-[color:var(--color-text)]">
                  {step.title}
                </h3>
                <p className="mt-2 font-mono text-[12px] leading-relaxed text-[color:var(--color-text-mute)]">
                  {step.body}
                </p>
              </Panel>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
