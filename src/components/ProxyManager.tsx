'use client';

import { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  Trash, 
  HardDrives, 
  ShieldCheck, 
  ShieldWarning
} from 'phosphor-react';
import { LoaderCircle } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  getProxiesAction, 
  addProxyAction, 
  deleteProxyAction, 
  toggleProxyAction 
} from '@/app/actions';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProxyManager() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newProxy, setNewProxy] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    protocol: 'http',
  });

  const { data: proxies = [], isLoading } = useQuery({
    queryKey: ['proxies'],
    queryFn: async () => {
      const res = await getProxiesAction();
      if (!res.success) throw new Error(res.error);
      return res.data || [];
    }
  });

  const addMutation = useMutation({
    mutationFn: async (proxyData: any) => {
      const res = await addProxyAction(proxyData);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      toast.success("Proxy added successfully");
      setNewProxy({
        host: '',
        port: '',
        username: '',
        password: '',
        protocol: 'http',
      });
      queryClient.invalidateQueries({ queryKey: ['proxies'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add proxy");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await deleteProxyAction(id);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      toast.success("Proxy deleted");
      queryClient.invalidateQueries({ queryKey: ['proxies'] });
    },
    onError: () => {
      toast.error("Failed to delete proxy");
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: number, newStatus: boolean }) => {
      const res = await toggleProxyAction(id, newStatus);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proxies'] });
    },
    onError: () => {
      toast.error("Failed to toggle proxy");
    }
  });

  const handleAddProxy = async () => {
    if (!newProxy.host || !newProxy.port) {
      toast.error("Host and Port are required");
      return;
    }
    addMutation.mutate({
      ...newProxy,
      port: parseInt(newProxy.port),
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleToggle = (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? false : true;
    toggleMutation.mutate({ id, newStatus });
  };

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Proxy Management</CardTitle>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Add Proxy
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Proxy</DialogTitle>
                <DialogDescription>
                  Enter your proxy details below. Supports HTTP, HTTPS, and SOCKS.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm font-medium">Protocol</label>
                  <div className="col-span-3">
                    <Select 
                      value={newProxy.protocol} 
                      onValueChange={(val) => setNewProxy({...newProxy, protocol: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Protocol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="http">HTTP</SelectItem>
                        <SelectItem value="https">HTTPS</SelectItem>
                        <SelectItem value="socks4">SOCKS4</SelectItem>
                        <SelectItem value="socks5">SOCKS5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm font-medium">Host</label>
                  <Input 
                    className="col-span-3" 
                    placeholder="proxy.example.com" 
                    value={newProxy.host}
                    onChange={(e) => setNewProxy({...newProxy, host: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm font-medium">Port</label>
                  <Input 
                    className="col-span-3" 
                    placeholder="8080" 
                    type="number"
                    value={newProxy.port}
                    onChange={(e) => setNewProxy({...newProxy, port: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm font-medium">User</label>
                  <Input 
                    className="col-span-3" 
                    placeholder="Optional" 
                    value={newProxy.username}
                    onChange={(e) => setNewProxy({...newProxy, username: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm font-medium">Pass</label>
                  <Input 
                    className="col-span-3" 
                    type="password" 
                    placeholder="Optional"
                    value={newProxy.password}
                    onChange={(e) => setNewProxy({...newProxy, password: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddProxy} disabled={addMutation.isPending}>
                  {addMutation.isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                  Save Proxy
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Rotate through multiple IP addresses to prevent Google Maps from blocking your extractions.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <LoadingSpinner message="Loading proxies..." size="sm" />
        ) : proxies.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-xl bg-muted/5">
            <HardDrives className="h-8 w-8 mx-auto text-muted-foreground opacity-20 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No proxies configured</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Add a proxy to enable IP rotation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {proxies.map((proxy) => (
              <div 
                key={proxy.id} 
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${proxy.is_active ? 'bg-primary/5 border-primary/20' : 'bg-muted/10 border-border/50'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${proxy.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <HardDrives className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{proxy.host}:{proxy.port}</span>
                      <Badge variant="outline" className="text-[10px]  h-5 px-1.5 font-bold">
                        {proxy.protocol}
                      </Badge>
                      {proxy.username && (
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Added {new Date(proxy.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch 
                    checked={proxy.is_active === 1} 
                    onCheckedChange={() => handleToggle(proxy.id, proxy.is_active)}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => handleDelete(proxy.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/10 border-t py-3 px-6">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldWarning className="h-3 w-3" />
          <span>Active proxies will be used in rotation for all extractions.</span>
        </div>
      </CardFooter>
    </Card>
  );
}
