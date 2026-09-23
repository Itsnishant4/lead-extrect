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
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  Undo2,
  Sparkles,
  Bot,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/** Minimum "thinking" display before every assistant reply (ChatGPT feel). */
export const THINKING_MS = 2000;

interface Msg {
  id: number;
  from: 'bot' | 'user';
  text: string;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

let msgId = 0;
const nextId = () => ++msgId;

export default function AiCampaignWizard() {
  const { startNewTask } = useAutomation();
  const router = useRouter();
  const [machine, setMachine] = useState<MachineState>(() => initialMachine());
  const [messages, setMessages] = useState<Msg[]>([
    { id: nextId(), from: 'bot', text: getQuestion(initialMachine()).text },
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

  const pushBot = useCallback(
    (texts: string[]) => {
      setMessages((m) => [...m, ...texts.map((text) => ({ id: nextId(), from: 'bot' as const, text }))]);
    },
    []
  );

  const submit = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || busyRef.current || building) return;
      busyRef.current = true;
      setMessages((m) => [...m, { id: nextId(), from: 'user', text }]);
      setInput('');
      setThinking(true);
      setThinkingLabel('');
      // ChatGPT-style beat: always think >= 2s before answering.
      void (async () => {
        await wait(THINKING_MS);
        setMachine((prev) => {
          const next = handleAnswer(prev, text);
          const moved = next.step !== prev.step;
          const replies: string[] = [];
          if (next.hint && !moved) replies.push(next.hint);
          if (moved && next.step !== 'done') replies.push(getQuestion(next).text);
          if (replies.length > 0) {
            // Small extra beat so answer lands after loader clears.
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

  const goBack = useCallback(() => {
    if (building || busyRef.current) return;
    setMachine((prev) => {
      const next = stepBack(prev);
      pushBot([getQuestion(next).text]);
      return next;
    });
  }, [building, pushBot]);

  const restart = useCallback(() => {
    if (building) return;
    builtRef.current = false;
    busyRef.current = false;
    setThinking(false);
    const fresh = initialMachine();
    setMachine(fresh);
    setMessages([{ id: nextId(), from: 'bot', text: getQuestion(fresh).text }]);
    setInput('');
  }, [building]);

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
        pushBot([`Done — "${taskName}" is starting with ${keywords.length} keywords. Taking you to tasks…`]);
        await startNewTask(taskName, keywords);
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
  }, [machine, router, startNewTask, pushBot]);

  const q = getQuestion(machine);
  const chips = machine.suggestions.length > 0 ? machine.suggestions : q.chips;
  const busy = building || busyRef.current || thinking;

  return (
    <div className="w-full max-w-2xl flex flex-col overflow-hidden rounded-2xl md:rounded-[2rem] border border-slate-200/70 bg-white shadow-xl">
      {/* Header — model window bar */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">LeadSpotter AI</span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                online
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Campaign builder · answers instantly</p>
          </div>
        </div>
        <button
          onClick={restart}
          disabled={building}
          title="Restart conversation"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-40 transition-colors"
        >
          <RotateCcw size={16} />
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
          className="h-[380px] overflow-y-auto px-4 md:px-5 py-5 space-y-4 bg-[#fafbff] outline-none"
        >
          {messages.map((m) =>
            m.from === 'user' ? (
              <div key={m.id} className="flex justify-end gap-2.5">
                <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md bg-indigo-600 text-white text-sm leading-relaxed shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-200">
                  {m.text}
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User size={13} className="text-slate-500" />
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex justify-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={13} className="text-indigo-600" />
                </div>
                <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-bl-md bg-white border border-slate-200/80 text-slate-700 text-sm leading-relaxed shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-200">
                  {m.text}
                </div>
              </div>
            )
          )}

          {thinking && (
            <div className="flex justify-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5">
                {building ? (
                  <Loader2 size={13} className="text-indigo-600 animate-spin" />
                ) : (
                  <Bot size={13} className="text-indigo-600" />
                )}
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-slate-200/80 shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                {(thinkingLabel || buildStatus) && (
                  <span className="text-xs text-slate-400 ml-2">{thinkingLabel || buildStatus}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {!atEnd && (
          <button
            onClick={() => scrollToEnd(true)}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white/95 shadow-md text-xs font-semibold text-slate-600 hover:text-indigo-700 transition-colors"
          >
            <ArrowDown size={13} /> Jump to latest
          </button>
        )}
      </div>

      {/* Suggestion chips */}
      {machine.step !== 'done' && !building && !thinking && chips.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 md:px-5 py-3 border-t border-slate-100 bg-white">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => submit(c)}
              className="shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="border-t border-slate-100 bg-white px-4 md:px-5 py-3.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <input
              value={speech.interim || input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy || machine.step === 'done'}
              placeholder={
                speech.listening
                  ? 'Listening… speak now'
                  : machine.step === 'done'
                    ? 'Campaign started…'
                    : q.placeholder
              }
              className="w-full pl-4 pr-11 py-3 bg-slate-100/80 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all text-slate-800 placeholder:text-slate-400 text-sm outline-none"
            />
            {speech.supported && (
              <button
                type="button"
                onClick={speech.toggle}
                disabled={busy || machine.step === 'done'}
                title={speech.listening ? 'Stop listening' : 'Voice input'}
                className={cn(
                  'absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-colors',
                  speech.listening
                    ? 'bg-rose-100 text-rose-600 animate-pulse'
                    : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                )}
              >
                {speech.listening ? <MicOff size={17} /> : <Mic size={17} />}
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={busy || machine.step === 'done' || !input.trim()}
            title="Send"
            className="p-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 transition-colors shrink-0"
          >
            {thinking && !building ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <ArrowUp size={17} />
            )}
          </button>
        </form>
        <div className="flex items-center justify-between mt-2.5">
          <button
            onClick={goBack}
            disabled={busy}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-indigo-600 disabled:opacity-40"
          >
            <Undo2 size={13} /> Back
          </button>
          {speech.error ? (
            <p className="text-[11px] text-amber-600">{speech.error}</p>
          ) : (
            <p className="text-[11px] text-slate-300">AI answers after a short think · audio stays in browser</p>
          )}
        </div>
      </div>
    </div>
  );
}
