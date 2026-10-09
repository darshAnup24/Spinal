import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Paperclip, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PromptBox({
  onSend,
  busy,
  placeholder = 'Ask about your notifications…',
}: {
  onSend: (text: string) => void;
  busy?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text || busy) return;
    onSend(text);
    setValue('');
  };

  return (
    <div className="border border-[color:var(--color-edge-glow)] bg-[color:var(--color-surface)]/70 backdrop-blur-xl transition-colors focus-within:border-[color:var(--color-text-dim)]">
      <textarea
        ref={ref}
        rows={1}
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        className="min-h-[44px] w-full resize-none bg-transparent px-4 py-3.5 font-mono text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-dim)] focus:outline-none"
      />

      <div className="flex items-center justify-between gap-2 px-3 pb-3">
        <div className="flex items-center gap-1.5">
          <IconButton label="Attach" disabled>
            <Paperclip className="h-4 w-4" />
          </IconButton>
          <span className="hidden items-center gap-1.5 border border-[color:var(--color-edge)] px-2.5 py-1.5 font-pixel text-[9px] uppercase tracking-[0.16em] text-[color:var(--color-strong)] sm:inline-flex">
            <Sparkles className="h-3 w-3" /> on-device
          </span>
        </div>

        <button
          onClick={submit}
          disabled={!value.trim() || busy}
          aria-label="Send"
          className={cn(
            'grid h-8 w-8 place-items-center border transition-colors',
            value.trim() && !busy
              ? 'border-[color:var(--color-edge-glow)] bg-[color:var(--color-text)] text-[color:var(--color-void)] hover:opacity-90'
              : 'border-[color:var(--color-edge)] text-[color:var(--color-text-dim)]',
          )}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function IconButton({
  children,
  label,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className="grid h-8 w-8 place-items-center text-[color:var(--color-text-mute)] transition-colors hover:text-[color:var(--color-text)] disabled:opacity-40"
    >
      {children}
    </button>
  );
}
