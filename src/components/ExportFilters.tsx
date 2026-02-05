'use client';

import * as React from 'react';
import { DownloadSimple, Envelope, Phone, Globe } from 'phosphor-react';
import { LoaderCircle } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
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
}

export function ExportFilters({ onExport, isLoading, disabled }: ExportFiltersProps) {
  const [filters, setFilters] = React.useState<FilterSettings>({
    hasEmail: false,
    hasPhone: false,
    hasWebsite: false,
    hasSocials: false,
    hasRating: false,
    hasAddress: false,
  });
  const [isDownloading, setIsDownloading] = React.useState(false);

  const toggleFilter = (key: keyof FilterSettings) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-9 transition-all" disabled={disabled || isLoading}>
          <DownloadSimple className="h-4 w-4 text-primary" />
          {/* <span className="font-medium text-blue-700 dark:text-blue-300">Download</span> */}
         
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-[420px] p-0 flex flex-col gap-0 border-l border-border">
        <SheetHeader className="p-6 border-b border-border bg-muted/30">
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            <DownloadSimple className="h-5 w-5 text-primary" />
            Export Settings
          </SheetTitle>
          <SheetDescription className="text-sm">
            Quickly filter your leads to download only the data you need for your outreach campaign.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
             <FilterItem 
                id="hasEmail" 
                label="Has Email" 
                description="Leads with contact emails" 
                icon={<Envelope className="h-4 w-4 text-primary" />} 
                checked={filters.hasEmail}
                onCheckedChange={() => toggleFilter('hasEmail')}
             />

             <FilterItem 
                id="hasPhone" 
                label="Has Phone" 
                description="Leads with phone numbers" 
                icon={<Phone className="h-4 w-4 text-primary" />} 
                checked={filters.hasPhone}
                onCheckedChange={() => toggleFilter('hasPhone')}
             />

             <FilterItem 
                id="hasWebsite" 
                label="Has Website" 
                description="Leads with business websites" 
                icon={<Globe className="h-4 w-4 text-primary" />} 
                checked={filters.hasWebsite}
                onCheckedChange={() => toggleFilter('hasWebsite')}
             />

             <FilterItem 
                id="hasSocials" 
                label="Has Socials" 
                description="Leads with FB, IG, LinkedIn, etc." 
                icon={<Globe className="h-4 w-4 text-primary" />} 
                checked={filters.hasSocials}
                onCheckedChange={() => toggleFilter('hasSocials')}
             />

             <FilterItem 
                id="hasRating" 
                label="Has Rating" 
                description="Leads with customer reviews" 
                icon={<DownloadSimple className="h-4 w-4 text-primary" />} 
                checked={filters.hasRating}
                onCheckedChange={() => toggleFilter('hasRating')}
             />

             <FilterItem 
                id="hasAddress" 
                label="Has Address" 
                description="Leads with physical address" 
                icon={<Globe className="h-4 w-4 text-primary" />} 
                checked={filters.hasAddress}
                onCheckedChange={() => toggleFilter('hasAddress')}
             />

          </div>
        </div>

        <SheetFooter className="p-6 border-t border-border bg-muted/30">
          <Button 
            className="w-full gap-2 h-12 text-base font-semibold" 
            onClick={async () => {
              setIsDownloading(true);
              await Promise.resolve(onExport(filters));
              setIsDownloading(false);
            }}
            disabled={isDownloading}
          >
            <DownloadSimple className={`h-5 w-5 ${isDownloading ? 'animate-pulse' : ''}`} />
            {isDownloading ? "Preparing..." : "Download CSV"}
          </Button>
        </SheetFooter>
        {isDownloading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">Preparing export...</p>
              <p className="text-xs text-muted-foreground">This may take a few seconds for large tasks.</p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function FilterItem({ id, label, description, icon, checked, onCheckedChange }: { 
  id: string, 
  label: string, 
  description: string, 
  icon: React.ReactNode, 
  checked: boolean, 
  onCheckedChange: () => void 
}) {
  return (
    <div 
      className={`flex items-center justify-between space-x-2 rounded-xl border p-4 transition-all cursor-pointer hover:bg-accent/40 ${checked ? 'border-primary/30 bg-primary/5' : 'border-border'}`}
      onClick={onCheckedChange}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-lg ${checked ? 'bg-card shadow-sm' : 'bg-muted'}`}>
          {icon}
        </div>
        <div className="grid gap-0.5">
          <span className="text-sm font-semibold leading-none">{label}</span>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <Checkbox 
        id={id} 
        checked={checked} 
        onCheckedChange={onCheckedChange}
        onClick={(e) => e.stopPropagation()} 
      />
    </div>
  );
}
