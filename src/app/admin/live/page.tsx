"use client";

import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserLocationsAction } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSidebar } from "@/components/ui/sidebar";
import { MapPin, Globe as GlobeIcon, Eye, ArrowUpRight } from "phosphor-react";
import { Plus, Minus } from "lucide-react";
import { Globe } from "@/components/magicui/globe";

interface UserLocation {
  id: number;
  name: string;
  email: string;
  country: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  lastActive: Date | null;
}

export default function LiveViewPage() {
  const { open } = useSidebar();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const { data: userLocations } = useQuery({
    queryKey: ['admin-user-locations'],
    queryFn: async () => {
      const res = await getUserLocationsAction();
      if (!res.success) throw new Error((res as any).error);
      return (res as any).data;
    },
    refetchInterval: 10000,
  });

  const activeUsers = (userLocations?.activeUsers || []) as UserLocation[];
  const locations = (userLocations?.locations || []) as UserLocation[];
  const activeCount = userLocations?.activeCount || 0;

  const pointsData = useMemo(() => {
    return locations
      .filter(loc => loc.latitude !== null && loc.longitude !== null)
      .map(loc => ({
        location: [loc.latitude!, loc.longitude!] as [number, number],
        size: activeUsers.some(u => u.id === loc.id) ? 0.08 : 0.04,
      }));
  }, [locations, activeUsers]);

  const topLocations = useMemo(() => {
    const locMap = new Map<string, number>();
    locations.forEach(loc => {
      const label = `${loc.country || 'Unknown'} · ${loc.city || 'Unknown'}`;
      locMap.set(label, (locMap.get(label) || 0) + 1);
    });
    return Array.from(locMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [locations]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className={`transition-all ease-in-out duration-300 ${open ? 'md:ml-[250px]' : 'md:ml-[60px]'} flex h-16 shrink-0 items-center justify-between gap-2 px-6 sticky top-0 bg-white z-10`}>
        <div className="flex items-center gap-2">
          <GlobeIcon className="w-5 h-5 text-[#1a1a1a]" />
          <h1 className="text-xl font-semibold text-[#1a1a1a]">Live View</h1>
          <div className="flex items-center gap-1.5 ml-3">
            <div className="w-2 h-2 bg-[#0080ff] rounded-full animate-pulse" />
            <span className="text-sm text-[#6d6d6d] font-medium">Just now</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search location" 
              className="bg-[#f5f5f5] border border-[#e3e3e3] rounded-lg py-2 pl-10 pr-4 text-sm w-72 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0080ff] transition-all"
            />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a8a]" />
          </div>
          <div className="flex gap-1">
            <button className="p-2 bg-white border border-[#e3e3e3] rounded-lg shadow-sm hover:bg-gray-50 transition-colors"><Eye className="w-4 h-4 text-[#1a1a1a]" /></button>
            <button className="p-2 bg-white border border-[#e3e3e3] rounded-lg shadow-sm hover:bg-gray-50 transition-colors"><GlobeIcon className="w-4 h-4 text-[#1a1a1a]" /></button>
            <button className="p-2 bg-white border border-[#e3e3e3] rounded-lg shadow-sm hover:bg-gray-50 transition-colors"><ArrowUpRight className="w-4 h-4 text-[#1a1a1a]" /></button>
          </div>
        </div>
      </header>

      <main className={`flex-1 transition-all ease-in-out duration-300 ${open ? 'md:ml-[250px]' : 'md:ml-[30px]'} overflow-hidden bg-white`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-64px)] px-6 pb-6 gap-6 bg-white">
          {/* Left Panel: Metrics */}
          <div className="lg:col-span-4 overflow-y-auto space-y-4 pr-2 custom-scrollbar bg-white">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white border-[#f1f1f1] shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-xl">
                <CardContent className="p-5">
                  <div className="text-xs font-semibold text-[#1a1a1a] mb-3 uppercase tracking-wider">Visitors right now</div>
                  <div className="text-3xl font-bold text-[#1a1a1a]">{activeCount}</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-[#f1f1f1] shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-xl">
                <CardContent className="p-5">
                  <div className="text-xs font-semibold text-[#1a1a1a] mb-3 uppercase tracking-wider">Total leads</div>
                  <div className="text-3xl font-bold text-[#1a1a1a]">0 <span className="text-[#6d6d6d] font-normal">—</span></div>
                </CardContent>
              </Card>
              <Card className="bg-white border-[#f1f1f1] shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-xl">
                <CardContent className="p-5">
                  <div className="text-xs font-semibold text-[#1a1a1a] mb-3 uppercase tracking-wider">Sessions</div>
                  <div className="flex items-end justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-3xl font-bold text-[#1a1a1a]">{locations.length}</span>
                      <span className="text-[10px] text-green-600 font-bold flex items-center mb-1">
                        <ArrowUpRight weight="bold" className="w-2.5 h-2.5 mr-0.5" /> 150%
                      </span>
                    </div>
                    <div className="flex gap-0.5 items-end h-6 pb-1">
                      {[4, 7, 3, 5, 8, 4, 6].map((h, i) => (
                        <div key={i} className="w-1 bg-[#0080ff]/20 rounded-full" style={{ height: `${h * 15}%` }} />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white border-[#f1f1f1] shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-xl">
                <CardContent className="p-5">
                  <div className="text-xs font-semibold text-[#1a1a1a] mb-3 uppercase tracking-wider">Orders</div>
                  <div className="text-3xl font-bold text-[#1a1a1a]">0 <span className="text-[#6d6d6d] font-normal">—</span></div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-[#f1f1f1] shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-xl overflow-hidden">
              <CardHeader className="pb-4 border-b border-[#f1f1f1]">
                <CardTitle className="text-sm font-semibold text-[#1a1a1a]">Customer behavior</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-[#6d6d6d] mb-2 font-medium">Active carts</div>
                    <div className="text-2xl font-bold text-[#1a1a1a]">0</div>
                  </div>
                  <div className="border-x border-[#f1f1f1] px-4">
                    <div className="text-xs text-[#6d6d6d] mb-2 font-medium">Checking out</div>
                    <div className="text-2xl font-bold text-[#1a1a1a]">0</div>
                  </div>
                  <div className="pl-2">
                    <div className="text-xs text-[#6d6d6d] mb-2 font-medium">Purchased</div>
                    <div className="text-2xl font-bold text-[#1a1a1a]">0</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#f1f1f1] shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-xl overflow-hidden">
              <CardHeader className="pb-4 border-b border-[#f1f1f1]">
                <CardTitle className="text-sm font-semibold text-[#1a1a1a]">Sessions by location</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {topLocations.length === 0 ? (
                    <div className="text-xs text-[#6d6d6d] text-center py-4">No location data available</div>
                ) : (
                    topLocations.map(([loc, count], idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-[11px] font-medium text-[#1a1a1a]">
                          <span>{loc}</span>
                          <span className="font-bold">{count}</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#f1f1f1] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#0080ff] transition-all duration-1000" 
                            style={{ width: `${(count / (locations.length || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border-[#f1f1f1] shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-xl overflow-hidden">
              <CardHeader className="pb-4 border-b border-[#f1f1f1]">
                <CardTitle className="text-sm font-semibold text-[#1a1a1a]">New vs returning customers</CardTitle>
              </CardHeader>
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                <div className="text-xs font-medium text-[#6d6d6d]">No data for this date range</div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Globe */}
          <div className="lg:col-span-8 relative flex items-center justify-center bg-white">
            {isClient && (
              <div className="w-full h-full flex items-center justify-center relative">
                <div className="w-full max-w-[850px] aspect-square flex items-center justify-center">
                   <Globe
                     points={pointsData}
                     className="w-full h-full"
                   />
                </div>
                
                {/* Globe legend bottom right */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-[#eee]">
                   <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-[#c8b6ff] rounded-full" />
                    <span className="text-[#1a1a1a] text-[10px] font-bold uppercase tracking-wider">Orders</span>
                  </div>
                  <div className="flex items-center gap-2 border-l border-[#eee] pl-6">
                    <div className="w-2.5 h-2.5 bg-[#00b0ff] rounded-full" />
                    <span className="text-[#1a1a1a] text-[10px] font-bold uppercase tracking-wider">Visitors right now</span>
                  </div>
                </div>

                <div className="absolute bottom-10 right-0 flex flex-col gap-2">
                   <div className="flex flex-col bg-white rounded-lg shadow-md border border-[#e3e3e3] overflow-hidden">
                      <button className="p-2.5 hover:bg-gray-50 border-b border-[#f1f1f1] transition-colors"><Plus className="w-4 h-4 text-[#1a1a1a]" /></button>
                      <button className="p-2.5 hover:bg-gray-50 transition-colors"><Minus className="w-4 h-4 text-[#1a1a1a]" /></button>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}
