import { cn } from '@/lib/utils';

export function StatusDot({
  tone,
  size = 8,
  className,
}: {
  tone: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn('inline-block rounded-full', className)}
      style={{
        width: size,
        height: size,
        background: tone,
        boxShadow: `0 0 6px ${tone}80`,
      }}
      aria-hidden
    />
  );
}

/** Terminal cursor — pairs with the global `.blink-cursor` utility. */
export function BlinkCursor({ tone }: { tone?: string }) {
  return <span className="blink-cursor" style={tone ? { color: tone } : undefined} />;
}
