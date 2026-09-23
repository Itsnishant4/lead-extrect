'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAutomation } from '@/context/AutomationContext';
import {
  generateKeywordsAction,
  getUserAction,
  saveKeywordHistoryAction,
} from '@/app/actions';
import { MAX_KEYWORDS_PER_TASK, remainingLeads, strideSample } from '@/lib/wizard/budget';
import type { BudgetUser } from '@/lib/wizard/budget';
import {
  MachineState,
  buildTaskName,
  estimateKeywords,
  getQuestion,
  handleAnswer,
  initialMachine,
} from '@/lib/wizard/machine';
import { listStates } from '@/lib/wizard/geo';
import { useSpeechInput } from '@/lib/wizard/speech';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { toast } from 'sonner';
import {
  ArrowDown,
  ArrowUp,
  Brain,
  History,
  Loader2,
  Mic,
  Plus,
  RotateCw,
  Trash2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ChatHistoryEntry,
  HistoryMessage,
  clearHistory,
  loadHistory,
  newEntryId,
  saveHistoryEntry,
} from '@/lib/wizard/history';

/** Thinking display before every assistant reply. */
export const THINKING_MS = 2000;

interface Msg {
  id: number;
  from: 'bot' | 'user';
  text: string;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

let msgId = 0;
const nextId = () => ++msgId;

function firstName(full: unknown): string {
  if (typeof full !== 'string' || !full.trim()) return 'there';
  return full.trim().split(/\s+/)[0] ?? 'there';
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function locationShort(slots: { wholeCountry: boolean; country: string; state: string; city: string }): string {
  if (slots.wholeCountry) return slots.country;
  if (slots.city) return slots.city;
  return slots.state || slots.country;
}

function openingMessage(name: unknown): string {
  return `${greeting()} ${firstName(name)} 👋,\nWhat leads do you want? (e.g. Real Estate, Dentist, Plumber)`;
}

export default function AiCampaignWizard() {
  const { startNewTask, user, refreshTasksNow } = useAutomation();
  const router = useRouter();
  const [machine, setMachine] = useState<MachineState>(() => initialMachine());
  const [messages, setMessages] = useState<Msg[]>(() => [
    { id: nextId(), from: 'bot', text: openingMessage((user as { name?: unknown } | null)?.name) },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [thinkingLabel, setThinkingLabel] = useState('');
  const [building, setBuilding] = useState(false);
  const [buildStatus, setBuildStatus] = useState('');
  const [atEnd, setAtEnd] = useState(true);
  const [history, setHistory] = useState<ChatHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [viewing, setViewing] = useState<ChatHistoryEntry | null>(null);
  const builtRef = useRef(false);
  const busyRef = useRef(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  // Live session snapshot so history preview can return without losing progress.
  const liveRef = useRef<{ machine: MachineState; messages: Msg[] } | null>(null);
  const messagesRef = useRef<Msg[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToEnd = useCallback((smooth = true) => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  const onScroll = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    setAtEnd(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  }, []);

  useEffect(() => {
    if (atEnd) scrollToEnd(true);
  }, [messages, thinking, atEnd, scrollToEnd]);

  const pushBot = useCallback((texts: string[]) => {
    setMessages((m) => [...m, ...texts.map((text) => ({ id: nextId(), from: 'bot' as const, text }))]);
  }, []);

  const submit = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || busyRef.current || building) return;
      busyRef.current = true;
      setMessages((m) => [...m, { id: nextId(), from: 'user', text }]);
      setInput('');
      setThinking(true);
      setThinkingLabel('');
      // One user message -> thinking shimmer -> exactly one AI reply.
      void (async () => {
        await wait(THINKING_MS);
        setMachine((prev) => {
          const next = handleAnswer(prev, text);
          const moved = next.step !== prev.step;
          const replies: string[] = [];
          if (next.hint && !moved) replies.push(next.hint);
          if (moved && next.step !== 'done') replies.push(getQuestion(next).text);
          if (replies.length > 0) {
            setTimeout(() => pushBot(replies), 150);
            setTimeout(() => {
              setThinking(false);
              busyRef.current = false;
            }, 200);
          } else {
            setThinking(false);
            busyRef.current = false;
          }
          return next;
        });
      })();
    },
    [building, pushBot]
  );

  const speech = useSpeechInput(submit);

  const openHistory = useCallback((entry: ChatHistoryEntry) => {
    if (building || busyRef.current) return;
    liveRef.current = {
      machine,
      messages: messagesRef.current.map((m) => ({ ...m })),
    };
    setViewing(entry);
    setShowHistory(false);
    setTimeout(() => scrollToEnd(false), 50);
  }, [building, machine, scrollToEnd]);

  const closeHistory = useCallback(() => {
    const live = liveRef.current;
    if (live) {
      setMachine(live.machine);
      setMessages(live.messages.map((m) => ({ ...m })));
      liveRef.current = null;
    }
    setViewing(null);
    setTimeout(() => scrollToEnd(false), 50);
  }, [scrollToEnd]);

  const wipeHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
    setShowHistory(false);
  }, []);

  const restart = useCallback(() => {
    if (viewing) {
      liveRef.current = null;
      setViewing(null);
    }
    if (building) return;
    builtRef.current = false;
    busyRef.current = false;
    setThinking(false);
    const fresh = initialMachine();
    setMachine(fresh);
    setMessages([
      { id: nextId(), from: 'bot', text: openingMessage((user as { name?: unknown } | null)?.name) },
    ]);
    setInput('');
  }, [building, user]);

  // Latest async deps for the one-shot build effect (keeps deps stable).
  const buildDepsRef = useRef({ router, startNewTask, pushBot, refreshTasksNow });
  buildDepsRef.current = { router, startNewTask, pushBot, refreshTasksNow };

  // Instant create on done (no confirm screen) with live status line.
  // Runs EXACTLY once per arrival at done: stable [machine] dep + builtRef
  // guard that is never reset on failure (no auto-retry, no duplicates).
  useEffect(() => {
    if (machine.step !== 'done' || builtRef.current) return;
    builtRef.current = true;
    const { router, startNewTask, pushBot, refreshTasksNow } = buildDepsRef.current;
    void (async () => {
      setBuilding(true);
      setThinking(true);
      const slots = machine.slots;
      const taskName = buildTaskName(slots);
      let phase = 'generating keywords';
      try {
        let keywords: string[] = [];
        if (slots.wholeCountry) {
          const states = listStates(slots.countryIso).map((s) => s.name);
          for (let i = 0; i < states.length; i++) {
            const label = `Building keyword list… ${i + 1}/${states.length} states`;
            setBuildStatus(label);
            setThinkingLabel(label);
            const res = await generateKeywordsAction(
              slots.niche,
              slots.country,
              states[i],
              null,
              true,
              'fast'
            );
            if (res.success && 'data' in res && Array.isArray(res.data)) {
              keywords.push(...(res.data as string[]));
            }
          }
        } else {
          const est = estimateKeywords(slots);
          const label = est ? `Generating ~${est} keywords…` : 'Generating keywords…';
          setBuildStatus(label);
          setThinkingLabel(label);
          const res = await generateKeywordsAction(
            slots.niche,
            slots.country,
            slots.state || slots.country,
            slots.city || null,
            slots.selectAllCities,
            slots.selectAllCities ? slots.mode : 'slow'
          );
          if (res.success && 'data' in res && Array.isArray(res.data)) {
            keywords = res.data as string[];
          } else {
            throw new Error((res as { error?: string }).error || 'Generation failed');
          }
        }

        if (keywords.length === 0) throw new Error('No keywords generated');

        // Plan-budget fit — trim list to what the plan allows instead of
        // failing mid-extraction. Stride sampling keeps geographic spread.
        phase = 'checking plan budget';
        const budgetRes = await getUserAction().catch(() => null);
        const budgetUser = (budgetRes && (budgetRes as { data?: unknown }).data) || user;
        const remaining = remainingLeads(budgetUser as BudgetUser);
        const planLabel = String(
          (budgetUser as BudgetUser)?.planType ?? (budgetUser as BudgetUser)?.plan_type ?? 'Free'
        );
        let trimNote: string | null = null;
        if (remaining <= 0) {
          throw new Error(
            `Your ${planLabel} plan is out of leads. Upgrade to launch "${taskName}".`
          );
        }
        if (keywords.length > remaining) {
          keywords = strideSample(keywords, remaining);
          trimNote =
            `Heads up — your ${planLabel} plan covers ${remaining} leads, ` +
            `so I trimmed this campaign to ${keywords.length} keywords spread across ${locationShort(slots)}. ` +
            `Upgrade anytime for the full list.`;
        }
        if (keywords.length > MAX_KEYWORDS_PER_TASK) {
          keywords = strideSample(keywords, MAX_KEYWORDS_PER_TASK);
        }

        const location = slots.wholeCountry
          ? `Complete ${slots.country}`
          : slots.selectAllCities
            ? `All cities in ${slots.state}`
            : slots.city
              ? `${slots.city}, ${slots.state}`
              : slots.state;
        phase = 'saving history';
        await saveKeywordHistoryAction({
          name: taskName,
          niche: slots.niche,
          location,
          keywords,
        }).catch(() => {});

        const doneLabel = `Starting campaign with ${keywords.length} keywords…`;
        setBuildStatus(doneLabel);
        setThinkingLabel(doneLabel);
        const doneText = `Done — "${taskName}" is starting with ${keywords.length} keywords. Taking you to campaigns…`;
        if (trimNote) pushBot([trimNote]);
        pushBot([doneText]);
        phase = 'creating campaign';
        await startNewTask(taskName, keywords);
        // Force fresh task list before navigating so new campaign shows instantly.
        phase = 'refreshing campaign list';
        await refreshTasksNow();
        // Single terminal history save — one entry per run, never a pair.
        setHistory(
          saveHistoryEntry({
            id: newEntryId(),
            startedAt: Date.now(),
            taskName,
            keywords: keywords.length,
            status: 'started',
            messages: [
              ...messagesRef.current.map((m) => ({ from: m.from, text: m.text })),
            ],
          })
        );
        toast.success(`Campaign "${taskName}" started`);
        await wait(900);
        router.replace('/tasks');
      } catch (e) {
        // No auto-retry: builtRef stays true so this runs once. Restart
        // button starts a brand-new conversation instead of duplicating.
        setBuilding(false);
        setThinking(false);
        setThinkingLabel('');
        setBuildStatus('');
        const rawMsg = (e as Error).message;
        const failText = rawMsg.startsWith('Your ')
          ? `${rawMsg} Tap Restart to try again after upgrading.`
          : `Something failed while ${phase}: ${rawMsg}. Tap Restart and try again.`;
        setHistory(
          saveHistoryEntry({
            id: newEntryId(),
            startedAt: Date.now(),
            taskName,
            keywords: 0,
            status: 'failed',
            messages: [
              ...messagesRef.current.map((m) => ({ from: m.from, text: m.text })),
              { from: 'bot', text: failText },
            ],
          })
        );
        pushBot([failText]);
      }
    })();
  }, [machine]);

  const q = getQuestion(machine);
  const chips = machine.suggestions.length > 0 ? machine.suggestions : q.chips;
  const busy = building || busyRef.current || thinking;
  const showChips = !viewing && machine.step !== 'done' && !building && !thinking && chips.length > 0;

  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-3xl border border-neutral-200/80 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3.5 border-b border-neutral-100">
          <div className="min-w-0">
            <h2 className="text-[17px] font-semibold text-neutral-900 truncate">
              {viewing ? viewing.taskName : 'New Chat'}
            </h2>
            <p className="text-[13px] text-neutral-400 mt-px">
              {viewing
                ? `${fmtDate(viewing.startedAt)} · ${viewing.keywords} keywords`
                : 'How can I help you today?'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (viewing) closeHistory();
                else setShowHistory((v) => !v);
              }}
              disabled={building}
              title={viewing ? 'Back to current chat' : 'Chat history'}
              className={cn(
                'w-9 h-9 rounded-full border flex items-center justify-center transition-colors disabled:opacity-40',
                showHistory || viewing
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              )}
            >
              {viewing ? <X size={16} /> : <History size={16} />}
            </button>
            <button
              onClick={restart}
              disabled={building}
              title="Restart conversation"
              className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
            >
              <RotateCw size={16} />
            </button>
          </div>
        </div>

