'use client';

import { useState } from 'react';
import { 
  Trash, 
  ShieldWarning, 
  SquaresFour
} from 'phosphor-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  wipeAllLeadsAction
} from '@/app/actions';
import { useAutomation } from '@/context/AutomationContext';
import ProxyManager from '@/components/ProxyManager';
import { AppSidebar } from "@/components/AppSidebar";
import { AppPage } from "@/components/AppPage";

export default function SettingsPage() {
  const { settings: appSettings, updateSetting } = useAutomation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleWipeLeads = async () => {
    if (!window.confirm('EXTREME DANGER: This will delete ALL leads, tasks, and searches permanently. This cannot be undone. Are you absolutely sure?')) return;
    setIsProcessing(true);
    const res = await wipeAllLeadsAction();
    if (res.success) {
      toast.success("All data wiped successfully");
    } else {
      toast.error("Failed to wipe data");
    }
    setIsProcessing(false);
  };

  const toggleSetting = async (key: string) => {
    const newValue = !appSettings[key];
    await updateSetting(key, newValue);
    toast.success(`Setting updated`);
  };

  return (
    <>
      <AppSidebar />
      <AppPage
        title="Settings"
        description="Configure exports, proxies, and data retention preferences."
        breadcrumb={[{ label: "Dashboard", href: "/" }, { label: "Settings" }]}
      >
        <div className="grid gap-6">
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <SquaresFour className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>Export settings</CardTitle>
                  <CardDescription>Control how lead files are grouped and downloaded.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-6 rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="space-y-1">
                  <div className="text-sm font-semibold">City-wise export</div>
                  <div className="text-xs text-muted-foreground">
                    When enabled, multiple CSV files will be generated (one per city).
                  </div>
                </div>
                <Switch 
                  checked={appSettings.exportCityWise} 
                  onCheckedChange={() => toggleSetting('exportCityWise')}
                />
              </div>
            </CardContent>
          </Card>


          <ProxyManager />

          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <ShieldWarning className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-destructive">Danger zone</CardTitle>
                  <CardDescription className="text-destructive/70">
                    Irreversible actions that remove all data.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col gap-4 rounded-xl border border-destructive/20 bg-background p-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-semibold">Factory reset</div>
                  <div className="text-xs text-muted-foreground">
                    Delete everything including leads, tasks, and settings.
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleWipeLeads} disabled={isProcessing}>
                  <Trash className="mr-2 h-4 w-4" />
                  Wipe All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppPage>
    </>
  );
}
