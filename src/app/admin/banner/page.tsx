"use client"

import { useState, useEffect } from "react"
import { getBannerAction, updateBannerAdminAction } from "@/app/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Megaphone } from "phosphor-react"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { useSidebar } from "@/components/ui/sidebar"

export default function AdminBannerPage() {
  const queryClient = useQueryClient();
  const { open } = useSidebar();

  const { data: banner, isLoading } = useQuery({
    queryKey: ['admin-banner'],
    queryFn: async () => {
      const res = await getBannerAction();
      if (!res.success) throw new Error((res as any).error);
      return (res as any).data;
    }
  });

  const [enabled, setEnabled] = useState(false);
  const [text, setText] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [bgColor, setBgColor] = useState("#6366F1");

  useEffect(() => {
    if (banner) {
      setEnabled(banner.enabled);
      setText(banner.text);
      setButtonText(banner.buttonText);
      setButtonUrl(banner.buttonUrl);
      setBgColor(banner.bgColor);
    }
  }, [banner]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await updateBannerAdminAction({ enabled, text, buttonText, buttonUrl, bgColor });
      if (!res.success) throw new Error((res as any).error || "Failed to save");
      return res;
    },
    onSuccess: () => {
      toast.success("Banner settings saved");
      queryClient.invalidateQueries({ queryKey: ['admin-banner'] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const presetColors = [
    { name: "Indigo", value: "#6366F1" },
    { name: "Violet", value: "#8B5CF6" },
    { name: "Rose", value: "#F43F5E" },
    { name: "Emerald", value: "#10B981" },
    { name: "Amber", value: "#F59E0B" },
    { name: "Blue", value: "#3B82F6" },
    { name: "Black", value: "#18181B" },
  ];

  return (
    <>
      <header className={`flex transition-all ease-in-out duration-300 ${open ? 'md:ml-[250px]' : 'md:ml-[60px]'} h-16 shrink-0 items-center justify-between gap-2 px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b`}>
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Banner Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className={`flex-1 overflow-y-auto p-4 md:p-8 pt-6 transition-all ease-in-out duration-300 ${open ? 'md:ml-[250px]' : 'md:ml-[30px]'}`}>
        {isLoading ? (
          <div className="flex h-[80vh] items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="w-full max-w-2xl space-y-8 animate-in fade-in duration-700 pb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Banner Settings</h2>
              <p className="text-muted-foreground mt-1">
                Configure the announcement banner shown at the top of the landing page.
              </p>
            </div>

            {/* Preview */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {enabled && text ? (
                  <div
                    className="w-full py-2.5 px-4 text-center text-white text-sm font-medium rounded-lg flex items-center justify-center gap-3 flex-wrap"
                    style={{ backgroundColor: bgColor }}
                  >
                    <span>{text}</span>
                    {buttonText && (
                      <span className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full cursor-pointer transition-colors">
                        {buttonText}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-full py-6 text-center text-muted-foreground text-sm border border-dashed rounded-lg">
                    Banner is disabled or has no text
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  Banner Configuration
                </CardTitle>
                <CardDescription>Changes are applied to the landing page immediately after saving.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">Enable Banner</Label>
                    <p className="text-xs text-muted-foreground">Show the banner on the landing page</p>
                  </div>
                  <Switch checked={enabled} onCheckedChange={setEnabled} />
                </div>

                {/* Banner text */}
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Banner Text</Label>
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g. Limited offer: Get 50% off on Pro plan!"
                    className="bg-muted/5"
                  />
                </div>

                {/* Button text + URL */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Button Text (optional)</Label>
                    <Input
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="e.g. Claim Now"
                      className="bg-muted/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Button URL</Label>
                    <Input
                      value={buttonUrl}
                      onChange={(e) => setButtonUrl(e.target.value)}
                      placeholder="e.g. /subscription or https://..."
                      className="bg-muted/5"
                    />
                  </div>
                </div>

                {/* Background color */}
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Background Color</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      {presetColors.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all ${bgColor === c.value ? 'border-foreground scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: c.value }}
                          onClick={() => setBgColor(c.value)}
                          title={c.name}
                        />
                      ))}
                    </div>
                    <Input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-28 h-8 text-xs bg-muted/5 font-mono"
                      placeholder="#6366F1"
                    />
                  </div>
                </div>

                {/* Save */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    className="px-8 font-bold text-xs uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700"
                  >
                    {saveMutation.isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Save Banner Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </>
  )
}
