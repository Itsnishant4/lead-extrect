'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Country, State, City } from 'country-state-city';
import { 
  Loader2, 
  Play, 
  Copy, 
  Check, 
  Search, 
  Command,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  getCityAreasAction, 
  saveCityAreasAction,
  saveKeywordHistoryAction,
} from '@/app/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { useAutomation } from '@/context/AutomationContext';

const PRESET_NICHES = [
  "Dentist",
  "Real Estate Agency",
  "Restaurant",
  "Plumber",
  "IT Company",
  "Lawyer",
  "Gym",
  "Beauty Salon",
  "HVAC Contractor",
  "Digital Marketing",
  "Accountant",
  "Interior Designer",
  "Car Dealer",
  "Pharmacy"
];

interface KeywordGeneratorProps {
  onSearch: (keyword: string) => void;
  onStartTask: (name: string, keywords: string[]) => void;
}

export default function KeywordGenerator({ onSearch, onStartTask }: KeywordGeneratorProps) {
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

  const { loadedSession, clearKeywordSession } = useAutomation();
  const router = useRouter();

  // Handle loading session from context
  useEffect(() => {
    if (loadedSession) {
      setKeywords(loadedSession.keywords);
      setTaskName(loadedSession.name);
      setNiche(loadedSession.niche);
      setIsCustomNiche(true); // Force custom niche if loading from history to ensure it displays what's saved
      
      // Clear the session from context after loading it into local state
      // so it doesn't try to reload if the component re-mounts
      // clearKeywordSession();
    }
  }, [loadedSession]);

  const countries = Country.getAllCountries();
  const states = country ? State.getStatesOfCountry(countries.find(c => c.name === country)?.isoCode || '') : [];
  const cities = state ? City.getCitiesOfState(countries.find(c => c.name === country)?.isoCode || '', states.find(s => s.name === state)?.isoCode || '') : [];

  useEffect(() => {
    if (niche) {
      if (selectAllCities && state) {
        setTaskName(`${niche} in all cities of ${state}`);
      } else if (city) {
        setTaskName(`${niche} in ${city}`);
      } else if (state) {
        setTaskName(`${niche} in ${state}`);
      }
    }
  }, [niche, state, city, selectAllCities]);

  const generateKeywords = async () => {
    if (!niche || !country || !state) return;
    setIsGenerating(true);
    
    let generated: string[] = [];
    
    if (selectAllCities && country === 'India') {
      for (let i = 0; i < cities.length; i++) {
        const c = cities[i];
        setGenStatus(`Fetching areas for ${c.name} (${i + 1}/${cities.length})...`);
        
        const cache = await getCityAreasAction(country, state, c.name);
        if (cache.success && cache.data) {
          const cityAreas = cache.data.map(area => `${niche} in ${area}, ${c.name}, ${state}, ${country}`);
          generated = [...generated, ...cityAreas];
        } else {
          try {
            const res = await fetch(`https://api.postalpincode.in/postoffice/${c.name}`);
            const data = await res.json();
            if (data && data[0] && data[0].Status === "Success") {
              const areas = data[0].PostOffice.map((po: any) => po.Name);
              const uniqueAreas = Array.from(new Set(areas)) as string[];
              await saveCityAreasAction(country, state, c.name, uniqueAreas);
              const cityAreas = uniqueAreas.map(area => `${niche} in ${area}, ${c.name}, ${state}, ${country}`);
              generated = [...generated, ...cityAreas];
            } else {
              generated.push(`${niche} in ${c.name}, ${state}, ${country}`);
            }
          } catch (e) {
            generated.push(`${niche} in ${c.name}, ${state}, ${country}`);
          }
          await new Promise(r => setTimeout(r, 100));
        }
      }
      toast.success(`Generated ${generated.length} keywords for all cities in ${state}`);
    } else if (country === 'India' && city) {
      setGenStatus(`Fetching areas for ${city}...`);
      const cache = await getCityAreasAction(country, state, city);
      if (cache.success && cache.data) {
        generated = cache.data.map(area => `${niche} in ${area}, ${city}, ${state}, ${country}`);
      } else {
        try {
          const res = await fetch(`https://api.postalpincode.in/postoffice/${city}`);
          const data = await res.json();
          if (data && data[0] && data[0].Status === "Success") {
            const areas = data[0].PostOffice.map((po: any) => po.Name);
            const uniqueAreas = Array.from(new Set(areas)) as string[];
            await saveCityAreasAction(country, state, city, uniqueAreas);
            generated = uniqueAreas.map(area => `${niche} in ${area}, ${city}, ${state}, ${country}`);
          }
        } catch (e) {
           console.error("Area fetching failed", e);
        }
      }
      toast.success(`Generated ${generated.length} keywords for ${city}`);
    }

    if (generated.length === 0) {
      if (!selectAllCities && city) {
        generated = [`${niche} in ${city}, ${state}, ${country}`];
      } else if (selectAllCities) {
        generated = cities.map(c => `${niche} in ${c.name}, ${state}, ${country}`);
      } else {
        generated = cities.slice(0, 20).map(c => `${niche} in ${c.name}, ${state}, ${country}`);
      }
    }

    setKeywords(generated);
    setIsGenerating(false);
    setGenStatus('');
    
    if (generated.length > 0) {
      const location = selectAllCities ? `All cities in ${state}` : (city ? `${city}, ${state}` : state);
      await saveKeywordHistoryAction(taskName || `${niche} Generation`, niche, location, generated);
    }
  };

  const copyAll = () => {
    navigator.clipboard.writeText(keywords.join('\n'));
    setIsCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-3xl font-bold tracking-tight">Bulk Keyword Generator</CardTitle>
          <CardDescription className="text-base ">
            Generate dozens of localized keywords for targeted lead extraction.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 space-y-6 mt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground ">
                   Niche / Business Type
                </label>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="customNiche" 
                    checked={isCustomNiche} 
                    onCheckedChange={(checked) => {
                      setIsCustomNiche(!!checked);
                      if (!checked) setNiche('');
                    }}
                  />
                  <label htmlFor="customNiche" className="text-xs text-muted-foreground/80 cursor-pointer select-none">
                    Custom Niche
                  </label>
                </div>
              </div>

              {!isCustomNiche ? (
                <Select onValueChange={setNiche} value={niche}>
                  <SelectTrigger className="h-12 bg-card/50 border-border rounded-xl">
                    <SelectValue placeholder="Select a niche" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_NICHES.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g. Pet Store, Solar Company"
                    className="pl-11 h-12 bg-card/50 border-border rounded-xl"
                  />
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm px-1.5 py-2  text-muted-foreground ">Country</label>
                <select 
                  className="w-full mt-1 px-4 py-2 text-sm bg-card/50 border border-border rounded-xl text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  value={country} 
                  onChange={(e) => { setCountry(e.target.value); setState(''); setCity(''); }}
                >
                  {countries.map(c => <option key={c.isoCode} value={c.name} className="bg-background">{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm px-1.5 py-2  text-muted-foreground ">State</label>
                <select 
                  className="w-full mt-1 px-4 py-2 text-sm bg-card/50 border border-border rounded-xl text-foreground appearance-none disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  value={state} 
                  onChange={(e) => { setState(e.target.value); setCity(''); }}
                >
                  <option value="" className="bg-background">Select State</option>
                  {states.map(s => <option key={s.isoCode} value={s.name} className="bg-background">{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm px-1.5 py-2  text-muted-foreground ">City (Optional)</label>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="selectAllCities" 
                    checked={selectAllCities} 
                    onCheckedChange={(checked) => setSelectAllCities(!!checked)}
                    disabled={!state}
                  />
                  <label htmlFor="selectAllCities" className="text-xs text-muted-foreground cursor-pointer select-none">
                    Select All Cities
                  </label>
                </div>
              </div>
              <select 
                className=" px-4 py-2 text-sm bg-card/50 border border-border rounded-xl text-foreground appearance-none disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                value={city} 
                onChange={(e) => setCity(e.target.value)}
                disabled={!state || selectAllCities}
              >
                <option value="" className="bg-background">Select City</option>
                {cities.map(c => <option key={c.name} value={c.name} className="bg-background">{c.name}</option>)}
              </select>
            </div>
          </div>

          <Button 
            onClick={generateKeywords} 
            disabled={!niche || !state || isGenerating}
            
          >
            {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <></>}
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </CardContent>
      </Card>

      <Card className="flex flex-col h-[600px] bg-card/40 border-border rounded-3xl overflow-hidden backdrop-blur-sm self-start shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b ">
          <div>
            <CardTitle className="text-xl font-bold">Planned Searches</CardTitle>
            <CardDescription className="font-medium">{keywords.length} target keywords</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" onClick={copyAll} disabled={keywords.length === 0}>
              {isCopied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
            </Button>
            {loadedSession && (
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => { setKeywords([]); setTaskName(''); clearKeywordSession(); }}>
                 <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full px-6 py-4">
            {keywords.length > 0 ? (
              <div className="space-y-3">
                {keywords.map((kw, idx) => (
                  <div key={idx} className="group flex items-center justify-between px-2 py-2 rounded-2xl border border-transparent bg-muted/50 hover:bg-muted hover:border-border transition-all">
                    <span className="text-sm  text-foreground line-clamp-1 flex-1 mr-4">{kw}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onSearch(kw)}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full mt-24 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                 <div className="p-6 rounded-3xl bg-muted/50 mb-6">
                    <Command className="h-12 w-12 opacity-20" />
                 </div>
                 <p className="text-lg font-bold text-foreground/70">Awaiting Input</p>
                 <p className="text-sm opacity-60 mt-2">Generate or load keywords to populate your target list.</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        {keywords.length > 0 && (
          <CardFooter className="p-6 border-t bg-muted/10 flex flex-col gap-5">
             <div className="w-full space-y-2.5">
                <label className="text-sm font-medium  text-muted-foreground ml-1 mb-2">Automation Campaign Name</label>
                <Input 
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="e.g. Q1 New York Dentist Leads"
                  className="w-sm md:w-full py-2 mt-2 bg-card border-border rounded-xl  px-4"
                />
             </div>
             <Button 
                className=" rounded-2xl font-bold text-base gap-3 shadow-lg hover:shadow-primary/10 transition-all" 
                onClick={() => {
                  if (!taskName.trim()) {
                    toast.error("Please enter a campaign name");
                    return;
                  }
                  onStartTask(taskName, keywords);
                  // Navigate to tasks page to see the automation running
                  router.push('/tasks');
                }}
                disabled={keywords.length === 0}
              >
               <Play className="h-5 w-5 fill-current" />
               Launch Background Automation
             </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
