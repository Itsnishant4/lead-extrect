/**
 * Campaign wizard finite-state machine (pure, testable, no React).
 * Steps: niche -> country -> countryScope -> state -> stateScope -> city -> mode -> done.
 */
import { resolveNiche } from './match';
import { detectScope } from './scope';
import { normalize } from './normalize';
import {
  findCountry,
  findState,
  suggestStates,
  findCity,
  suggestCities,
  listCities,
  listCountries,
  listStates,
} from './geo';

export type Step =
  | 'niche'
  | 'country'
  | 'countryScope'
  | 'state'
  | 'stateScope'
  | 'city'
  | 'mode'
  | 'done';

export interface Slots {
  niche: string;
  nicheCustom: boolean;
  country: string;
  countryIso: string;
  wholeCountry: boolean;
  pendingCity: boolean;
  state: string;
  stateIso: string;
  selectAllCities: boolean;
  city: string;
  mode: 'fast' | 'slow';
}

export interface MachineState {
  step: Step;
  slots: Slots;
  /** suggestion chips for current step (geo alternatives / niche fixes) */
  suggestions: string[];
  /** hint shown under question (typo fix notice, error) */
  hint: string | null;
}

export interface Question {
  text: string;
  chips: string[];
  placeholder: string;
}

const POPULAR_STATES_IN = [
  'Gujarat',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'Delhi',
  'Rajasthan',
  'Uttar Pradesh',
  'West Bengal',
];

export function initialMachine(): MachineState {
  return {
    step: 'niche',
    slots: {
      niche: '',
      nicheCustom: false,
      country: 'India',
      countryIso: 'IN',
      wholeCountry: false,
      pendingCity: false,
      state: '',
      stateIso: '',
      selectAllCities: false,
      city: '',
      mode: 'fast',
    },
    suggestions: [],
    hint: null,
  };
}

export function getQuestion(s: MachineState): Question {
  const slots = s.slots;
  switch (s.step) {
    case 'niche':
      return {
        text: 'What leads do you want? (e.g. Real Estate, Dentist, Plumber)',
        chips: ['Real Estate Agency', 'Dentist', 'Restaurant', 'Plumber', 'IT Company', 'Gym'],
        placeholder: 'Type niche or tap a chip…',
      };
    case 'country':
      return {
        text: slots.niche
          ? `Where should ${slots.niche} leads come from?`
          : 'Which country?',
        chips: ['India', 'United States', 'United Kingdom', 'United Arab Emirates'],
        placeholder: 'Country… (Enter = India)',
      };
    case 'countryScope':
      return {
        text: `Complete ${slots.country}, or a specific state or city?`,
        chips: [`Complete ${slots.country}`, 'Specific state', 'Specific city'],
        placeholder: 'e.g. complete India / specific city…',
      };
    case 'state': {
      const popular =
        slots.countryIso === 'IN'
          ? POPULAR_STATES_IN
          : listStates(slots.countryIso).slice(0, 8).map((x) => x.name);
      return {
        text: slots.pendingCity
          ? 'Which state is the city in?'
          : 'Which state?',
        chips: s.suggestions.length > 0 ? s.suggestions : popular,
        placeholder: 'State… (e.g. Gujarat)',
      };
    }
    case 'stateScope':
      return {
        text: `Complete ${slots.state}, or a specific city?`,
        chips: [`Complete ${slots.state}`, 'Specific city'],
        placeholder: 'e.g. complete Gujarat…',
      };
    case 'city': {
      const chips =
        s.suggestions.length > 0
          ? s.suggestions
          : slots.stateIso
            ? listCities(slots.countryIso, slots.stateIso)
                .slice(0, 6)
                .map((c) => c.name)
            : [];
      return {
        text: `Which city in ${slots.state}?`,
        chips: chips.length > 0 ? chips : [`Complete ${slots.state}`, 'Change state'],
        placeholder: 'City…',
      };
    }
    case 'mode':
      return {
        text: `Complete ${slots.state} has many cities. Fast mode covers every city once; Slow adds area-wise streets but takes hours. Pick one:`,
        chips: ['Fast', 'Slow'],
        placeholder: 'Fast or Slow…',
      };
    case 'done':
      return { text: '', chips: [], placeholder: '' };
  }
}

