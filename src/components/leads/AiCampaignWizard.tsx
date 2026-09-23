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
  stepBack,
} from '@/lib/wizard/machine';
import { listStates } from '@/lib/wizard/geo';
import { useSpeechInput } from '@/lib/wizard/speech';
import { toast } from 'sonner';
import {
  ArrowUp,
  ArrowDown,
  Brain,
  Loader2,
  Mic,
  Plus,
  AudioLines,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/** Minimum "thinking" display before every assistant reply. Toggleable via Think pill. */
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

export default function AiCampaignWizard() {
  const { startNewTask, user, refreshTasksNow } = useAutomation();
  const router = useRouter();
  const [machine, setMachine] = useState<MachineState>(() => initialMachine());
  const [messages, setMessages] = useState<Msg[]>(() => [
    { id: nextId(), from: 'bot', text: `${greeting()} ${firstName((user as { name?: unknown } | null)?.name)} 👋` },
    { id: nextId(), from: 'bot', text: 'What leads are you working on today?' },
    { id: nextId(), from: 'bot', text: getQuestion(initialMachine()).text },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [thinkingLabel, setThinkingLabel] = useState('');
  const [thinkMode, setThinkMode] = useState(true);
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
      // One user message -> 2s thinking -> exactly one AI reply.
      void (async () => {
        if (thinkMode) await wait(THINKING_MS);
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
    [building, pushBot, thinkMode]
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
      { id: nextId(), from: 'bot', text: `${greeting()} ${firstName((user as { name?: unknown } | null)?.name)} 👋` },
      { id: nextId(), from: 'bot', text: 'What leads are you working on today?' },
      { id: nextId(), from: 'bot', text: getQuestion(fresh).text },
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
          `Something failed: ${(e as Error).message}. Fix answers with Back, or tap Restart.`,
        ]);
      }
    })();
  }, [machine, router, startNewTask, pushBot, refreshTasksNow]);

  const goBack = useCallback(() => {
    if (building || busyRef.current) return;
    setMachine((prev) => {
      const next = stepBack(prev);
      pushBot([getQuestion(next).text]);
      return next;
    });
  }, [building, pushBot]);

  const q = getQuestion(machine);
  const chips = machine.suggestions.length > 0 ? machine.suggestions : q.chips;
  const busy = building || busyRef.current || thinking;
  const started = messages.some((m) => m.from === 'user');
  const showChips = machine.step !== 'done' && !building && !thinking && chips.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col min-h-[70vh]">
      {/* Transcript — plain text only, no bubbles, no avatars */}
      <div className="relative flex-1">
        <div
          ref={viewportRef}
          onScroll={onScroll}
          role="log"
          aria-label="Campaign builder conversation"
          aria-live="polite"
          tabIndex={0}
          className="overflow-y-auto px-4 md:px-8 py-8 space-y-6 max-h-[62vh] min-h-[40vh] outline-none"
        >
          {!started && (
            <h1 className="text-center text-2xl md:text-[28px] font-medium text-slate-900 pt-10 pb-2">
              What&apos;s on your mind today?
            </h1>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={m.from === 'user' ? 'flex justify-end' : 'flex justify-start'}
            >
              <p
                className={
                  m.from === 'user'
                    ? 'max-w-[80%] text-right text-[15px] leading-relaxed text-slate-900'
                    : 'max-w-[90%] text-left text-[15px] leading-relaxed text-slate-900 whitespace-pre-wrap'
                }
              >
                {m.text}
              </p>
            </div>
          ))}

          {thinking && (
            <div className="flex items-center gap-1.5 py-1" aria-label="Thinking">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
              {(thinkingLabel || buildStatus) && (
                <span className="text-xs text-slate-400 ml-2">{thinkingLabel || buildStatus}</span>
              )}
            </div>
          )}

          {showChips && (
            <div className="flex flex-wrap gap-2 pt-1">
              {chips.map((c) => (
                <button
                  key={c}
                  onClick={() => submit(c)}
                  className="px-4 py-2 rounded-full text-[13px] font-medium bg-white border border-slate-200 text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {!atEnd && (
          <button
            onClick={() => scrollToEnd(true)}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white shadow-md text-xs font-medium text-slate-600"
          >
            <ArrowDown size={13} /> Jump to latest
          </button>
        )}
      </div>

      {/* Composer dock */}
      <div className="px-4 md:px-8 pb-2 pt-3">
        <p className="text-center text-xs text-slate-400 mb-3">
          LeadSpotter AI can make mistakes. Check campaign scope before launch.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="flex items-center gap-1 rounded-full bg-white border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)] pl-2 pr-2 py-2"
        >
          <button
            type="button"
            onClick={restart}
            title="New conversation"
            className="p-2.5 rounded-full text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          >
            <Plus size={19} />
          </button>
          <input
            value={speech.interim || input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy || machine.step === 'done'}
            placeholder={speech.listening ? 'Listening… speak now' : 'Ask anything'}
            aria-label="Ask anything"
            className="flex-1 min-w-0 bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 outline-none"
          />
          <button
            type="button"
            onClick={() => setThinkMode((v) => !v)}
            title={thinkMode ? 'Thinking on (2s)' : 'Thinking off'}
            className={cn(
              'hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-medium transition-colors shrink-0',
              thinkMode ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-50'
            )}
          >
            <Brain size={16} /> Think
          </button>
          {speech.supported && (
            <button
              type="button"
              onClick={speech.toggle}
              disabled={busy || machine.step === 'done'}
              title={speech.listening ? 'Stop listening' : 'Voice input'}
              className={cn(
                'p-2.5 rounded-full transition-colors shrink-0',
                speech.listening
                  ? 'text-rose-600 bg-rose-50 animate-pulse'
                  : 'text-slate-700 hover:bg-slate-100'
              )}
            >
              <Mic size={19} />
            </button>
          )}
          <button
            type={input.trim() ? 'submit' : 'button'}
            onClick={input.trim() ? undefined : speech.toggle}
            disabled={busy || machine.step === 'done' || (!input.trim() && !speech.supported)}
            title={input.trim() ? 'Send' : 'Voice input'}
            className="w-10 h-10 rounded-full bg-[#0b5cff] text-white flex items-center justify-center hover:bg-[#004ee0] disabled:opacity-40 transition-colors shrink-0"
          >
            {thinking && !building ? (
              <Loader2 size={18} className="animate-spin" />
            ) : input.trim() ? (
              <ArrowUp size={18} />
            ) : (
              <AudioLines size={18} />
            )}
          </button>
        </form>
        {speech.error ? (
          <p className="text-[11px] text-amber-600 mt-2 text-center">{speech.error}</p>
        ) : (
          <div className="h-2" />
        )}
      </div>
    </div>
  );
}
