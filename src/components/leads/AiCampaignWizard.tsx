'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAutomation } from '@/context/AutomationContext';
import {
  generateKeywordsAction,
  saveKeywordHistoryAction,
} from '@/app/actions';
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
  Loader2,
  Mic,
  Plus,
  RotateCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const builtRef = useRef(false);
  const busyRef = useRef(false);
  const viewportRef = useRef<HTMLDivElement>(null);

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

  const restart = useCallback(() => {
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

  // Instant create on done (no confirm screen) with live status line.
  useEffect(() => {
    if (machine.step !== 'done' || builtRef.current) return;
    builtRef.current = true;
    void (async () => {
      setBuilding(true);
      setThinking(true);
      const slots = machine.slots;
      const taskName = buildTaskName(slots);
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

        const location = slots.wholeCountry
          ? `Complete ${slots.country}`
          : slots.selectAllCities
            ? `All cities in ${slots.state}`
            : slots.city
              ? `${slots.city}, ${slots.state}`
              : slots.state;
        await saveKeywordHistoryAction({
          name: taskName,
          niche: slots.niche,
          location,
          keywords,
        }).catch(() => {});

        const doneLabel = `Starting campaign with ${keywords.length} keywords…`;
        setBuildStatus(doneLabel);
        setThinkingLabel(doneLabel);
        pushBot([`Done — "${taskName}" is starting with ${keywords.length} keywords. Taking you to campaigns…`]);
        await startNewTask(taskName, keywords);
        // Force fresh task list before navigating so new campaign shows instantly.
        await refreshTasksNow();
        toast.success(`Campaign "${taskName}" started`);
        await wait(900);
        router.replace('/tasks');
      } catch (e) {
        builtRef.current = false;
        setBuilding(false);
        setThinking(false);
        setThinkingLabel('');
        setBuildStatus('');
        pushBot([
          `Something failed: ${(e as Error).message}. Tap Restart and try again.`,
        ]);
      }
    })();
  }, [machine, router, startNewTask, pushBot, refreshTasksNow]);

  const q = getQuestion(machine);
  const chips = machine.suggestions.length > 0 ? machine.suggestions : q.chips;
  const busy = building || busyRef.current || thinking;
  const showChips = machine.step !== 'done' && !building && !thinking && chips.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-[28px] border border-neutral-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-neutral-100">
          <div>
            <h2 className="text-[19px] font-semibold text-neutral-900">New Chat</h2>
            <p className="text-[14px] text-neutral-500 mt-0.5">How can I help you today?</p>
          </div>
          <button
            onClick={restart}
            disabled={building}
            title="Restart conversation"
            className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 transition-colors shrink-0"
          >
            <RotateCw size={17} />
          </button>
        </div>

        {/* Transcript viewport */}
        <div className="relative">
          <div
            ref={viewportRef}
            onScroll={onScroll}
            role="log"
            aria-label="Campaign builder conversation"
            aria-live="polite"
            tabIndex={0}
            className="h-[52vh] min-h-[340px] overflow-y-auto px-6 py-5 outline-none"
          >
            <div className="space-y-5">
              {messages.map((m) =>
                m.from === 'user' ? (
                  <div key={m.id} className="flex justify-center sm:justify-end">
                    <div className="max-w-[90%] sm:max-w-[80%] px-5 py-4 rounded-2xl bg-neutral-100 text-neutral-900 text-[15px] leading-relaxed">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="text-neutral-900 text-[15px] leading-relaxed">
                    <TextGenerateEffect words={m.text} duration={0.4} />
                  </div>
                )
              )}

              {thinking && (
                <div className="border-l-2 border-neutral-200 pl-4 py-0.5" aria-label="Thinking">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Brain size={15} />
                    <span className="text-[13px] font-medium">
                      {thinkingLabel || buildStatus || 'Thinking'}
                    </span>
                  </div>
                  <div className="mt-2.5 space-y-2">
                    <div className="wizard-shimmer-line h-3.5 rounded-md w-[92%]" />
                    <div className="wizard-shimmer-line h-3.5 rounded-md w-[78%]" />
                    <div className="wizard-shimmer-line h-3.5 rounded-md w-[60%]" />
                  </div>
                </div>
              )}

              {showChips && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {chips.map((c) => (
                    <button
                      key={c}
                      onClick={() => submit(c)}
                      className="px-4 py-2 rounded-full text-[13px] font-medium bg-white border border-neutral-200 text-neutral-700 shadow-sm hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
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
        <div className="px-4 pb-4 pt-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="flex items-center gap-2 rounded-2xl bg-neutral-100 px-3 py-2.5"
          >
            <button
              type="button"
              onClick={restart}
              title="New conversation"
              className="w-9 h-9 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-neutral-500 hover:text-neutral-700 shrink-0"
            >
              <Plus size={17} />
            </button>
            <input
              value={speech.interim || input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy || machine.step === 'done'}
              placeholder={speech.listening ? 'Listening… speak now' : 'Ask anything'}
              aria-label="Ask anything"
              className="flex-1 min-w-0 bg-transparent text-[15px] text-neutral-900 placeholder:text-neutral-400 outline-none"
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
          {speech.error && (
            <p className="text-[11px] text-amber-600 mt-2 px-2">{speech.error}</p>
          )}
        </div>
      </div>
      <p className="text-center text-xs text-slate-400 mt-3">
        LeadSpotter AI can make mistakes. Check campaign scope before launch.
      </p>
    </div>
  );
}
