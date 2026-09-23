import { describe, it, expect } from 'vitest';
import { remainingLeads, strideSample, MAX_KEYWORDS_PER_TASK } from '@/lib/wizard/budget';

describe('wizard budget', () => {
  it('unlimited plans never trim', () => {
    expect(remainingLeads({ planType: 'premium' })).toBe(Infinity);
    expect(remainingLeads({ planType: 'enterprise' })).toBe(Infinity);
  });

  it('computes remaining from bonus minus extracted', () => {
    expect(remainingLeads({ planType: 'free', bonusCredits: 100, leadsExtracted: 30 })).toBe(70);
    expect(remainingLeads({ planType: 'free', bonusCredits: 10, leadsExtracted: 50 })).toBe(0);
    expect(remainingLeads(null)).toBe(0);
  });

  it('stride sampling keeps spread endpoints', () => {
    const items = Array.from({ length: 4242 }, (_, i) => `kw-${i}`);
    const out = strideSample(items, 100);
    expect(out).toHaveLength(100);
    expect(out[0]).toBe('kw-0');
    expect(out[99]).toBe('kw-4199');
    // roughly even spacing
    expect(out[50]).toBe('kw-2121');
  });

  it('passes through small lists and caps sane', () => {
    expect(strideSample(['a', 'b'], 100)).toEqual(['a', 'b']);
    expect(strideSample([], 10)).toEqual([]);
    expect(MAX_KEYWORDS_PER_TASK).toBeGreaterThan(4242);
  });
});
