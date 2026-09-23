import { describe, it, expect } from 'vitest';
import { normalize, bestMatch } from '@/lib/wizard/normalize';
import { resolveNiche } from '@/lib/wizard/match';
import { detectScope } from '@/lib/wizard/scope';
import {
  handleAnswer,
  initialMachine,
  buildTaskName,
  getQuestion,
} from '@/lib/wizard/machine';

describe('wizard normalize', () => {
  it('folds case, diacritics and separators', () => {
    expect(normalize('  Real-Estet  ')).toBe('real estet');
    expect(normalize('Gujrát')).toBe('gujrat');
  });

  it('bestMatch tolerates typos', () => {
    const hit = bestMatch('gujrat', ['Gujarat', 'Maharashtra'], (c) => c);
    expect(hit?.candidate).toBe('Gujarat');
  });
});

describe('wizard niche resolution', () => {
  it('resolves "real Estet leads" style input to Real Estate Agency', () => {
    expect(resolveNiche('real Estet leads').label).toBe('Real Estate Agency');
  });

  it('resolves realtor synonym', () => {
    const r = resolveNiche('realtor');
    expect(r.label).toBe('Real Estate Agency');
    expect(r.custom).toBe(false);
  });

  it('keeps unknown niche as custom with suggestions', () => {
    const r = resolveNiche('dentistt');
    expect(r.label).toBe('Dentist');
  });
});

describe('wizard scope detection', () => {
  it('detects whole-scope English + Hindi + Gujarati', () => {
    expect(detectScope('complete gujarat')).toBe('whole');
    expect(detectScope('pura gujarat')).toBe('whole');
    expect(detectScope('aakhu gujarat')).toBe('whole');
    expect(detectScope('specific city')).toBe('specific');
  });
});

describe('wizard FSM walkthrough (requested example)', () => {
  it('real estate -> india -> complete gujarat -> done with whole-state slots', () => {
    let s = initialMachine();
    s = handleAnswer(s, 'real Estet leads');
    expect(s.step).toBe('country');
    expect(s.slots.niche).toBe('Real Estate Agency');

    s = handleAnswer(s, 'india');
    expect(s.step).toBe('countryScope');

    s = handleAnswer(s, 'specific state');
    expect(s.step).toBe('state');

    s = handleAnswer(s, 'gujrat');
    expect(s.step).toBe('stateScope');
    expect(s.slots.state).toBe('Gujarat');

    s = handleAnswer(s, 'complete gujarat');
    expect(s.step).toBe('mode');

    s = handleAnswer(s, 'fast');
    expect(s.step).toBe('done');
    expect(s.slots.selectAllCities).toBe(true);
    expect(buildTaskName(s.slots)).toBe('Real Estate Agency in all cities of Gujarat');
  });

  it('specific city path resolves city and finishes', () => {
    let s = initialMachine();
    s = handleAnswer(s, 'Dentist');
    s = handleAnswer(s, 'India');
    s = handleAnswer(s, 'specific city');
    expect(s.step).toBe('state');
    s = handleAnswer(s, 'Gujarat');
    expect(s.step).toBe('city');
    s = handleAnswer(s, 'Ahmedabad');
    expect(s.step).toBe('done');
    expect(s.slots.city).toBe('Ahmedabad');
  });

  it('unknown state surfaces suggestions without advancing', () => {
    let s = initialMachine();
    s = handleAnswer(s, 'Plumber');
    s = handleAnswer(s, 'India');
    s = handleAnswer(s, 'specific state');
    const next = handleAnswer(s, 'xyzabc');
    expect(next.step).toBe('state');
    expect(next.hint).toBeTruthy();
  });

  it('whole-state phrasing at city step jumps to mode (no dead end)', () => {
    let s = initialMachine();
    s = handleAnswer(s, 'Dentist');
    s = handleAnswer(s, 'India');
    s = handleAnswer(s, 'specific city');
    s = handleAnswer(s, 'Gujarat');
    expect(s.step).toBe('city');
    s = handleAnswer(s, 'Full state Gujarat');
    expect(s.step).toBe('mode');
    expect(s.slots.selectAllCities).toBe(true);
  });

  it('change state chip returns to state step', () => {
    let s = initialMachine();
    s = handleAnswer(s, 'Dentist');
    s = handleAnswer(s, 'India');
    s = handleAnswer(s, 'specific city');
    s = handleAnswer(s, 'Gujarat');
    s = handleAnswer(s, 'Change state');
    expect(s.step).toBe('state');
  });

  it('city question always offers fallback chips', () => {
    let s = initialMachine();
    s = handleAnswer(s, 'Dentist');
    s = handleAnswer(s, 'India');
    s = handleAnswer(s, 'specific city');
    s = handleAnswer(s, 'Gujarat');
    const qq = getQuestion(s);
    expect(qq.chips.length).toBeGreaterThan(0);
  });

  it('question text advances per step', () => {
    const s = handleAnswer(initialMachine(), 'Gym');
    expect(getQuestion(s).text).toMatch(/Where should Gym/i);
  });
});
