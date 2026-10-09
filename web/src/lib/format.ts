import type { Priority } from './types';

export const PRIORITY_META: Record<Priority, { tone: string; label: string }> = {
  HIGH: { tone: 'var(--color-weak)', label: 'HIGH' },
  MEDIUM: { tone: 'var(--color-pivot)', label: 'MEDIUM' },
  LOW: { tone: 'var(--color-strong)', label: 'LOW' },
};

export const priorityTone = (p: Priority) => PRIORITY_META[p].tone;

export function fmtTime(ts: number) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function fmtBytes(bytes: number) {
  if (!bytes) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(0)} MB`;
}
