import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { MOCK_ACTIONS, MOCK_MESSAGES, MOCK_SUMMARIES } from '@/lib/mock';
import { answer, dailyBrief } from '@/lib/assistant';
import type { ActionItem, CapturedMessage, ChatMessage } from '@/lib/types';

const ONBOARD_KEY = 'up.onboarded';

let seq = 0;
const uid = () => `${Date.now().toString(36)}-${(seq++).toString(36)}`;

interface DemoState {
  onboarded: boolean;
  completeSetup: () => void;

  access: boolean;
  modelInstalled: boolean;
  mode: 'HYBRID' | 'RULES_ONLY';
  messages: CapturedMessage[];
  actions: ActionItem[];

  enableAccess: () => void;
  installModel: () => void;
  acknowledge: (id: string) => void;
  setActionStatus: (id: string, status: ActionItem['status']) => void;
  clearAll: () => void;
  reset: () => void;
  summarize: (conversationKey: string) => string;

  chat: ChatMessage[];
  thinking: boolean;
  sendChat: (text: string) => void;
  ensureBrief: () => void;
}

const DemoContext = createContext<DemoState | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [onboarded, setOnboarded] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem(ONBOARD_KEY) === '1',
  );
  const [access, setAccess] = useState(false);
  const [modelInstalled, setModelInstalled] = useState(false);
  const [messages, setMessages] = useState<CapturedMessage[]>(MOCK_MESSAGES);
  const [actions, setActions] = useState<ActionItem[]>(MOCK_ACTIONS);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const briefed = useRef(false);

  const completeSetup = useCallback(() => {
    setOnboarded(true);
    try {
      localStorage.setItem(ONBOARD_KEY, '1');
    } catch {
      /* ignore */
    }
  }, []);

  const enableAccess = useCallback(() => setAccess(true), []);
  const installModel = useCallback(() => setModelInstalled(true), []);

  const acknowledge = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, acknowledged: true } : m)));
  }, []);

  const setActionStatus = useCallback((id: string, status: ActionItem['status']) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }, []);

  const clearAll = useCallback(() => {
    setMessages([]);
    setActions([]);
  }, []);

  const reset = useCallback(() => {
    setMessages(MOCK_MESSAGES);
    setActions(MOCK_ACTIONS);
    setAccess(false);
    setModelInstalled(false);
    setChat([]);
    setThinking(false);
    briefed.current = false;
    setOnboarded(false);
    try {
      localStorage.removeItem(ONBOARD_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const summarize = useCallback(
    (key: string) => MOCK_SUMMARIES[key] ?? 'No local summary available for this thread yet.',
    [],
  );

  const openActions = useMemo(() => actions.filter((a) => a.status === 'OPEN'), [actions]);

  const ensureBrief = useCallback(() => {
    if (briefed.current) return;
    briefed.current = true;
    setChat([
      {
        id: uid(),
        role: 'assistant',
        content: dailyBrief(messages, openActions),
        ts: Date.now(),
      },
    ]);
  }, [messages, openActions]);

  const sendChat = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setChat((prev) => [...prev, { id: uid(), role: 'user', content: trimmed, ts: Date.now() }]);
      setThinking(true);
      window.setTimeout(() => {
        const reply = answer(trimmed, messages, openActions);
        setChat((prev) => [
          ...prev,
          { id: uid(), role: 'assistant', content: reply, ts: Date.now() },
        ]);
        setThinking(false);
      }, 700);
    },
    [messages, openActions],
  );

  const value = useMemo<DemoState>(
    () => ({
      onboarded,
      completeSetup,
      access,
      modelInstalled,
      mode: modelInstalled ? 'HYBRID' : 'RULES_ONLY',
      messages,
      actions: openActions,
      enableAccess,
      installModel,
      acknowledge,
      setActionStatus,
      clearAll,
      reset,
      summarize,
      chat,
      thinking,
      sendChat,
      ensureBrief,
    }),
    [
      onboarded,
      completeSetup,
      access,
      modelInstalled,
      messages,
      openActions,
      enableAccess,
      installModel,
      acknowledge,
      setActionStatus,
      clearAll,
      reset,
      summarize,
      chat,
      thinking,
      sendChat,
      ensureBrief,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
}
