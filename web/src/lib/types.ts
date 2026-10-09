export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface CapturedMessage {
  id: string;
  conversation: string;
  conversationKey: string;
  messageText: string;
  timestamp: number;
  priority: Priority;
  score: number;
  reason: string;
  acknowledged: boolean;
}

export type TodoCategory = 'academics' | 'placements' | 'events' | 'family';

export interface ActionItem {
  id: string;
  title: string;
  dueAt: number | null;
  priority: Priority;
  reason: string;
  status: 'OPEN' | 'DONE' | 'DISMISSED';
  category: TodoCategory;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

export interface ModelStatus {
  mode: 'HYBRID' | 'RULES_ONLY';
  installed: boolean;
  sizeBytes: number;
  runtime: string;
  expectedPath: string;
}

export type Flow = {
  id: string;
  step: string;
  title: string;
  body: string;
  tone: 'strong' | 'weak' | 'pivot' | 'refine';
};
