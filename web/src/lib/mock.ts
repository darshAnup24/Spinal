import type { ActionItem, CapturedMessage, Flow, ModelStatus } from './types';

const MIN = 60_000;
const HOUR = 60 * MIN;

const now = Date.now();

/** deterministic-ish fixtures so the demo reads the same on every load */
export const MOCK_MESSAGES: CapturedMessage[] = [
  {
    id: 'm1',
    conversation: 'Papa',
    conversationKey: 'family',
    messageText: 'I am at the hospital. Come fast. Bring the reports and the insurance file.',
    timestamp: now - 4 * MIN,
    priority: 'HIGH',
    score: 96,
    reason: 'Immediate request · health emergency',
    acknowledged: false,
  },
  {
    id: 'm2',
    conversation: 'Work · Priya',
    conversationKey: 'work-priya',
    messageText: "Client call moved to 3pm. Join the Zoom or they sign with the other vendor.",
    timestamp: now - 22 * MIN,
    priority: 'HIGH',
    score: 91,
    reason: 'Time-bound · explicit risk of loss',
    acknowledged: false,
  },
  {
    id: 'm3',
    conversation: 'Aarav',
    conversationKey: 'aarav',
    messageText: 'Flight is at 12:40. Have you reached the airport? Need to leave now if not.',
    timestamp: now - 51 * MIN,
    priority: 'HIGH',
    score: 88,
    reason: 'Time-critical logistics',
    acknowledged: false,
  },
  {
    id: 'm4',
    conversation: 'Work · Priya',
    conversationKey: 'work-priya',
    messageText: 'Can you review the deck before tomorrow morning? No rush tonight.',
    timestamp: now - 2 * HOUR,
    priority: 'MEDIUM',
    score: 61,
    reason: 'Deadline tomorrow · not immediate',
    acknowledged: false,
  },
  {
    id: 'm5',
    conversation: 'Flat 4B',
    conversationKey: 'flat-4b',
    messageText: 'Rent is due Friday. Please UPI to the usual number before noon.',
    timestamp: now - 5 * HOUR,
    priority: 'MEDIUM',
    score: 55,
    reason: 'Deadline this week · recurring obligation',
    acknowledged: false,
  },
  {
    id: 'm6',
    conversation: 'DBMS Batch',
    conversationKey: 'college',
    messageText: 'Anyone has the unit 4 notes? lol exam tomorrow',
    timestamp: now - 7 * HOUR,
    priority: 'LOW',
    score: 24,
    reason: 'Social chatter · no direct action',
    acknowledged: true,
  },
  {
    id: 'm7',
    conversation: 'Zomato',
    conversationKey: 'zomato',
    messageText: 'Your order is on the way. Track it live and rate your experience.',
    timestamp: now - 9 * HOUR,
    priority: 'LOW',
    score: 12,
    reason: 'Transactional / automated',
    acknowledged: true,
  },
  {
    id: 'm8',
    conversation: 'Amazon',
    conversationKey: 'amazon',
    messageText: 'Deal of the day — 60% off wireless headphones. Ends tonight.',
    timestamp: now - 11 * HOUR,
    priority: 'LOW',
    score: 8,
    reason: 'Promotional broadcast',
    acknowledged: true,
  },
];

