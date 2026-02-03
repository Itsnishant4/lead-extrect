'use client';

import * as React from 'react';
import { Download, Mail, Phone, Globe, Share2, Star, MapPin, X } from 'lucide-react';
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
  onExport: (filters: FilterSettings) => void;
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

  const toggleFilter = (key: keyof FilterSettings) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-9   transition-all " disabled={disabled || isLoading}>
          <Download className="h-4 w-4 text-blue-600" />
          {/* <span className="font-medium text-blue-700 dark:text-blue-300">Download</span> */}
         
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-[420px] p-0 flex flex-col gap-0 border-l dark:border-slate-800">
        <SheetHeader className="p-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
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
                icon={<Mail className="h-4 w-4 text-blue-500" />} 
                checked={filters.hasEmail}
                onCheckedChange={() => toggleFilter('hasEmail')}
             />

             <FilterItem 
                id="hasPhone" 
                label="Has Phone" 
                description="Leads with phone numbers" 
                icon={<Phone className="h-4 w-4 text-green-500" />} 
                checked={filters.hasPhone}
                onCheckedChange={() => toggleFilter('hasPhone')}
             />

             <FilterItem 
                id="hasWebsite" 
                label="Has Website" 
                description="Leads with business websites" 
                icon={<Globe className="h-4 w-4 text-purple-500" />} 
                checked={filters.hasWebsite}
                onCheckedChange={() => toggleFilter('hasWebsite')}
             />

             <FilterItem 
                id="hasSocials" 
                label="Has Socials" 
                description="Leads with social media links" 
                icon={<Share2 className="h-4 w-4 text-orange-500" />} 
                checked={filters.hasSocials}
                onCheckedChange={() => toggleFilter('hasSocials')}
             />

             <FilterItem 
                id="hasRating" 
                label="Has Rating" 
                description="Leads with Google reviews" 
                icon={<Star className="h-4 w-4 text-yellow-500" />} 
                checked={filters.hasRating}
                onCheckedChange={() => toggleFilter('hasRating')}
             />

             <FilterItem 
                id="hasAddress" 
                label="Has Address" 
                description="Leads with physical locations" 
                icon={<MapPin className="h-4 w-4 text-red-500" />} 
                checked={filters.hasAddress}
                onCheckedChange={() => toggleFilter('hasAddress')}
             />
          </div>
        </div>

        <SheetFooter className="p-6 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <SheetClose asChild>
            <Button className="w-full gap-2 h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 dark:shadow-none" onClick={() => onExport(filters)}>
              <Download className="h-5 w-5" />
              Download CSV
            </Button>
          </SheetClose>
        </SheetFooter>
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
      className={`flex items-center justify-between space-x-2 rounded-xl border p-4 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${checked ? 'border-blue-200 bg-blue-50/30 dark:border-blue-900/30 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-800'}`}
      onClick={onCheckedChange}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-lg ${checked ? 'bg-white dark:bg-slate-900 shadow-sm' : 'bg-slate-100 dark:bg-slate-800'}`}>
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
