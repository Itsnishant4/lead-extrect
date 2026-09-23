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
import { ArrowUp, Loader2, Mic, MicOff, RotateCcw, Undo2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Msg {
  from: 'bot' | 'user';
  text: string;
}

export default function AiCampaignWizard() {
  const { startNewTask } = useAutomation();
  const router = useRouter();
  const [machine, setMachine] = useState<MachineState>(() => initialMachine());
  const [messages, setMessages] = useState<Msg[]>([
    { from: 'bot', text: getQuestion(initialMachine()).text },
  ]);
  const [input, setInput] = useState('');
  const [building, setBuilding] = useState(false);
  const [buildStatus, setBuildStatus] = useState('');
  const builtRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, building]);

  const submit = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || building) return;
      setMessages((m) => [...m, { from: 'user', text }]);
      setInput('');
      setMachine((prev) => {
        const next = handleAnswer(prev, text);
        const moved = next.step !== prev.step;
        setMessages((m) => {
          const extra: Msg[] = [];
          if (next.hint && !moved) extra.push({ from: 'bot', text: next.hint });
          if (moved && next.step !== 'done') {
            const q = getQuestion(next);
            extra.push({ from: 'bot', text: q.text });
          }
          return [...m, ...extra];
        });
        return next;
      });
    },
    [building]
  );

  const speech = useSpeechInput(submit);

  const goBack = useCallback(() => {
    if (building) return;
    setMachine((prev) => {
      const next = stepBack(prev);
      setMessages((m) => [...m, { from: 'bot', text: getQuestion(next).text }]);
      return next;
    });
  }, [building]);

  const restart = useCallback(() => {
    if (building) return;
    builtRef.current = false;
    const fresh = initialMachine();
    setMachine(fresh);
    setMessages([{ from: 'bot', text: getQuestion(fresh).text }]);
    setInput('');
  }, [building]);

  // Instant create on done (per spec — no confirm screen)
  useEffect(() => {
    if (machine.step !== 'done' || builtRef.current) return;
    builtRef.current = true;
    void (async () => {
      setBuilding(true);
      const slots = machine.slots;
      const taskName = buildTaskName(slots);
      try {
        let keywords: string[] = [];
        if (slots.wholeCountry) {
          const states = listStates(slots.countryIso).map((s) => s.name);
          for (let i = 0; i < states.length; i++) {
            setBuildStatus(`Building keyword list… ${i + 1}/${states.length} states`);
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
          setBuildStatus(
            est ? `Generating ~${est} keywords…` : 'Generating keywords…'
          );
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

        setBuildStatus(`Starting campaign with ${keywords.length} keywords…`);
        await startNewTask(taskName, keywords);
        toast.success(`Campaign "${taskName}" started`);
        router.replace('/tasks');
      } catch (e) {
        builtRef.current = false;
        setBuilding(false);
        setBuildStatus('');
        setMessages((m) => [
          ...m,
          {
            from: 'bot',
            text: `Something failed: ${(e as Error).message}. Fix answers with Back, or tap Restart.`,
          },
        ]);
      }
    })();
  }, [machine, router, startNewTask]);

  const q = getQuestion(machine);
  const chips =
    machine.suggestions.length > 0 ? machine.suggestions : q.chips;

  return (
    <div className="w-full max-w-2xl glass-card rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold uppercase tracking-widest mb-3">
          <Sparkles size={12} /> AI assist
        </div>
        <h1 className="serif-font text-2xl md:text-3xl text-slate-900">
          Describe leads in words
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Answer questions — campaign builds itself. Voice or text, any language.
        </p>
      </div>

      <div
        ref={scrollRef}
        className="h-72 overflow-y-auto rounded-2xl border border-slate-200/60 bg-white/50 p-4 space-y-3 mb-4"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn('flex', m.from === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                m.from === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md shadow-sm'
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
        {building && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-slate-600 flex items-center gap-2 shadow-sm">
              <Loader2 size={14} className="animate-spin text-indigo-600" />
              {buildStatus || 'Working…'}
            </div>
          </div>
        )}
      </div>

      {machine.step !== 'done' && !building && chips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => submit(c)}
              className="px-3.5 py-2 rounded-full text-xs font-semibold bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            value={speech.interim || input}
            onChange={(e) => setInput(e.target.value)}
            disabled={building || machine.step === 'done'}
            placeholder={speech.listening ? 'Listening… speak now' : q.placeholder}
            className="w-full pl-5 pr-12 py-3.5 bg-white/70 border border-slate-200/60 rounded-2xl focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-400 transition-all text-slate-800 placeholder:text-slate-400 font-medium outline-none text-sm"
          />
          {speech.supported && (
            <button
              type="button"
              onClick={speech.toggle}
              disabled={building || machine.step === 'done'}
              title={speech.listening ? 'Stop listening' : 'Voice input'}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors',
                speech.listening
                  ? 'bg-rose-100 text-rose-600 animate-pulse'
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
              )}
            >
              {speech.listening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={building || machine.step === 'done' || !input.trim()}
          className="p-3.5 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          title="Send"
        >
          <ArrowUp size={18} />
        </button>
      </form>
      {speech.error && (
        <p className="text-xs text-amber-600 mt-2">{speech.error}</p>
      )}

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={goBack}
          disabled={building}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-600 disabled:opacity-40"
        >
          <Undo2 size={14} /> Back
        </button>
        <button
          onClick={restart}
          disabled={building}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 disabled:opacity-40"
        >
          <RotateCcw size={14} /> Restart
        </button>
      </div>
    </div>
  );
}