        {showHistory && !viewing ? (
          /* Local history panel */
          <div className="max-h-[52vh] min-h-[300px] overflow-y-auto px-3 py-3">
            {history.length === 0 ? (
              <p className="text-center text-sm text-neutral-400 py-14">
                No past chats yet — finished campaigns appear here.
              </p>
            ) : (
              <ul className="space-y-1">
                {history.map((h) => (
                  <li key={h.id}>
                    <button
                      onClick={() => openHistory(h)}
                      className="w-full text-left px-3.5 py-3 rounded-2xl hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[14px] font-medium text-neutral-900 truncate">
                          {h.taskName}
                        </span>
                        <span
                          className={cn(
                            'text-[11px] font-semibold shrink-0',
                            h.status === 'started' ? 'text-emerald-600' : 'text-rose-500'
                          )}
                        >
                          {h.status === 'started' ? `${h.keywords} keywords` : 'failed'}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">{fmtDate(h.startedAt)}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {history.length > 0 && (
              <div className="flex justify-center pt-2 pb-1">
                <button
                  onClick={wipeHistory}
                  className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={13} /> Clear history
                </button>
              </div>
            )}
          </div>
        ) : (
        <>
        {/* Transcript viewport */}
        <div className="relative">
          <div
            ref={viewportRef}
            onScroll={onScroll}
            role="log"
            aria-label="Campaign builder conversation"
            aria-live="polite"
            tabIndex={0}
            className="h-[50vh] min-h-[320px] overflow-y-auto px-5 py-4 outline-none"
          >
            <div className="space-y-4">
              {(viewing ? viewing.messages : messages).map((m, i) => {
                const key = viewing ? `v-${i}` : (m as Msg).id;
                return m.from === 'user' ? (
                  <div key={key} className="flex justify-center sm:justify-end">
                    <div className="max-w-[90%] sm:max-w-[80%] px-4 py-3 rounded-2xl bg-neutral-100 text-neutral-900 text-[14.5px] leading-relaxed">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={key} className="text-neutral-900 text-[14.5px] leading-relaxed">
                    {viewing ? (
                      m.text
                    ) : (
                      <TextGenerateEffect words={m.text} duration={0.4} />
                    )}
                  </div>
                );
              })}

              {thinking && !viewing && (
                <div className="border-l-2 border-neutral-200 pl-3.5 py-0.5" aria-label="Thinking">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Brain size={14} />
                    <span className="text-[12.5px] font-medium">
                      {thinkingLabel || buildStatus || 'Thinking'}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <div className="wizard-shimmer-line h-3 rounded-md w-[92%]" />
                    <div className="wizard-shimmer-line h-3 rounded-md w-[76%]" />
                    <div className="wizard-shimmer-line h-3 rounded-md w-[58%]" />
                  </div>
                </div>
              )}

              {showChips && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {chips.map((c) => (
                    <button
                      key={c}
                      onClick={() => submit(c)}
                      className="px-3.5 py-1.5 rounded-full text-[12.5px] font-medium bg-white border border-neutral-200 text-neutral-700 shadow-sm hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!atEnd && (
            <button
              onClick={() => scrollToEnd(true)}
              title="Jump to latest"
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full border border-neutral-200 bg-white shadow-md flex items-center justify-center text-neutral-600 hover:bg-neutral-50"
            >
              <ArrowDown size={16} />
            </button>
          )}
        </div>

        {/* Composer */}
        <div className="px-3.5 pb-3.5 pt-1">
          {viewing ? (
            <button
              onClick={closeHistory}
              className="w-full py-3 rounded-2xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
            >
              Return to current chat
            </button>
          ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="flex items-center gap-2 rounded-2xl bg-neutral-100 pl-2 pr-2 py-2"
          >
            <button
              type="button"
              onClick={restart}
              title="New conversation"
              className="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-700 shrink-0"
            >
              <Plus size={17} />
            </button>
            <input
              value={speech.interim || input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy || machine.step === 'done'}
              placeholder={speech.listening ? 'Listening… speak now' : 'Ask anything'}
              aria-label="Ask anything"
              className="flex-1 min-w-0 bg-transparent text-[14.5px] text-neutral-900 placeholder:text-neutral-400 outline-none"
            />
            {speech.supported && (
              <button
                type="button"
                onClick={speech.toggle}
                disabled={busy || machine.step === 'done'}
                title={speech.listening ? 'Stop listening' : 'Voice input'}
                className={cn(
                  'p-2 rounded-full transition-colors shrink-0',
                  speech.listening
                    ? 'text-rose-600 bg-rose-50 animate-pulse'
                    : 'text-neutral-400 hover:text-neutral-600'
                )}
              >
                <Mic size={18} />
              </button>
            )}
            <button
              type="submit"
              disabled={busy || machine.step === 'done' || !input.trim()}
              title="Send"
              className="w-10 h-10 rounded-full bg-[#1a56ff] text-white flex items-center justify-center hover:bg-[#1446d6] disabled:opacity-40 transition-colors shrink-0"
            >
              {thinking && !building ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <ArrowUp size={17} />
              )}
            </button>
          </form>
          )}
          {speech.error && !viewing && (
            <p className="text-[11px] text-amber-600 mt-2 px-2">{speech.error}</p>
          )}
        </div>
        </>
        )}
      </div>
      <p className="text-center text-xs text-slate-400 mt-3">
        LeadSpotter AI can make mistakes. Check campaign scope before launch.
      </p>
    </div>
  );
}
