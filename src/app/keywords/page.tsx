'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Country, State, City } from 'country-state-city';
import { useAutomation } from '@/context/AutomationContext';
import { Combobox } from '@/components/ui/combobox';
import { DashboardHeader } from '@/components/DashboardHeader';
import {
  getCityAreasAction,
  saveCityAreasAction,
  saveKeywordHistoryAction,
  getBulkCityAreasAction,
  saveBulkCityAreasAction,
  generateKeywordsAction,
} from '@/app/actions';
import { toast } from 'sonner';
import {
  Loader2, Rocket, Briefcase, Copy, Check, X, ArrowRight, ShieldCheck,
} from 'lucide-react';

const PRESET_NICHES = [
  'Dentist', 'Real Estate Agency', 'Restaurant', 'Plumber',
  'IT Company', 'Lawyer', 'Gym', 'Beauty Salon',
  'HVAC Contractor', 'Digital Marketing', 'Accountant',
  'Interior Designer', 'Car Dealer', 'Pharmacy',
];

export default function KeywordsPage() {
  const {
    startNewTask,
    handleSearch,
    loadedSession,
    clearKeywordSession,
    user,
  } = useAutomation();
  const router = useRouter();

  /* ── Form state ── */
  const [niche, setNiche] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [taskName, setTaskName] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectAllCities, setSelectAllCities] = useState(false);
  const [genStatus, setGenStatus] = useState('');
  const [isCustomNiche, setIsCustomNiche] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isDeepSearch, setIsDeepSearch] = useState(false);

  /* ── Load session ── */
  useEffect(() => {
    if (loadedSession) {
      setKeywords(loadedSession.keywords);
      setTaskName(loadedSession.name);
      setNiche(loadedSession.niche);
      setIsCustomNiche(true);
      clearKeywordSession();
    }
  }, [loadedSession]);

  /* ── Location data ── */
  const countries = Country.getAllCountries();
  const states = country
    ? State.getStatesOfCountry(countries.find((c) => c.name === country)?.isoCode || '')
    : [];
  const cities = state
    ? City.getCitiesOfState(
      countries.find((c) => c.name === country)?.isoCode || '',
      states.find((s) => s.name === state)?.isoCode || ''
    )
    : [];

  /* ── Auto task name ── */
  useEffect(() => {
    if (niche) {
      if (selectAllCities && state) setTaskName(`${niche} in all cities of ${state}`);
      else if (city) setTaskName(`${niche} in ${city}`);
      else if (state) setTaskName(`${niche} in ${state}`);
    }
  }, [niche, state, city, selectAllCities]);

  const previewLimit = 100;
  const previewKeywords = keywords.slice(0, previewLimit);
  const remainingPreview = Math.max(keywords.length - previewLimit, 0);

  /* ── Generate ── */
  const generateKeywords = async () => {
    if (!niche || !country || !state) return;
    setIsGenerating(true);
    setGenStatus('Building list on server...');

    try {
      const res = await generateKeywordsAction(niche, country, state, city || null, selectAllCities);
      if (res.success && res.data) {
        let finalKeywords = res.data;

        if (isDeepSearch && city) {
          setGenStatus('Fetching pincodes for Deep Search...');
          try {
            const pinRes = await fetch(`/api/pincodes?city=${city}`);
            const pinData = await pinRes.json();
            if (pinData.success && pinData.pincodes?.length > 0) {
              const pincodes = pinData.pincodes as string[];
              setGenStatus(`Expanding with ${pincodes.length} pincodes...`);
              const pincodeKeywords: string[] = [];
              const baseLocation = city ? `${city}` : state;
              for (const pin of pincodes) pincodeKeywords.push(`${niche} in ${baseLocation} ${pin}`);
              finalKeywords = [...finalKeywords, ...pincodeKeywords];
              toast.success(`Deep Search Added: ${pincodeKeywords.length} pincode variations`);
            } else {
              toast.warning('Deep Search: No pincodes found, using base keywords.');
            }
          } catch (err) {
            console.error('Deep Search Error:', err);
            toast.error('Deep Search failed to fetch pincodes');
          }
        }

        setKeywords(finalKeywords);
        if (!isDeepSearch) toast.success(`Generated ${finalKeywords.length} keywords`);

        const location = selectAllCities ? `All cities in ${state}` : city ? `${city}, ${state}` : state;
        const historyLimit = 10000;
        const isTruncated = finalKeywords.length > historyLimit;
        const historyKeywords = isTruncated ? finalKeywords.slice(0, historyLimit) : finalKeywords;

        await saveKeywordHistoryAction(
          taskName || `${niche} Generation`,
          niche, location, historyKeywords, finalKeywords.length, isTruncated
        );
      } else {
        toast.error(`Generation failed: ${res.error}`);
      }
    } catch (e) {
      toast.error('An error occurred during generation');
    } finally {
      setIsGenerating(false);
      setGenStatus('');
    }
  };

  const copyAll = () => {
    navigator.clipboard.writeText(keywords.join('\n'));
    setIsCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  /* ── Render ── */
  return (
    <div
      className="min-h-screen flex flex-col selection:bg-indigo-100 dark:selection:bg-indigo-900 bg-gradient-to-br from-indigo-50 via-indigo-100 to-violet-50 dark:from-background dark:via-background dark:to-background text-foreground"
    >
      {/* Full-screen loading overlay */}
      {isCreatingTask && (
        <div className="fixed inset-0 bg-white/80 dark:bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-indigo-600 animate-spin" />
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-900 dark:text-foreground">Creating Automation Task...</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please wait while we set up your campaign</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── HEADER ─── */}
      <DashboardHeader activePage="bulk" />

      {/* ─── MAIN ─── */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 lg:p-16 pt-24 lg:pt-28 flex flex-col items-center">
        {/* Main form card */}
        <div className="w-full max-w-2xl glass-card rounded-2xl md:rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden">
          {/* Background blurs */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-200/30 dark:bg-purple-800/10 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-200/30 dark:bg-indigo-800/10 rounded-full blur-3xl -z-10" />

          {/* Title */}
          <div className="mb-8 md:mb-12 text-center">
            <h2 className="serif-font text-2xl md:text-4xl text-slate-900 dark:text-foreground mb-4">Launch Configuration</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-md mx-auto leading-relaxed">
              Refine your target audience and location parameters to begin the premium extraction process.
            </p>
          </div>

          <div className="space-y-10">
            <div className="space-y-6">
              {/* ── Niche ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                    Niche / Industry Focus
                  </label>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCustomNiche}
                      onChange={(e) => {
                        setIsCustomNiche(e.target.checked);
                        if (!e.target.checked) setNiche('');
                      }}
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer bg-white/80 dark:bg-white/10"
                    />
                    Custom
                  </label>
                </div>
                {!isCustomNiche ? (
                  <Combobox
                    options={PRESET_NICHES.map((n) => ({ value: n, label: n }))}
                    value={niche}
                    onChange={setNiche}
                    placeholder="Select a niche"
                    searchPlaceholder="Search niches..."
                    emptyText="No niche found."
                  />
                ) : (
                  <div className="relative group">
                    <Briefcase size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-100/50 dark:focus:ring-indigo-900/50 focus:border-indigo-400 transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium outline-none"
                      placeholder="e.g. Real Estate, Software SaaS, Medical"
                      type="text"
                    />
                  </div>
                )}
              </div>

              {/* ── Country & State ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                    Country
                  </label>
                  <Combobox
                    options={countries.map((c) => ({ value: c.name, label: c.name }))}
                    value={country}
                    onChange={(value) => { setCountry(value); setState(''); setCity(''); }}
                    placeholder="Select country"
                    searchPlaceholder="Search countries..."
                    emptyText="No country found."
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                    State / Province
                  </label>
                  <Combobox
                    options={[{ value: '', label: 'Select State' }, ...states.map((s) => ({ value: s.name, label: s.name }))]}
                    value={state}
                    onChange={(value) => { setState(value); setCity(''); }}
                    placeholder="Select state"
                    searchPlaceholder="Search states..."
                    emptyText="No state found."
                    disabled={!country}
                  />
                </div>
              </div>

              {/* ── City ── */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                  City
                </label>
                <Combobox
                  options={[{ value: '', label: 'Select City' }, ...cities.map((c) => ({ value: c.name, label: c.name }))]}
                  value={city}
                  onChange={setCity}
                  placeholder="Select city"
                  searchPlaceholder="Search cities..."
                  emptyText="No city found."
                  disabled={!state || selectAllCities}
                />
              </div>

              {/* ── Options ── */}
              <div className="pt-4 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group px-1">
                  <input
                    type="checkbox"
                    checked={selectAllCities}
                    onChange={(e) => setSelectAllCities(e.target.checked)}
                    disabled={!state}
                    className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer bg-white/80 dark:bg-white/10"
                  />
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-foreground transition-colors">
                    Target all cities in selected state
                  </span>
                </label>

                <label className="flex items-center justify-between p-4 md:p-6 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/60 dark:border-slate-700 cursor-pointer hover:bg-white/60 dark:hover:bg-white/10 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Deep Search Protocol</span>
                      <span className="bg-indigo-100/80 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Priority
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Scan every zip code for maximum lead density and data accuracy
                    </p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={isDeepSearch}
                      onChange={(e) => setIsDeepSearch(e.target.checked)}
                      disabled={!city || selectAllCities}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 dark:after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-disabled:opacity-40" />
                  </div>
                </label>
              </div>
            </div>

            {/* ── Generate / Launch button ── */}
            {keywords.length === 0 ? (
              <div className="pt-4">
                <button
                  onClick={generateKeywords}
                  disabled={!niche || !state || isGenerating}
                  className="w-full max-w-max mx-auto gradient-button text-white py-3 px-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 text-md shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      {genStatus || 'Generating...'}
                    </>
                  ) : (
                    <>
                      <Rocket size={24} />
                      Generate Keywords
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="pt-4 space-y-4">
                {/* Keywords count bar */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {keywords.length.toLocaleString()} keywords ready
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyAll}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-indigo-50/50 dark:hover:bg-indigo-950/50 transition-colors"
                    >
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                      {isCopied ? 'Copied' : 'Copy all'}
                    </button>
                    <button
                      onClick={() => { setKeywords([]); setTaskName(''); }}
                      className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50/50 dark:hover:bg-rose-950/50 transition-colors"
                    >
                      <X size={14} />
                      Clear
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="max-h-48 overflow-y-auto rounded-2xl border border-white/60 dark:border-slate-700 bg-white/30 dark:bg-white/5 p-3 space-y-1.5">
                  {previewKeywords.map((kw, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-1.5 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10 transition-colors group"
                    >
                      <span className="truncate mr-4">{kw}</span>
                      <button
                        onClick={() => handleSearch(undefined, kw)}
                        className="text-indigo-500 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}
                  {remainingPreview > 0 && (
                    <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-2">
                      +{remainingPreview.toLocaleString()} more keywords
                    </p>
                  )}
                </div>

                {/* Campaign name */}


                {/* Launch */}
                <button
                  onClick={async () => {
                    if (!taskName.trim()) { toast.error('Please enter a campaign name'); return; }
                    setIsCreatingTask(true);
                    try {
                      await startNewTask(taskName, keywords);
                      setIsCreatingTask(false);
                      router.push('/tasks');
                    } catch (error) {
                      toast.error('Failed to create task');
                      setIsCreatingTask(false);
                    }
                  }}
                  disabled={isCreatingTask || keywords.length === 0}
                  className="w-full mx-auto gradient-button text-white py-3 px-3 max-w-max rounded-2xl font-bold transition-all flex items-center justify-center gap-3 text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingTask ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      Creating Task...
                    </>
                  ) : (
                    <>
                      <Rocket size={24} />
                      Start Scraping
                    </>
                  )}
                </button>


              </div>
            )}
          </div>
        </div>

        {/* Info bar */}
        <div className="mt-8 md:mt-12 flex items-center gap-4 px-4 md:px-8 py-4 bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-300 text-sm">
          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} className="text-indigo-500" />
          </div>
          <span className="font-medium">
            Extraction starts instantly. Keyword generation is fully automated by AI.
          </span>
        </div>
      </main>
    </div>
  );
}
