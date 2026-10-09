import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';

export function NoticeCard({
  title,
  body,
  tone,
  cta,
  onCta,
  icon,
}: {
  title: string;
  body: string;
  tone: string;
  cta?: string;
  onCta?: () => void;
  icon?: ReactNode;
}) {
  return (
    <Panel
      tone={tone}
      className="mb-3 bg-[color:var(--color-deep)]/70 p-4"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5" style={{ color: tone }}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div
            className="font-pixel text-[12px] uppercase tracking-[0.16em]"
            style={{ color: tone }}
          >
            {title}
          </div>
          <p className="mt-1.5 font-mono text-xs leading-relaxed text-[color:var(--color-text-mute)]">
            {body}
          </p>
          {cta && onCta && (
            <button
              onClick={onCta}
              className="mt-3 inline-flex items-center gap-1.5 font-pixel text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-text)] transition-colors hover:text-[color:var(--color-dither)]"
            >
              {cta}
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </Panel>
  );
}
