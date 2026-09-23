/**
 * Browser speech recognition wrapper (Web Speech API).
 * Audio never leaves browser beyond vendor SR endpoint; no audio stored.
 * Unsupported browsers (Firefox) report `supported: false` — UI hides mic.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export interface SpeechState {
  supported: boolean;
  listening: boolean;
  interim: string;
  error: string | null;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function getRecognitionCtor(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  return (
    (w.SpeechRecognition as new () => SpeechRecognitionInstance) ??
    (w.webkitSpeechRecognition as new () => SpeechRecognitionInstance) ??
    null
  );
}

export function speechSupported(): boolean {
  return getRecognitionCtor() !== null;
}

/** Hook wiring mic button to transcript callback. */
export function useSpeechInput(onFinal: (text: string) => void) {
  const [state, setState] = useState<SpeechState>({
    supported: speechSupported(),
    listening: false,
    interim: '',
    error: null,
  });
  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const cbRef = useRef(onFinal);
  cbRef.current = onFinal;

  useEffect(() => {
    return () => {
      try {
        recRef.current?.abort();
      } catch {
        // ignore teardown errors
      }
    };
  }, []);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      // ignore
    }
    setState((s) => ({ ...s, listening: false, interim: '' }));
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setState((s) => ({ ...s, supported: false, error: 'Voice input not supported in this browser' }));
      return;
    }
    try {
      const rec = new Ctor();
      recRef.current = rec;
      rec.lang =
        (typeof navigator !== 'undefined' && navigator.language) || 'en-IN';
      rec.interimResults = true;
      rec.continuous = false;
      rec.onresult = (e) => {
        const res = e.results[0]?.[0];
        const transcript = res?.transcript ?? '';
        const isFinal = (e.results[0] as unknown as { isFinal?: boolean })?.isFinal;
        if (isFinal) {
          setState((s) => ({ ...s, listening: false, interim: '' }));
          if (transcript.trim()) cbRef.current(transcript.trim());
        } else {
          setState((s) => ({ ...s, interim: transcript }));
        }
      };
      rec.onerror = (e) => {
        const msg =
          e.error === 'not-allowed' || e.error === 'service-not-allowed'
            ? 'Microphone blocked — allow access or type instead'
            : e.error === 'no-speech'
              ? 'No speech heard — try again or type'
              : `Voice error (${e.error}) — type instead`;
        setState((s) => ({ ...s, listening: false, interim: '', error: msg }));
      };
      rec.onend = () => {
        setState((s) => (s.listening ? { ...s, listening: false, interim: '' } : s));
      };
      setState((s) => ({ ...s, listening: true, error: null, interim: '' }));
      rec.start();
    } catch {
      setState((s) => ({ ...s, listening: false, error: 'Could not start voice input' }));
    }
  }, []);

  const toggle = useCallback(() => {
    if (state.listening) stop();
    else start();
  }, [state.listening, start, stop]);

  return { ...state, start, stop, toggle };
}
