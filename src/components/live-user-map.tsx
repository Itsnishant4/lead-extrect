"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserLocationsAction } from "@/app/actions";
import { WorldMap } from "@/components/world-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, Clock, MapPin } from "phosphor-react";
import { Zap } from "lucide-react";

export function LiveUserMap() {
  const { data: userLocations, isLoading } = useQuery({
    queryKey: ['admin-user-locations'],
    queryFn: async () => {
      const res = await getUserLocationsAction();
      if (!res.success) throw new Error((res as any).error);
      return (res as any).data;
    },
    refetchInterval: 15000,
  });

  const activeUsers = userLocations?.activeUsers || [];
  const locations = userLocations?.locations || [];
  const activeCount = userLocations?.activeCount || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-lg font-bold">{activeCount}</span>
            <span className="text-muted-foreground text-sm">users online</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Live</span>
        </div>
      </div>

      <WorldMap 
        locations={locations} 
        activeCount={activeCount}
      />

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Users weight="fill" className="w-4 h-4" />
              <span className="text-xs font-medium">Total Users</span>
            </div>
            <div className="text-xl font-bold">{userLocations?.totalWithLocation || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Activity weight="fill" className="w-4 h-4" />
              <span className="text-xs font-medium">Active Now</span>
            </div>
            <div className="text-xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
      </div>

      {activeUsers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Currently Active
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {activeUsers.slice(0, 10).map((user: any) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <div>
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {user.city || user.country || 'Unknown'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span className="text-xs text-muted-foreground">
                    {user.lastActive ? 'Just now' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {userLocations?.countryBreakdown && userLocations.countryBreakdown.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Top Countries
          </h4>
          <div className="flex flex-wrap gap-1">
            {userLocations.countryBreakdown.slice(0, 6).map((country: any, idx: number) => (
              <Badge key={country.country} variant="secondary" className="text-xs">
                {country.country} ({country.count})
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
