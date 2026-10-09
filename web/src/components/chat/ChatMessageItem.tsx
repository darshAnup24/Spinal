import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Check, Copy, User } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { fmtTime } from '@/lib/format';

const EASE = [0.32, 0.72, 0, 1] as const;

export function ChatMessageItem({ message, index }: { message: ChatMessage; index: number }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const tone = isUser ? 'pivot' : 'strong';

  const copy = () => {
    navigator.clipboard?.writeText(message.content).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      },
      () => {},
    );
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE }}
      className="border border-[color:var(--color-edge)] bg-[color:var(--color-surface)]/40"
      style={{ borderLeft: `2px solid var(--color-${tone})` }}
    >
      <header className="flex items-center justify-between gap-3 border-b border-[color:var(--color-edge)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          {isUser ? (
            <User className="h-3.5 w-3.5" style={{ color: `var(--color-${tone})` }} />
          ) : (
            <Bot className="h-3.5 w-3.5" style={{ color: `var(--color-${tone})` }} />
          )}
          <span
            className="font-pixel text-[10px] uppercase tracking-[0.2em]"
            style={{ color: `var(--color-${tone})` }}
          >
            {isUser ? 'you' : 'assistant'}
          </span>
          <span className="font-mono text-[10px] text-[color:var(--color-text-dim)]">
            #{String(index + 1).padStart(2, '0')} · {fmtTime(message.ts)}
          </span>
        </div>

        <button
          onClick={copy}
          aria-label="Copy"
          className="grid h-6 w-6 place-items-center text-[color:var(--color-text-dim)] transition-colors hover:text-[color:var(--color-text)]"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </header>

      <p className="whitespace-pre-wrap px-4 py-3.5 font-mono text-[13px] leading-relaxed text-[color:var(--color-text)]">
        {message.content}
      </p>
    </motion.article>
  );
}
