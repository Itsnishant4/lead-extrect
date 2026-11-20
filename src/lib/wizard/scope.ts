/**
 * Whole-vs-specific scope detector.
 * Day-one keyword lists cover 8 languages (Latin + native scripts).
 * Unknown phrasing defaults to specific and wizard asks follow-up.
 */

export type ScopeIntent = 'whole' | 'specific' | 'unknown';

const WHOLE_WORDS = [
  // English
  'all', 'complete', 'entire', 'whole', 'full', 'every', 'everywhere',
  // Hindi
  'pura', 'poora', 'sara', 'saara', 'sampoorna', 'पूरा', 'सारा', 'संपूर्ण',
  // Gujarati
  'aakhu', 'samagra', 'આખું', 'સમગ્ર',
  // Marathi
  'sagla', 'sampoorna', 'सगळं', 'संपूर्ण',
  // Bengali
  'puro', 'somogro', 'পুরো', 'সমগ্র',
  // Tamil
  'muzhuvathum', 'முழுவதும்',
  // Telugu
  'mottham', 'పూర్తి', 'మొత్తం',
  // Kannada
  'poorna', 'ಪೂರ್ಣ',
];

const SPECIFIC_WORDS = [
  // English
  'specific', 'particular', 'certain', 'only', 'just one', 'one city', 'selected',
  // Hindi
  'khaas', 'विशिष्ट', 'केवल',
  // Gujarati
  'chokkas', 'ચોક્કસ', 'ફક્ત',
  // Marathi
  'vishishta', 'विशिष्ट',
  // Bengali
  'nirdishto', 'নির্দিষ্ট',
  // Tamil
  'kurippitta', 'குறிப்பிட்ட',
  // Telugu
  'pratyeka', 'ప్రత్యేక',
  // Kannada
  'nirdishta', 'ನಿರ್ದಿಷ್ಟ',
];

export function detectScope(input: string): ScopeIntent {
  const n = ` ${(input || '').toLowerCase()} `;
  for (const w of WHOLE_WORDS) {
    if (w.includes(' ')) {
      if (n.includes(` ${w} `)) return 'whole';
    } else if (n.includes(w)) {
      return 'whole';
    }
  }
  for (const w of SPECIFIC_WORDS) {
    if (n.includes(w)) return 'specific';
  }
  return 'unknown';
}
