import type { ActionItem, CapturedMessage, TodoCategory } from './types';
import { fmtTime, PRIORITY_META } from './format';

const DAY = 24 * 60 * 60 * 1000;

const within = (ts: number, ms: number) => Date.now() - ts <= ms;

function line(m: CapturedMessage) {
  const tone = PRIORITY_META[m.priority].label;
  return `• [${tone}] ${m.conversation} — ${m.messageText}`;
}

export function messagesWithin(messages: CapturedMessage[], ms: number) {
  return messages.filter((m) => within(m.timestamp, ms));
}

export function dailyBrief(messages: CapturedMessage[], actions: ActionItem[]) {
  const today = messagesWithin(messages, DAY);
  const twoDays = messagesWithin(messages, 2 * DAY);
  const todayTodos = actions.filter((a) => a.dueAt != null && a.dueAt - Date.now() <= DAY);
  const pending = actions;

  const parts: string[] = [];
  parts.push('Here is your on-device brief for THE_UNREAD_PROBLEM.');
  parts.push('');

  parts.push(`TODAY · ${today.length} captured`);
  if (today.length === 0) parts.push('• nothing captured in the last 24h');
  else parts.push(...today.map(line));
  parts.push('');

  parts.push(`LAST 2 DAYS · ${twoDays.length} captured`);
  if (twoDays.length === 0) parts.push('• quiet');
  else parts.push(...twoDays.slice(0, 6).map(line));
  if (twoDays.length > 6) parts.push(`• …and ${twoDays.length - 6} more`);
  parts.push('');

  parts.push(`TODAY'S TODOS · ${todayTodos.length}`);
  if (todayTodos.length === 0) parts.push('• nothing due today');
  else todayTodos.forEach((a) => parts.push(`• ${a.title} — ${a.dueAt ? fmtTime(a.dueAt) : 'no time'}`));
  parts.push('');

  parts.push(`PENDING TODOS · ${pending.length}`);
  if (pending.length === 0) parts.push('• all clear');
  else pending.forEach((a) => parts.push(`• ${a.title} (${PRIORITY_META[a.priority].label})`));

  return parts.join('\n');
}

export function summarizeWindow(messages: CapturedMessage[], label: string, ms: number) {
  const set = messagesWithin(messages, ms);
  if (set.length === 0) return `No messages captured in the ${label} window.`;
  const high = set.filter((m) => m.priority === 'HIGH').length;
  const out = [`${label.toUpperCase()} · ${set.length} messages · ${high} high priority`, ''];
  out.push(...set.map(line));
  return out.join('\n');
}

export function todoSummary(
  actions: ActionItem[],
  scope: 'today' | 'pending',
  category?: TodoCategory,
) {
  const scoped = category ? actions.filter((a) => a.category === category) : actions;
  const set =
    scope === 'today'
      ? scoped.filter((a) => a.dueAt != null && a.dueAt - Date.now() <= DAY)
      : scoped;
  if (set.length === 0) {
    return scope === 'today' ? 'Nothing due today. You are clear.' : 'No pending todos.';
  }
  const title = scope === 'today' ? "TODAY'S TODOS" : 'PENDING TODOS';
  return [title, '', ...set.map((a) => `• ${a.title} — ${a.dueAt ? fmtTime(a.dueAt) : 'no time'}`)].join(
    '\n',
  );
}

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

export function answer(question: string, messages: CapturedMessage[], actions: ActionItem[]) {
  const q = question.toLowerCase();

  if (has(q, 'todo', 'to-do', 'task', 'pending')) {
    if (has(q, 'academics', 'academic', 'study', 'exam', 'college', 'notes')) {
      return todoSummary(actions, 'pending', 'academics');
    }
    if (has(q, 'placement', 'placements', 'job', 'interview', 'resume', 'career')) {
      return todoSummary(actions, 'pending', 'placements');
    }
    if (has(q, 'event', 'events', 'fest', 'party', 'meetup')) {
      return todoSummary(actions, 'pending', 'events');
    }
    if (has(q, 'family', 'home', 'parents', 'mom', 'dad', 'papa')) {
      return todoSummary(actions, 'pending', 'family');
    }
    if (has(q, 'today')) return todoSummary(actions, 'today');
    return todoSummary(actions, 'pending');
  }
  if (has(q, 'two days', '2 days', 'last two', 'yesterday', '48')) {
    return summarizeWindow(messages, 'last 2 days', 2 * DAY);
  }
  if (has(q, 'today', 'summary', 'summarise', 'summarize', 'catch me up', 'brief')) {
    return summarizeWindow(messages, 'today', DAY);
  }
  if (has(q, 'urgent', 'high', 'important')) {
    const set = messages.filter((m) => m.priority === 'HIGH');
    if (set.length === 0) return 'No high-priority messages right now.';
    return ['HIGH PRIORITY', '', ...set.map(line)].join('\n');
  }
  if (has(q, 'who', 'conversation', 'thread', 'chat')) {
    const convos = Array.from(new Set(messages.map((m) => m.conversation)));
    return ['Active threads', '', ...convos.map((c) => `• ${c}`)].join('\n');
  }
  if (has(q, 'model', 'llm', 'offline', 'privacy', 'data', 'stored')) {
    return [
      'Everything runs on-device.',
      '',
      '• Capture: NotificationListenerService reads only notification text.',
      '• Storage: local Room database, never uploaded.',
      '• Scoring: rules-first; a local LiteRT-LM model refines it when installed.',
      '• Summaries you see here are generated locally — no server.',
    ].join('\n');
  }

  return [
    `I answered this from your on-device data (rules mode).`,
    '',
    `You asked: "${question.trim()}"`,
    '',
    'Try one of the quick actions, or ask me to:',
    '• summarise today',
    '• summarise last 2 days',
    "• list today's todos",
    '• list pending todos',
  ].join('\n');
}

export const QUICK_PROMPTS = [
  { label: 'Daily brief', prompt: 'Give me the daily brief' },
  { label: 'Summarise today', prompt: 'Summarise today' },
  { label: 'Last 2 days', prompt: 'Summarise the last 2 days' },
  { label: "Today's todos", prompt: "List today's todos" },
  { label: 'Pending todos', prompt: 'List pending todos' },
];
