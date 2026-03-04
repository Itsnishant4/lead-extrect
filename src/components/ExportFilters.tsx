'use client';

import * as React from 'react';
import {
  Download, LoaderCircle, Mail, Phone, Globe, Share2, Star, MapPin,
  Filter, CheckCheck, Info,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export interface FilterSettings {
  hasEmail: boolean;
  hasPhone: boolean;
  hasWebsite: boolean;
  hasSocials: boolean;
  hasRating: boolean;
  hasAddress: boolean;
}

interface ExportFiltersProps {
  onExport: (filters: FilterSettings) => Promise<void> | void;
  isLoading?: boolean;
  disabled?: boolean;
  progress?: number;
}

const FILTER_CONFIG = [
  {
    key: 'hasEmail' as const,
    label: 'With Email',
    description: 'Has an email address (from Google or website)',
    icon: Mail,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-950/50',
    activeBorder: 'border-indigo-200 dark:border-indigo-800',
    activeBg: 'bg-indigo-50/50 dark:bg-indigo-950/30',
  },
  {
    key: 'hasPhone' as const,
    label: 'With Phone',
    description: 'Has a phone number listed',
    icon: Phone,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    activeBorder: 'border-emerald-200 dark:border-emerald-800',
    activeBg: 'bg-emerald-50/50 dark:bg-emerald-950/30',
  },
  {
    key: 'hasWebsite' as const,
    label: 'With Website',
    description: 'Has a business website URL',
    icon: Globe,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    activeBorder: 'border-blue-200 dark:border-blue-800',
    activeBg: 'bg-blue-50/50 dark:bg-blue-950/30',
  },
  {
    key: 'hasSocials' as const,
    label: 'With Social Profiles',
    description: 'Has at least one social link (FB, IG, LinkedIn, etc.)',
    icon: Share2,
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-950/50',
    activeBorder: 'border-violet-200 dark:border-violet-800',
    activeBg: 'bg-violet-50/50 dark:bg-violet-950/30',
  },
  {
    key: 'hasRating' as const,
    label: 'With Rating',
    description: 'Has a Google rating above 0',
    icon: Star,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    activeBorder: 'border-amber-200 dark:border-amber-800',
    activeBg: 'bg-amber-50/50 dark:bg-amber-950/30',
  },
  {
    key: 'hasAddress' as const,
    label: 'With Address',
    description: 'Has a physical street address',
    icon: MapPin,
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/50',
    activeBorder: 'border-rose-200 dark:border-rose-800',
    activeBg: 'bg-rose-50/50 dark:bg-rose-950/30',
  },
] as const;

const DEFAULT_FILTERS: FilterSettings = {
  hasEmail: false,
  hasPhone: false,
  hasWebsite: false,
  hasSocials: false,
  hasRating: false,
  hasAddress: false,
};

export function ExportFilters({ onExport, isLoading, disabled, progress }: ExportFiltersProps) {
  const [filters, setFilters] = React.useState<FilterSettings>({ ...DEFAULT_FILTERS });
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const toggleFilter = (key: keyof FilterSettings) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeFilters = FILTER_CONFIG.filter(f => filters[f.key]);
  const activeCount = activeFilters.length;

  const selectAll = () => {
    setFilters({ hasEmail: true, hasPhone: true, hasWebsite: true, hasSocials: true, hasRating: true, hasAddress: true });
  };

  const clearAll = () => {
    setFilters({ ...DEFAULT_FILTERS });
  };

  // Build human-readable summary
  const getSummary = () => {
    if (activeCount === 0) return null;
    if (activeCount === 6) return 'All filters active -- only leads matching every criteria will be exported.';
    const names = activeFilters.map(f => f.label.replace('With ', '').toLowerCase());
    if (names.length === 1) return `Only leads with ${names[0]} will be exported.`;
    const last = names.pop();
    return `Only leads with ${names.join(', ')} and ${last} will be exported.`;
  };

  const summary = getSummary();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 px-3 h-8 text-xs font-semibold transition-all relative"
          disabled={disabled || isLoading}
        >
          <Download size={14} />
          Export
          {activeCount > 0 && (
            <span className="ml-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-indigo-500 text-white text-[10px] font-bold px-1">
              {activeCount}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[520px] p-0 gap-0 overflow-hidden rounded-2xl"
        showCloseButton={!isDownloading}
      >
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/30">
          <DialogTitle className="text-xl font-bold flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center">
              <Filter size={18} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            Export Leads
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground leading-relaxed mt-1">
            Filter which leads to include in your CSV. Checked filters are combined — only leads matching <strong className="text-foreground">all</strong> selected criteria are exported.
          </DialogDescription>
        </DialogHeader>

        {/* Quick actions bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/10">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Filters{activeCount > 0 && ` (${activeCount})`}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              disabled={activeCount === 6}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Select all
            </button>
            <span className="text-border">|</span>
            <button
              onClick={clearAll}
              disabled={activeCount === 0}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Filter grid - 2 columns on desktop, 1 on mobile */}
        <div className="max-h-[50vh] overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {FILTER_CONFIG.map((filter) => {
              const Icon = filter.icon;
              const isChecked = filters[filter.key];
              return (
                <div
                  key={filter.key}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-150 cursor-pointer group
                    ${isChecked
                      ? `${filter.activeBorder} ${filter.activeBg} shadow-sm`
                      : 'border-border hover:border-slate-300 dark:hover:border-slate-600 hover:bg-accent/30'
                    }`}
                  onClick={() => toggleFilter(filter.key)}
                >
                  <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isChecked ? filter.bg : 'bg-muted'}`}>
                    <Icon size={16} className={isChecked ? filter.color : 'text-muted-foreground'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-tight ${isChecked ? 'text-foreground' : 'text-foreground/80'}`}>
                      {filter.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug truncate">
                      {filter.description}
                    </p>
                  </div>
                  <Checkbox
                    id={filter.key}
                    checked={isChecked}
                    onCheckedChange={() => toggleFilter(filter.key)}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0"
                  />
                </div>
              );
            })}
          </div>

          {/* Tip */}
          <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-muted/50 dark:bg-muted/30 px-3.5 py-3 border border-border">
            <Info size={14} className="text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Leave all unchecked to export <strong className="text-foreground/70">every</strong> lead. Checking multiple filters narrows the results (AND logic).
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex-col gap-3 p-6 pt-4 border-t border-border bg-muted/30 sm:flex-col">
          {/* Active filter summary */}
          {summary && (
            <div className="w-full flex items-center gap-2 px-1">
              <CheckCheck size={13} className="text-indigo-500 shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-snug">{summary}</p>
            </div>
          )}

          <Button
            className="w-full gap-2.5 h-12 text-sm font-bold rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 hover:from-indigo-700 hover:via-indigo-600 hover:to-blue-600 text-white shadow-md shadow-indigo-200/50 dark:shadow-indigo-900/30 transition-all"
            onClick={async () => {
              setIsDownloading(true);
              try {
                await Promise.resolve(onExport(filters));
              } finally {
                setIsDownloading(false);
                setOpen(false);
              }
            }}
            disabled={isDownloading}
          >
            <Download size={17} className={isDownloading ? 'animate-bounce' : ''} />
            {isDownloading
              ? 'Preparing...'
              : activeCount > 0
                ? `Download Filtered CSV (${activeCount} filter${activeCount > 1 ? 's' : ''})`
                : 'Download All Leads as CSV'
            }
          </Button>
        </DialogFooter>

        {/* Loading overlay inside dialog */}
        {isDownloading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl">
            <div className="flex flex-col items-center gap-4 px-10 py-8">
              <LoaderCircle className="h-10 w-10 animate-spin text-indigo-500" />
              <p className="text-sm font-semibold text-foreground">
                {progress !== undefined ? `Exporting... ${Math.round(progress)}%` : 'Preparing export...'}
              </p>
              {progress !== undefined && (
                <div className="w-52 space-y-1.5">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-center text-muted-foreground font-medium">{Math.round(progress)}% complete</p>
                </div>
              )}
              {progress === undefined && (
                <p className="text-xs text-muted-foreground">This may take a few seconds for large tasks.</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
