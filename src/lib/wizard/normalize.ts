/**
 * Text normalization for wizard NLU.
 * Accepts any script; matches against Latin CSC names after folding.
 */

/** Lowercase, trim, Unicode NFKD fold, strip diacritics, collapse spaces. */
export function normalize(input: string): string {
  return (input || '')
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Remove filler words users add in chat ("leads for", "in", "from", "please"). */
const FILLER = new Set([
  'leads', 'lead', 'for', 'from', 'in', 'of', 'please', 'give', 'me', 'get',
  'want', 'need', 'all', 'complete', 'entire', 'whole', 'specific', 'any',
]);

export function stripFiller(normalized: string): string {
  return normalized
    .split(' ')
    .filter((w) => w && !FILLER.has(w))
    .join(' ');
}

/** Dice bigram similarity 0..1. */
export function dice(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const bigrams = (s: string) => {
    const out: string[] = [];
    for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2));
    return out;
  };
  const aB = bigrams(a);
  const bB = bigrams(b);
  const counts = new Map<string, number>();
  for (const g of aB) counts.set(g, (counts.get(g) ?? 0) + 1);
  let hits = 0;
  for (const g of bB) {
    const c = counts.get(g) ?? 0;
    if (c > 0) {
      hits++;
      counts.set(g, c - 1);
    }
  }
  return (2 * hits) / (aB.length + bB.length);
}

/** Best fuzzy candidate above threshold, else null. */
export function bestMatch<T>(
  input: string,
  candidates: T[],
  key: (c: T) => string,
  threshold = 0.55
): { candidate: T; score: number } | null {
  const n = normalize(input);
  if (!n) return null;
  let best: { candidate: T; score: number } | null = null;
  for (const c of candidates) {
    const kn = normalize(key(c));
    if (!kn) continue;
    if (kn === n) return { candidate: c, score: 1 };
    const score = kn.includes(n) || n.includes(kn)
      ? 0.8 + 0.2 * (Math.min(n.length, kn.length) / Math.max(n.length, kn.length))
      : dice(n, kn);
    if (score >= threshold && (!best || score > best.score)) {
      best = { candidate: c, score };
    }
  }
  return best;
}

/** Top-k fuzzy candidates for suggestion chips. */
export function topMatches<T>(
  input: string,
  candidates: T[],
  key: (c: T) => string,
  k = 3
): { candidate: T; score: number }[] {
  const n = normalize(input);
  if (!n) return [];
  return candidates
    .map((c) => {
      const kn = normalize(key(c));
      const score =
        kn === n
          ? 1
          : kn.includes(n) || n.includes(kn)
            ? 0.8
            : dice(n, kn);
      return { candidate: c, score };
    })
    .filter((r) => r.score >= 0.35)
    .sort((x, y) => y.score - x.score)
    .slice(0, k);
}