export const MOCK_ACTIONS: ActionItem[] = [
  {
    id: 'a1',
    title: 'Call Papa back — hospital visit',
    dueAt: now + 45 * MIN,
    priority: 'HIGH',
    reason: 'Deadline phrase: "come fast"',
    status: 'OPEN',
    category: 'family',
  },
  {
    id: 'a2',
    title: 'Join client Zoom at 3:00pm',
    dueAt: now + 2 * HOUR,
    priority: 'HIGH',
    reason: 'Clock time detected in message',
    status: 'OPEN',
    category: 'placements',
  },
  {
    id: 'a3',
    title: 'Pay Flat 4B rent',
    dueAt: now + 3 * 24 * HOUR,
    priority: 'MEDIUM',
    reason: 'Weekday deadline: "Friday"',
    status: 'OPEN',
    category: 'family',
  },
  {
    id: 'a4',
    title: 'Review unit 4 DBMS notes',
    dueAt: now + 20 * HOUR,
    priority: 'MEDIUM',
    reason: 'Exam tomorrow — shared notes needed',
    status: 'OPEN',
    category: 'academics',
  },
  {
    id: 'a5',
    title: 'Submit placement resume',
    dueAt: now + 48 * HOUR,
    priority: 'MEDIUM',
    reason: 'Deadline phrase: "submit by Friday"',
    status: 'OPEN',
    category: 'placements',
  },
  {
    id: 'a6',
    title: 'Register for tech fest',
    dueAt: now + 26 * HOUR,
    priority: 'LOW',
    reason: 'Event deadline: "register by tomorrow"',
    status: 'OPEN',
    category: 'events',
  },
  {
    id: 'a7',
    title: 'Return library books',
    dueAt: now + 72 * HOUR,
    priority: 'LOW',
    reason: 'Reminder phrase: "return by Monday"',
    status: 'OPEN',
    category: 'academics',
  },
  {
    id: 'a8',
    title: 'Confirm dinner plans with Priya',
    dueAt: now + 5 * HOUR,
    priority: 'MEDIUM',
    reason: 'Social deadline: "confirm by 6pm"',
    status: 'OPEN',
    category: 'events',
  },
  {
    id: 'a9',
    title: 'Send insurance file to family group',
    dueAt: now + 90 * MIN,
    priority: 'HIGH',
    reason: 'Explicit request: "bring the reports"',
    status: 'OPEN',
    category: 'family',
  },
  {
    id: 'a10',
    title: 'Prep for mock interview',
    dueAt: now + 30 * HOUR,
    priority: 'MEDIUM',
    reason: 'Placement prep deadline',
    status: 'OPEN',
    category: 'placements',
  },
];

export const MOCK_SUMMARIES: Record<string, string> = {
  family:
    'Papa is at the hospital and needs you now. Bring the reports and the insurance file. No prior context in the last 24h; treat as urgent.',
  'work-priya':
    'Priya: the client call moved to 3pm (was 1pm). Attendance is decision-critical — the vendor comparison is being decided on this call. Later: a separate, lower-priority ask to review the deck by morning.',
  aarav:
    'Aarav is coordinating airport logistics: flight at 12:40, asking whether you have left. Only one actionable item — confirm departure or leave now.',
  'flat-4b':
    'Shared flat group: rent due Friday before noon, pay via UPI to the usual number. Recurring monthly reminder.',
  college:
    'Batch chatter about exam prep and unit 4 notes. No deadline, no direct request addressed to you.',
  zomato: 'Automated delivery status. No action required.',
  amazon: 'Promotional broadcast. No action required.',
};

export const MOCK_MODEL: ModelStatus = {
  mode: 'RULES_ONLY',
  installed: false,
  sizeBytes: 1_240_000_000,
  runtime: 'LiteRT-LM (GPU)',
  expectedPath: 'filesDir/models/model.litertlm',
};

export const PIPELINE: Flow[] = [
  {
    id: 'p1',
    step: '01',
    title: 'CAPTURE',
    body: 'A NotificationListenerService reads only the text WhatsApp already puts in the notification. Nothing is scraped from chats.',
    tone: 'pivot',
  },
  {
    id: 'p2',
    step: '02',
    title: 'CLASSIFY',
    body: 'A rules-first scorer runs instantly and entirely offline — keywords, deadlines, sender and thread weighting.',
    tone: 'refine',
  },
  {
    id: 'p3',
    step: '03',
    title: 'REFINE',
    body: 'If a local LiteRT-LM model is installed, it sharpens the score and summarises the thread on-device. Otherwise rules stand.',
    tone: 'strong',
  },
  {
    id: 'p4',
    step: '04',
    title: 'ACT',
    body: 'Unambiguous deadlines become reminders via AlarmManager. Everything else waits in a quiet, prioritised queue.',
    tone: 'weak',
  },
];
