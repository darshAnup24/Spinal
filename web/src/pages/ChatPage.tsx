import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { PromptBox } from '@/components/chat/PromptBox';
import { ChatMessageItem } from '@/components/chat/ChatMessageItem';
import { useDemo } from '@/state/demo';
import { QUICK_PROMPTS } from '@/lib/assistant';

export function ChatPage() {
  const { chat, thinking, sendChat, ensureBrief } = useDemo();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureBrief();
  }, [ensureBrief]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat.length, thinking]);

  return (
    <section className="relative z-10 mx-auto max-w-3xl px-4 py-10 md:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-pixel text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-text-mute)]">
            local_model · offline
          </div>
          <h2 className="mt-2 font-pixel text-2xl tracking-[0.1em] text-[color:var(--color-text)]">
            ASSISTANT
          </h2>
          <p className="mt-2 max-w-xl font-mono text-xs leading-relaxed text-[color:var(--color-text-mute)]">
            Ask what you missed. It summarises today and the last two days, lists today’s and
            pending todos, and answers follow-ups — all from on-device data.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-3 pb-48">
        {chat.map((m, i) => (
          <ChatMessageItem key={m.id} message={m} index={i} />
        ))}

        {thinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 border border-[color:var(--color-edge)] border-l-2 bg-[color:var(--color-surface)]/40 px-4 py-3 font-mono text-[12px] text-[color:var(--color-text-mute)]"
            style={{ borderLeftColor: 'var(--color-strong)' }}
          >
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--color-strong)]" />
            analysing on-device
            <span className="animate-pulse">…</span>
          </motion.div>
        )}

        <div ref={endRef} />
      </div>

      <div className="fixed inset-x-0 bottom-20 z-30 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => sendChat(p.prompt)}
                disabled={thinking}
                className="shrink-0 border border-[color:var(--color-edge)] bg-[color:var(--color-deep)]/80 px-3 py-1.5 font-pixel text-[9px] uppercase tracking-[0.16em] text-[color:var(--color-text-mute)] backdrop-blur transition-colors hover:border-[color:var(--color-edge-glow)] hover:text-[color:var(--color-text)] disabled:opacity-40"
              >
                {p.label}
              </button>
            ))}
          </div>
          <PromptBox onSend={sendChat} busy={thinking} />
        </div>
      </div>
    </section>
  );
}
