'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Country, State, City } from 'country-state-city';
import { useAutomation } from '@/context/AutomationContext';
import { Combobox } from '@/components/ui/combobox';
import { DashboardHeader } from '@/components/DashboardHeader';
import {
  saveKeywordHistoryAction,
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
  } = useAutomation();
  const router = useRouter();

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

  useEffect(() => {
    if (loadedSession) {
      setKeywords(loadedSession.keywords as string[]);
      setTaskName(loadedSession.name);
      setNiche(loadedSession.niche);
      setIsCustomNiche(true);
      clearKeywordSession();
    }
  }, [loadedSession, clearKeywordSession]);

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

  useEffect(() => {
    if (niche) {
      if (selectAllCities && state) setTaskName(`${niche} in all cities of ${state}`);
      else if (city) setTaskName(`${niche} in ${city}`);
      else if (state) setTaskName(`${niche} in ${state}`);
    }
  }, [niche, state, city, selectAllCities]);

  const generateKeywords = async () => {
    if (!niche || !country || !state) {
      toast.error('Please select Niche, Country, and State');
      return;
    }
    setIsGenerating(true);
    setGenStatus('Fetching areas and building list...');

    try {
      const res = await generateKeywordsAction(niche, country, state, city || null, selectAllCities);
      if (res.success && 'data' in res && Array.isArray(res.data)) {
        let finalKeywords = res.data as string[];

        setKeywords(finalKeywords);
        const location = selectAllCities ? `All cities in ${state}` : city ? `${city}, ${state}` : state;
        
        await saveKeywordHistoryAction({
          name: taskName || `${niche} in ${location}`,
          niche,
          location,
          keywords: finalKeywords
        });
        toast.success(`Generated ${finalKeywords.length} keywords`);
      } else {
        toast.error((res as any).error || 'Generation failed');
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-indigo-100 to-violet-50 text-foreground">
      {isCreatingTask && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[60] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-indigo-600 animate-spin" />
            <p className="text-lg font-semibold">Creating Automation Task...</p>
          </div>
        </div>
      )}
      <DashboardHeader activePage="bulk" />
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 lg:p-16 pt-24 lg:pt-28 flex flex-col items-center">
        <div className="w-full max-w-2xl glass-card rounded-2xl md:rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden">
          <div className="mb-8 md:mb-12 text-center">
            <h2 className="serif-font text-2xl md:text-4xl text-slate-900 mb-4">Launch Configuration</h2>
            <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto leading-relaxed">Refine parameters to begin extraction.</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Niche</label>
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCustomNiche}
                    onChange={(e) => {
                      setIsCustomNiche(e.target.checked);
                      if (!e.target.checked) setNiche('');
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
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
                  <Briefcase size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white/60 border border-slate-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-400 transition-all text-slate-800 placeholder:text-slate-400 font-medium outline-none"
                    placeholder="e.g. Real Estate, Software SaaS, Medical"
                    type="text"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-5">
              <Combobox options={countries.map((c) => ({ value: c.name, label: c.name }))} value={country} onChange={setCountry} />
              <Combobox options={states.map((s) => ({ value: s.name, label: s.name }))} value={state} onChange={setState} />
            </div>
            <Combobox options={cities.map((c) => ({ value: c.name, label: c.name }))} value={city} onChange={setCity} disabled={selectAllCities} />
            <div className="flex items-center gap-3"><input type="checkbox" checked={selectAllCities} onChange={(e) => setSelectAllCities(e.target.checked)} /><span>Target all cities in selected state</span></div>
            
            {keywords.length === 0 ? (
              <button onClick={generateKeywords} disabled={isGenerating} className="w-full gradient-button text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg">
                {isGenerating ? <Loader2 className="animate-spin size-5" /> : <Rocket />} Generate
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between font-bold text-sm">
                  <span>{keywords.length} keywords ready</span>
                  <div className="flex gap-2">
                    <button onClick={copyAll} className="text-xs text-indigo-600 px-3 py-1.5 rounded-lg border">{isCopied ? <Check size={14} /> : <Copy size={14} />}</button>
                    <button onClick={() => setKeywords([])} className="text-xs text-rose-500 px-3 py-1.5 rounded-lg border"><X size={14} /></button>
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto rounded-2xl border p-3 bg-white/30 space-y-1.5">
                  {keywords.slice(0, 50).map((kw, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-1.5 text-sm hover:bg-white/50 rounded-xl group">
                      <span className="truncate">{kw}</span>
                      <button onClick={() => handleSearch(undefined, kw)} className="text-indigo-500 opacity-0 group-hover:opacity-100"><ArrowRight size={14} /></button>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={async () => {
                    setIsCreatingTask(true);
                    await startNewTask(taskName, keywords);
                    setIsCreatingTask(false);
                    router.replace('/tasks');
                  }} 
                  className="w-full gradient-button text-white py-3 rounded-2xl font-bold"
                >
                  Start Scraping
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
