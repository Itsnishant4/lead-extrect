import { describe, it, expect } from 'vitest';
import { slugify } from '@/lib/utils';

describe('slugify', () => {
  it('converts text to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello! @World#')).toBe('hello-world');
  });

  it('replaces multiple spaces with single dash', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
  });

  it('collapses multiple dashes', () => {
    expect(slugify('hello---world')).toBe('hello-world');
  });

  it('trims leading and trailing dashes', () => {
    expect(slugify(' -hello world- ')).toBe('hello-world');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles string with only special chars', () => {
    expect(slugify('!@#$%')).toBe('');
  });

  it('handles real-world blog titles', () => {
    expect(slugify('10 Proven Lead Generation Tips to Grow Your Business in 2026')).toBe('10-proven-lead-generation-tips-to-grow-your-business-in-2026');
    expect(slugify("LeadSpotter vs Traditional Lead Generation")).toBe('leadspotter-vs-traditional-lead-generation');
  });
});
