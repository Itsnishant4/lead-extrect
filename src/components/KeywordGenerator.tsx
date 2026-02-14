'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Country, State, City } from 'country-state-city';
import {
  Play,
  Copy,
  Check,
  MagnifyingGlass,
  Command,
  ArrowRight,
  Trash,
  Sparkle,
} from 'phosphor-react';
import { LoaderCircle } from "lucide-react";
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
import { Switch } from '@/components/ui/switch';
import {
  getCityAreasAction,
  saveCityAreasAction,
  saveKeywordHistoryAction,
  getBulkCityAreasAction,
  saveBulkCityAreasAction,
  generateKeywordsAction,
} from '@/app/actions';
import { toast } from 'sonner';
import { useAutomation } from '@/context/AutomationContext';
import { Combobox } from '@/components/ui/combobox';

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
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isDeepSearch, setIsDeepSearch] = useState(false); // New State

  const { loadedSession, clearKeywordSession } = useAutomation();
  const router = useRouter();
  const previewLimit = 100;
  const previewKeywords = keywords.slice(0, previewLimit);
  const remainingPreview = Math.max(keywords.length - previewLimit, 0);

  // Handle loading session from context
  useEffect(() => {
    if (loadedSession) {
      setKeywords(loadedSession.keywords);
      setTaskName(loadedSession.name);
      setNiche(loadedSession.niche);
      setIsCustomNiche(true); // Force custom niche if loading from history to ensure it displays what's saved

      // Clear the session from context after loading it into local state
      // so it doesn't try to reload if the component re-mounts
      clearKeywordSession();
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
    setGenStatus('Building list on server...');

    try {
      // 1. Generate Base Keywords using Server Action
      const res = await generateKeywordsAction(niche, country, state, city || null, selectAllCities);

      if (res.success && res.data) {
        let finalKeywords = res.data;

        // 2. Deep Search Expansion
        if (isDeepSearch && city) {
          setGenStatus('Fetching pincodes for Deep Search...');
          try {
            const pinRes = await fetch(`/api/pincodes?city=${city}`);
            const pinData = await pinRes.json();

            if (pinData.success && pinData.pincodes?.length > 0) {
              const pincodes = pinData.pincodes as string[];
              setGenStatus(`Expanding with ${pincodes.length} pincodes...`);

              // Generate Pincode-specific keywords (Niche + City + Pincode)
              const pincodeKeywords: string[] = [];
              const baseLocation = city ? `${city}` : state; // Use city if available, else state

              for (const pin of pincodes) {
                pincodeKeywords.push(`${niche} in ${baseLocation} ${pin}`);
              }

              // Combine original area-based keywords with new pincode keywords
              finalKeywords = [...finalKeywords, ...pincodeKeywords];
              toast.success(`Deep Search Added: ${pincodeKeywords.length} pincode variations`);

            } else {
              toast.warning("Deep Search: No pincodes found, using base keywords.");
            }
          } catch (err) {
            console.error("Deep Search Error:", err);
            toast.error("Deep Search failed to fetch pincodes");
          }
        }

        setKeywords(finalKeywords);
        if (!isDeepSearch) toast.success(`Generated ${finalKeywords.length} keywords`);

        const location = selectAllCities ? `All cities in ${state}` : (city ? `${city}, ${state}` : state);
        const historyLimit = 10000; // Increased limit for Deep Search
        const isTruncated = finalKeywords.length > historyLimit;
        const historyKeywords = isTruncated ? finalKeywords.slice(0, historyLimit) : finalKeywords;

        await saveKeywordHistoryAction(
          taskName || `${niche} Generation`,
          niche,
          location,
          historyKeywords,
          finalKeywords.length,
          isTruncated
        );
      } else {
        toast.error(`Generation failed: ${res.error}`);
      }
    } catch (e) {
      toast.error("An error occurred during generation");
    } finally {
      setIsGenerating(false);
      setGenStatus('');
    }
  };

  const copyAll = () => {
    navigator.clipboard.writeText(keywords.join('\n'));
    setIsCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      {/* Full-screen loading overlay */}
      {isCreatingTask && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-lg font-semibold">Creating Automation Task...</p>
              <p className="text-sm text-muted-foreground mt-1">Please wait while we set up your campaign</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <Card className="border-border/60">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Keyword Builder</CardTitle>
                <CardDescription>Define your niche and location, then generate a list instantly.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/10 p-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">Business niche</label>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Checkbox
                    id="customNiche"
                    checked={isCustomNiche}
                    onCheckedChange={(checked) => {
                      setIsCustomNiche(!!checked);
                      if (!checked) setNiche('');
                    }}
                  />
                  Custom input
                </label>
              </div>
              {!isCustomNiche ? (
                <Combobox
                  options={PRESET_NICHES.map(n => ({ value: n, label: n }))}
                  value={niche}
                  onChange={setNiche}
                  placeholder="Select a niche"
                  searchPlaceholder="Search niches..."
                  emptyText="No niche found."
                />
              ) : (
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g. Pet Store, Solar Company"
                    className="pl-11 h-12"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Country</label>
                <Combobox
                  options={countries.map(c => ({ value: c.name, label: c.name }))}
                  value={country}
                  onChange={(value) => { setCountry(value); setState(''); setCity(''); }}
                  placeholder="Select country"
                  searchPlaceholder="Search countries..."
                  emptyText="No country found."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">State</label>
                <Combobox
                  options={[{ value: '', label: 'Select State' }, ...states.map(s => ({ value: s.name, label: s.name }))]}
                  value={state}
                  onChange={(value) => { setState(value); setCity(''); }}
                  placeholder="Select state"
                  searchPlaceholder="Search states..."
                  emptyText="No state found."
                  disabled={!country}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">City coverage</label>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Checkbox
                    id="selectAllCities"
                    checked={selectAllCities}
                    onCheckedChange={(checked) => setSelectAllCities(!!checked)}
                    disabled={!state}
                  />
                  Target all cities in state
                </label>
              </div>
              <Combobox
                options={[{ value: '', label: 'Select City' }, ...cities.map(c => ({ value: c.name, label: c.name }))]}
                value={city}
                onChange={setCity}
                placeholder="Select city"
                searchPlaceholder="Search cities..."
                emptyText="No city found."
                disabled={!state || selectAllCities}
              />
            </div>

            {/* Deep Search Toggle - Compact */}
            <div className="flex items-center space-x-2 px-1">
              <Switch
                id="deepSearch"
                className=''
                thumbClassName='border'
                checked={isDeepSearch}
                onCheckedChange={(checked) => setIsDeepSearch(!!checked)}
                disabled={!city || selectAllCities}
              />
              <label
                htmlFor="deepSearch"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                Deep Search <span className="text-xs text-muted-foreground">(Search every Pincode)</span>
              </label>
            </div>

            <Button
              onClick={generateKeywords}
              disabled={!niche || !state || isGenerating}
              size="lg"
              className="gap-2"
            >
              {isGenerating ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Sparkle className="h-5 w-5" />}
              {isGenerating ? (genStatus ? `Generating · ${genStatus}` : "Generating...") : "Generate keywords"}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-9rem)] flex flex-col gap-4">
          <Card className="flex flex-1 flex-col border-border/60 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/60">
              <div>
                <CardTitle>Live preview</CardTitle>
                <CardDescription className="font-medium">
                  {keywords.length} keywords ready
                  {remainingPreview > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (showing first {previewLimit})
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-10 w-10" onClick={copyAll} disabled={keywords.length === 0}>
                  {isCopied ? <Check className="h-5 w-5 text-primary" /> : <Copy className="h-5 w-5" />}
                </Button>
                {loadedSession && (
                  <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => { setKeywords([]); setTaskName(''); clearKeywordSession(); }}>
                    <Trash className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full px-6 py-4">
                {keywords.length > 0 ? (
                  <div className="space-y-3">
                    {previewKeywords.map((kw, idx) => (
                      <div key={idx} className="group flex items-center justify-between px-3 py-2 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/50 transition-all">
                        <span className="text-sm text-foreground line-clamp-1 flex-1 mr-4">{kw}</span>
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
                    {remainingPreview > 0 && (
                      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                        {remainingPreview} more keywords hidden to keep the preview fast.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full mt-12 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                    <div className="p-6 rounded-3xl bg-muted/30 mb-6">
                      <Command className="h-12 w-12 opacity-20" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">Awaiting Input</p>
                    <p className="text-sm opacity-70 mt-2">Generate or load keywords to populate your target list.</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Launch automation</CardTitle>
              <CardDescription>Name the campaign and start extraction in the background.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Campaign name</label>
                <Input
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="e.g. Q1 New York Dentist Leads"
                  className="py-2"
                />
              </div>
              <Button
                className="font-semibold text-base gap-3 w-full"
                onClick={async () => {
                  if (!taskName.trim()) {
                    toast.error("Please enter a campaign name");
                    return;
                  }
                  setIsCreatingTask(true);
                  try {
                    await onStartTask(taskName, keywords);
                    // Explicitly reset creating state before redirecting to ensure clean transition
                    setIsCreatingTask(false);
                    router.push('/tasks');
                  } catch (error) {
                    toast.error("Failed to create task");
                    setIsCreatingTask(false);
                  }
                }}
                disabled={isCreatingTask || keywords.length === 0}
                size="lg"
              >
                {isCreatingTask ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Creating Task...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Launch automation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
