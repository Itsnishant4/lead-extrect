/**
 * Geo resolvers over country-state-city with memo caches.
 * Pure wrappers — same dataset manual form uses, no new bundle cost.
 */
import { Country, State, City } from 'country-state-city';
import { normalize } from './normalize';

const stateCache = new Map<string, { name: string; isoCode: string }[]>();
const cityCache = new Map<string, { name: string }[]>();

export interface CountryRef {
  name: string;
  isoCode: string;
}

export function listCountries(): CountryRef[] {
  return Country.getAllCountries().map((c) => ({ name: c.name, isoCode: c.isoCode }));
}

export function findCountry(input: string): CountryRef | null {
  const n = normalize(input);
  const all = listCountries();
  const exact = all.find((c) => normalize(c.name) === n);
  if (exact) return exact;
  const partial = all.find(
    (c) => normalize(c.name).includes(n) || n.includes(normalize(c.name))
  );
  return partial ?? null;
}

export function listStates(countryIso: string): { name: string; isoCode: string }[] {
  const hit = stateCache.get(countryIso);
  if (hit) return hit;
  const rows = State.getStatesOfCountry(countryIso).map((s) => ({
    name: s.name,
    isoCode: s.isoCode,
  }));
  stateCache.set(countryIso, rows);
  return rows;
}

export function findState(
  countryIso: string,
  input: string
): { name: string; isoCode: string } | null {
  const n = normalize(input);
  const all = listStates(countryIso);
  const exact = all.find((s) => normalize(s.name) === n);
  if (exact) return exact;
  // typo tolerant: gujrat -> Gujarat
  let best: { name: string; isoCode: string } | null = null;
  let bestScore = 0;
  for (const s of all) {
    const sn = normalize(s.name);
    const score = similarity(n, sn);
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return bestScore >= 0.55 ? best : null;
}

export function suggestStates(
  countryIso: string,
  input: string,
  k = 3
): { name: string; isoCode: string }[] {
  const n = normalize(input);
  return listStates(countryIso)
    .map((s) => ({ s, score: similarity(n, normalize(s.name)) }))
    .filter((r) => r.score >= 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((r) => r.s);
}

export function listCities(countryIso: string, stateIso: string): { name: string }[] {
  const key = `${countryIso}:${stateIso}`;
  const hit = cityCache.get(key);
  if (hit) return hit;
  const rows = City.getCitiesOfState(countryIso, stateIso).map((c) => ({
    name: c.name,
  }));
  cityCache.set(key, rows);
  return rows;
}

export function findCity(
  countryIso: string,
  stateIso: string,
  input: string
): { name: string } | null {
  const n = normalize(input);
  const all = listCities(countryIso, stateIso);
  const exact = all.find((c) => normalize(c.name) === n);
  if (exact) return exact;
  let best: { name: string } | null = null;
  let bestScore = 0;
  for (const c of all) {
    const score = similarity(n, normalize(c.name));
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return bestScore >= 0.55 ? best : null;
}

export function suggestCities(
  countryIso: string,
  stateIso: string,
  input: string,
  k = 4
): { name: string }[] {
  const n = normalize(input);
  return listCities(countryIso, stateIso)
    .map((c) => ({ c, score: similarity(n, normalize(c.name)) }))
    .filter((r) => r.score >= 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((r) => r.c);
}

/** Dice bigram similarity, local copy to keep geo.ts dependency-free. */
function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) {
    return a.includes(b) || b.includes(a) ? 0.8 : 0;
  }
  if (a.includes(b) || b.includes(a)) return 0.85;
  const grams = (s: string) => {
    const out: string[] = [];
    for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2));
    return out;
  };
  const aG = grams(a);
  const counts = new Map<string, number>();
  for (const g of aG) counts.set(g, (counts.get(g) ?? 0) + 1);
  let hits = 0;
  for (const g of grams(b)) {
    const c = counts.get(g) ?? 0;
    if (c > 0) {
      hits++;
      counts.set(g, c - 1);
    }
  }
  return (2 * hits) / (aG.length + b.length - 1);
}
