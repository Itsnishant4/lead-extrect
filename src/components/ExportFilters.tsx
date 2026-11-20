'use client';

import * as React from 'react';
import {
  Download, LoaderCircle, Mail, Phone, Globe, Share2, Star, MapPin,
  Filter, CheckCheck, Info, ShieldCheck, Lock, FileText, FileJson, FileSpreadsheet, File,
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
import type { ExportFormat } from '@/lib/export-utils';

export interface FilterSettings {
  hasEmail: boolean;
  hasPhone: boolean;
  hasWebsite: boolean;
  hasSocials: boolean;
  hasRating: boolean;
  hasAddress: boolean;
  hasVerifiedEmail: boolean;
}

interface ExportFiltersProps {
  onExport: (filters: FilterSettings, format: ExportFormat) => Promise<void> | void;
  isLoading?: boolean;
  disabled?: boolean;
  progress?: number;
  allowedFormats?: ExportFormat[];
  allowedFilters?: (keyof FilterSettings)[];
  hasLeadScoring?: boolean;
  hasEmailVerification?: boolean;
}

const FILTER_CONFIG = [
  {
    key: 'hasEmail' as const,
    label: 'Must have Email',
    description: 'In leads must have email',
    icon: Mail,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-950/50',
    activeBorder: 'border-indigo-200 dark:border-indigo-800',
    activeBg: 'bg-indigo-50/50 dark:bg-indigo-950/30',
  },
  {
    key: 'hasPhone' as const,
    label: 'Must have Number',
    description: 'In leads must have phone number',
    icon: Phone,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    activeBorder: 'border-emerald-200 dark:border-emerald-800',
    activeBg: 'bg-emerald-50/50 dark:bg-emerald-950/30',
  },
  {
    key: 'hasWebsite' as const,
    label: 'Must have Website',
    description: 'In leads must have website URL',
    icon: Globe,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    activeBorder: 'border-blue-200 dark:border-blue-800',
    activeBg: 'bg-blue-50/50 dark:bg-blue-950/30',
  },
  {
    key: 'hasSocials' as const,
    label: 'Must have Socials',
    description: 'In leads must have social media links',
    icon: Share2,
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-950/50',
    activeBorder: 'border-violet-200 dark:border-violet-800',
    activeBg: 'bg-violet-50/50 dark:bg-violet-950/30',
  },
  {
    key: 'hasRating' as const,
    label: 'Must have Rating',
    description: 'In leads must have Google rating',
    icon: Star,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    activeBorder: 'border-amber-200 dark:border-amber-800',
    activeBg: 'bg-amber-50/50 dark:bg-amber-950/30',
  },
  {
    key: 'hasAddress' as const,
    label: 'Must have Address',
    description: 'In leads must have street address',
    icon: MapPin,
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/50',
    activeBorder: 'border-rose-200 dark:border-rose-800',
    activeBg: 'bg-rose-50/50 dark:bg-rose-950/30',
  },
] as const;

const VERIFIED_EMAIL_FILTER = {
  key: 'hasVerifiedEmail' as const,
  label: 'Must have Verified Email',
  description: 'In leads must have verified email address',
  icon: ShieldCheck,
  color: 'text-teal-500',
  bg: 'bg-teal-50 dark:bg-teal-950/50',
  activeBorder: 'border-teal-200 dark:border-teal-800',
  activeBg: 'bg-teal-50/50 dark:bg-teal-950/30',
};

const FORMAT_OPTIONS: { key: ExportFormat; label: string; icon: any; description: string }[] = [
  { key: 'csv', label: 'CSV', icon: FileText, description: 'Comma-separated values' },
  { key: 'json', label: 'JSON', icon: FileJson, description: 'Structured data format' },
  { key: 'xlsx', label: 'Excel', icon: FileSpreadsheet, description: 'Microsoft Excel spreadsheet' },
  { key: 'pdf', label: 'PDF', icon: File, description: 'Formatted document' },
];

const DEFAULT_FILTERS: FilterSettings = {
  hasEmail: false,
  hasPhone: false,
  hasWebsite: false,
  hasSocials: false,
  hasRating: false,
  hasAddress: false,
  hasVerifiedEmail: false,
};

export function ExportFilters({ onExport, isLoading, disabled, progress, allowedFormats = ['csv'], allowedFilters, hasLeadScoring, hasEmailVerification }: ExportFiltersProps) {
  const [filters, setFilters] = React.useState<FilterSettings>({ ...DEFAULT_FILTERS });
  const [format, setFormat] = React.useState<ExportFormat>('csv');
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const allFilterKeys = [...FILTER_CONFIG.map(f => f.key), 'hasVerifiedEmail'] as (keyof FilterSettings)[];
  const isFilterAllowed = (key: keyof FilterSettings) => !allowedFilters || allowedFilters.includes(key);

  const toggleFilter = (key: keyof FilterSettings) => {
    if (!isFilterAllowed(key)) return;
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const activeFilters = allFilterKeys.filter(k => filters[k]);
  const activeCount = activeFilters.length;

  const clearAll = () => {
    setFilters({ ...DEFAULT_FILTERS });
  };

  const getSummary = () => {
    if (activeCount === 0) return null;
    const totalFilters = 7;
    if (activeCount === totalFilters) return 'All fields required -- leads must have every field to be exported.';
    const names: string[] = [];
    FILTER_CONFIG.forEach(f => { if (filters[f.key]) names.push(f.label.replace(' Required', '').toLowerCase()); });
    if (filters.hasVerifiedEmail) names.push('verified email');
    if (names.length === 1) return `Leads must have ${names[0]} to be included in the export.`;
    const last = names.pop();
    return `Leads must have ${names.join(', ')} and ${last} to be included in the export.`;
  };

  const summary = getSummary();
  const lockedFormats = FORMAT_OPTIONS.filter(f => !allowedFormats.includes(f.key));

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
              <Download size={18} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            Export Leads
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground leading-relaxed mt-1">
            Choose filters, export format, and required fields.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          {/* Format Selector */}
          <div className="px-6 py-4 border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
              Export Format
            </span>
            <div className="grid grid-cols-4 gap-2">
              {FORMAT_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isAllowed = allowedFormats.includes(opt.key);
                const isSelected = format === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => isAllowed && setFormat(opt.key)}
                    disabled={!isAllowed}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all
                      ${isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 shadow-sm'
                        : isAllowed
                          ? 'border-border hover:border-slate-300 dark:hover:border-slate-600'
                          : 'border-border opacity-50 cursor-not-allowed'
                      }`}
                  >
                    {!isAllowed && (
                      <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                        Pro
                      </span>
                    )}
                    <Icon size={20} className={isSelected ? 'text-indigo-600' : 'text-muted-foreground'} />
                    <span className={`text-xs font-bold ${isSelected ? 'text-indigo-600' : 'text-muted-foreground'}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {lockedFormats.length > 0 && (
              <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                <Lock size={10} />
                {lockedFormats.map(f => f.label).join(', ')} available on higher plans
              </p>
            )}
          </div>

          {/* Filters */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Required Fields{activeCount > 0 && ` (${activeCount})`}
              </span>
              <button
                onClick={clearAll}
                disabled={activeCount === 0}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Verified Email Filter — shown first */}
              {(() => {
                const isLocked = !isFilterAllowed('hasVerifiedEmail');
                return (
                  <div
                    className={`relative flex items-center gap-3 rounded-xl border p-3 transition-all duration-150 group sm:col-span-2
                      ${isLocked
                        ? 'border-border opacity-60 cursor-not-allowed'
                        : filters.hasVerifiedEmail
                          ? `${VERIFIED_EMAIL_FILTER.activeBorder} ${VERIFIED_EMAIL_FILTER.activeBg} shadow-sm cursor-pointer`
                          : 'border-border hover:border-slate-300 dark:hover:border-slate-600 hover:bg-accent/30 cursor-pointer'
                      }`}
                    onClick={() => !isLocked && toggleFilter('hasVerifiedEmail')}
                  >
                    {isLocked && (
                      <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                        Pro
                      </span>
                    )}
                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${filters.hasVerifiedEmail && !isLocked ? VERIFIED_EMAIL_FILTER.bg : 'bg-muted'}`}>
                      <ShieldCheck size={16} className={filters.hasVerifiedEmail && !isLocked ? VERIFIED_EMAIL_FILTER.color : 'text-muted-foreground'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold leading-tight ${filters.hasVerifiedEmail && !isLocked ? 'text-foreground' : 'text-foreground/80'}`}>
                        {VERIFIED_EMAIL_FILTER.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug truncate">
                        {VERIFIED_EMAIL_FILTER.description}
                      </p>
                    </div>
                    <Checkbox
                      checked={filters.hasVerifiedEmail && !isLocked}
                      onCheckedChange={() => !isLocked && toggleFilter('hasVerifiedEmail')}
                      onClick={(e) => e.stopPropagation()}
                      disabled={isLocked}
                      className="shrink-0"
                    />
                  </div>
                );
              })()}

              {FILTER_CONFIG.map((filter) => {
                const Icon = filter.icon;
                const isChecked = filters[filter.key];
                const isLocked = !isFilterAllowed(filter.key);
                return (
                  <div
                    key={filter.key}
                    className={`relative flex items-center gap-3 rounded-xl border p-3 transition-all duration-150 group
                      ${isLocked
                        ? 'border-border opacity-60 cursor-not-allowed'
                        : isChecked
                          ? `${filter.activeBorder} ${filter.activeBg} shadow-sm cursor-pointer`
                          : 'border-border hover:border-slate-300 dark:hover:border-slate-600 hover:bg-accent/30 cursor-pointer'
                      }`}
                    onClick={() => !isLocked && toggleFilter(filter.key)}
                  >
                    {isLocked && (
                      <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                        Pro
                      </span>
                    )}
                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isChecked && !isLocked ? filter.bg : 'bg-muted'}`}>
                      <Icon size={16} className={isChecked && !isLocked ? filter.color : 'text-muted-foreground'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold leading-tight ${isChecked && !isLocked ? 'text-foreground' : 'text-foreground/80'}`}>
                        {filter.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug truncate">
                        {filter.description}
                      </p>
                    </div>
                    <Checkbox
                      id={filter.key}
                      checked={isChecked && !isLocked}
                      onCheckedChange={() => !isLocked && toggleFilter(filter.key)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={isLocked}
                      className="shrink-0"
                    />
                  </div>
                );
              })}

            </div>

            {/* Tip */}
            <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 px-3.5 py-3 border border-amber-200/60 dark:border-amber-800/40">
              <Info size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground/80">No fields checked?</strong> All leads will be exported as-is, even those with missing data. Check a field to make it compulsory.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex-col gap-3 p-6 pt-4 border-t border-border bg-muted/30 sm:flex-col">
          {summary && (
            <div className="w-full flex items-center gap-2 px-1 py-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30">
              <ShieldCheck size={14} className="text-indigo-500 shrink-0 ml-2" />
              <p className="text-[12px] text-indigo-700 dark:text-indigo-300 leading-snug font-medium">{summary}</p>
            </div>
          )}

          <Button
            className="w-full gap-2.5 h-12 text-sm font-bold rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 hover:from-indigo-700 hover:via-indigo-600 hover:to-blue-600 text-white shadow-md shadow-indigo-200/50 dark:shadow-indigo-900/30 transition-all"
            onClick={async () => {
              setIsDownloading(true);
              try {
                await Promise.resolve(onExport(filters, format));
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
              : `Export as ${format.toUpperCase()}${activeCount > 0 ? ` (${activeCount} filter${activeCount > 1 ? 's' : ''})` : ''}`
            }
          </Button>
        </DialogFooter>

        {/* Loading overlay */}
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
