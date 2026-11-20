/**
 * Local chat history — past campaign conversations in localStorage.
 * No server involved; per-browser, capped at 20 entries.
 */

export interface HistoryMessage {
  from: 'bot' | 'user';
  text: string;
}

export interface ChatHistoryEntry {
  id: string;
  startedAt: number;
  taskName: string;
  keywords: number;
  status: 'started' | 'failed';
  messages: HistoryMessage[];
}

const KEY = 'leadspotter:chat-history';
const MAX = 20;

export function loadHistory(): ChatHistoryEntry[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatHistoryEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: ChatHistoryEntry): ChatHistoryEntry[] {
  try {
    const next = [entry, ...loadHistory()].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return loadHistory();
  }
}

export function clearHistory(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // storage unavailable — nothing to clear
  }
}

export function newEntryId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