/** Feed one user answer; returns next state (never throws). */
export function handleAnswer(prev: MachineState, rawInput: string): MachineState {
  const input = (rawInput || '').trim();
  const slots = { ...prev.slots };

  switch (prev.step) {
    case 'niche': {
      if (!input) {
        return { ...prev, hint: 'Tell a niche first — e.g. Real Estate.' };
      }
      const r = resolveNiche(input);
      if (r.custom && r.suggestions.length > 0) {
        return {
          ...prev,
          hint: `Did you mean one of these? Tap, or keep "${r.label}" as custom.`,
          suggestions: [...r.suggestions, `Use "${r.label}"`],
        };
      }
      // "Use X" chip confirms custom label
      const useMatch = input.match(/^use ["“](.+?)["”]$/i);
      const label = useMatch ? useMatch[1] : r.label;
      const custom = useMatch ? true : r.custom;
      return {
        step: 'country',
        slots: { ...slots, niche: label, nicheCustom: custom },
        suggestions: [],
        hint: null,
      };
    }

    case 'country': {
      if (!input) {
        return {
          step: 'countryScope',
          slots: { ...slots, country: 'India', countryIso: 'IN' },
          suggestions: [],
          hint: null,
        };
      }
      const hit = findCountry(input);
      if (!hit) {
        const sugg = listCountries()
          .map((c) => c.name)
          .filter((n) => n.toLowerCase().includes(normalize(input)) || normalize(input).includes(n.toLowerCase().slice(0, 4)))
          .slice(0, 4);
        return {
          ...prev,
          hint: 'Country not found — pick below or retype.',
          suggestions: sugg.length > 0 ? sugg : ['India'],
        };
      }
      return {
        step: 'countryScope',
        slots: { ...slots, country: hit.name, countryIso: hit.isoCode },
        suggestions: [],
        hint: null,
      };
    }

    case 'countryScope': {
      const scope = detectScope(input);
      if (scope === 'whole' || /complete\s+.+/i.test(input)) {
        return {
          step: 'done',
          slots: { ...slots, wholeCountry: true, selectAllCities: false, mode: 'fast' },
          suggestions: [],
          hint: null,
        };
      }
      if (/city/i.test(input)) {
        return {
          step: 'state',
          slots: { ...slots, pendingCity: true },
          suggestions: [],
          hint: null,
        };
      }
      if (/state/i.test(input) || scope === 'specific') {
        return {
          step: 'state',
          slots: { ...slots, pendingCity: false },
          suggestions: [],
          hint: null,
        };
      }
      return {
        ...prev,
        hint: 'Tap a chip or type complete / state / city.',
        suggestions: [],
      };
    }

    case 'state': {
      if (!input) {
        return { ...prev, hint: 'Type a state name.' };
      }
      const hit = findState(slots.countryIso, input);
      if (!hit) {
        return {
          ...prev,
          hint: 'State not found — pick below or retype.',
          suggestions: suggestStates(slots.countryIso, input).map((s) => s.name),
        };
      }
      const next: Slots = { ...slots, state: hit.name, stateIso: hit.isoCode };
      if (slots.pendingCity) {
        return { step: 'city', slots: next, suggestions: [], hint: null };
      }
      return { step: 'stateScope', slots: next, suggestions: [], hint: null };
    }

    case 'stateScope': {
      const scope = detectScope(input);
      if (scope === 'whole' || /complete/i.test(input)) {
        return {
          step: 'mode',
          slots: { ...slots, selectAllCities: true },
          suggestions: [],
          hint: null,
        };
      }
      return {
        step: 'city',
        slots: { ...slots, selectAllCities: false },
        suggestions: [],
        hint: null,
      };
    }

    case 'city': {
      if (!input) {
        return { ...prev, hint: 'Type a city name.' };
      }
      // Escape hatches — never trap user on this step.
      if (/^\s*change\s+state\s*$/i.test(input)) {
        return { step: 'state', slots: { ...slots, state: '', stateIso: '' }, suggestions: [], hint: null };
      }
      if (
        detectScope(input) === 'whole' ||
        /full\s+state|all\s+cities|entire|complete/i.test(input)
      ) {
        return {
          step: 'mode',
          slots: { ...slots, city: '', selectAllCities: true },
          suggestions: [],
          hint: null,
        };
      }
      // User typed a different state name — switch state, stay on city hunt.
      const otherState =
        slots.countryIso && normalize(input).length >= 3
          ? findState(slots.countryIso, input)
          : null;
      if (otherState && normalize(otherState.name) !== normalize(slots.state)) {
        return {
          step: 'city',
          slots: { ...slots, state: otherState.name, stateIso: otherState.isoCode },
          suggestions: [],
          hint: null,
        };
      }
      const hit = findCity(slots.countryIso, slots.stateIso, input);
      if (!hit) {
        return {
          ...prev,
          hint: 'City not found in this state — pick below or retype.',
          suggestions: suggestCities(slots.countryIso, slots.stateIso, input).map(
            (c) => c.name
          ),
        };
      }
      return {
        step: 'done',
        slots: { ...slots, city: hit.name, selectAllCities: false, mode: 'slow' },
        suggestions: [],
        hint: null,
      };
    }

    case 'mode': {
      const n = normalize(input);
      if (n.startsWith('slow')) {
        return { step: 'done', slots: { ...slots, mode: 'slow' }, suggestions: [], hint: null };
      }
      return { step: 'done', slots: { ...slots, mode: 'fast' }, suggestions: [], hint: null };
    }

    case 'done':
      return prev;
  }
}

/** Human task name mirroring manual flow (`Niche in City/State`). */
export function buildTaskName(slots: Slots): string {
  if (slots.wholeCountry) return `${slots.niche} in complete ${slots.country}`;
  if (slots.selectAllCities && slots.state) {
    return `${slots.niche} in all cities of ${slots.state}`;
  }
  if (slots.city) return `${slots.niche} in ${slots.city}`;
  if (slots.state) return `${slots.niche} in ${slots.state}`;
  return `${slots.niche} in ${slots.country}`;
}

/** Rough keyword estimate for progress copy (fast whole-state = city count). */
export function estimateKeywords(slots: Slots): number | null {
  try {
    if (slots.wholeCountry) return null; // depends on state fan-out
    if (slots.selectAllCities && slots.stateIso) {
      return listCities(slots.countryIso, slots.stateIso).length;
    }
    return 1;
  } catch {
    return null;
  }
}

/** Back one step (keeps slots so user can edit answer). */
export function stepBack(prev: MachineState): MachineState {
  const order: Step[] = ['niche', 'country', 'countryScope', 'state', 'stateScope', 'city', 'mode', 'done'];
  const i = order.indexOf(prev.step);
  if (i <= 0) return initialMachine();
  const back = order[i - 1];
  // Skipped steps never appear: jump over them
  if (prev.step === 'done' && prev.slots.wholeCountry) return { ...prev, step: 'countryScope', suggestions: [], hint: null };
  if (back === 'stateScope' && prev.slots.pendingCity) {
    return { ...prev, step: 'state', suggestions: [], hint: null };
  }
  if (back === 'mode') {
    return { ...prev, step: 'stateScope', suggestions: [], hint: null };
  }
  return { ...prev, step: back, suggestions: [], hint: null };
}
