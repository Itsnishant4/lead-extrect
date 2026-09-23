/**
 * Niche resolution: synonym map first, then fuzzy over presets.
 * Unknown input passes through as custom niche (manual flow supports it).
 */
import { normalize, bestMatch, topMatches } from './normalize';
import { PRESET_NICHES, resolveNicheSynonym } from './niches';

export interface NicheResolution {
  label: string;
  custom: boolean;
  suggestions: string[];
}

/** Resolve free text to preset niche or custom label. */
export function resolveNiche(input: string): NicheResolution {
  const raw = (input || '').trim();
  const n = normalize(raw);
  if (!n) return { label: '', custom: true, suggestions: [] };

  const synonym = resolveNicheSynonym(n);
  if (synonym) return { label: synonym, custom: false, suggestions: [] };

  const hit = bestMatch(raw, PRESET_NICHES, (c) => c, 0.55);
  if (hit) return { label: hit.candidate, custom: false, suggestions: [] };

  // Partial token match: "estate" -> Real Estate Agency
  const tokens = n.split(' ').filter(Boolean);
  for (const preset of PRESET_NICHES) {
    const pn = normalize(preset);
    if (tokens.some((t) => t.length >= 4 && pn.includes(t))) {
      return { label: preset, custom: false, suggestions: [] };
    }
  }

  const suggestions = topMatches(raw, PRESET_NICHES, (c) => c, 3).map(
    (r) => r.candidate
  );
  // Title-case custom fallback
  const label = raw.replace(/\s+/g, ' ').trim();
  return { label, custom: true, suggestions };
}
