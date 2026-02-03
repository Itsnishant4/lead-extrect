'use client';

import { useState, useEffect } from 'react';
import { 
  Trash2, 
  ShieldAlert, 
  Layout
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  wipeAllLeadsAction, 
  getSettingsAction,
  updateSettingAction
} from '@/app/actions';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAutomation } from '@/context/AutomationContext';
import ProxyManager from '@/components/ProxyManager';
import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SettingsPage() {
  const { settings: appSettings, updateSetting } = useAutomation();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // No need to load settings locally if using context
  }, []);

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
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 max-w-[76rem] w-full">
          <div className="space-y-8 animate-in fade-in duration-700">
            <Card className="border-none bg-transparent shadow-none">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-3xl font-bold tracking-tight">Settings</CardTitle>
                <CardDescription className="text-base ">
                  Manage your application preferences and configuration.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-6">
              {/* Export Settings */}
              <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Layout className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-xl">Export Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Configure how your lead data is formatted and downloaded.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold">City-wise Export</div>
                        <div className="text-xs text-muted-foreground">
                            When enabled, multiple CSV files will be generated (one per city).
                        </div>
                      </div>
                      <Switch 
                        checked={appSettings.exportCityWise} 
                        onCheckedChange={() => toggleSetting('exportCityWise')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Proxy Management */}
              <ProxyManager />

              {/* Danger Zone */}
              <Card className="border-red-200 dark:border-red-900/30 shadow-sm bg-red-50/10 dark:bg-red-900/5 overflow-hidden">
                <CardHeader >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-red-600" />
                    <CardTitle className="text-xl text-red-600">Danger Zone</CardTitle>
                  </div>
                  <CardDescription className="text-red-600/70">
                    Irreversible actions that will delete your data.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold">Factory Reset</div>
                      <div className="text-xs text-muted-foreground">Delete everything including leads, tasks, and settings.</div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={handleWipeLeads} disabled={isProcessing}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Wipe All Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
