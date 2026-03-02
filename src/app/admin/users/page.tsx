"use client"

import { useState } from "react"
import {
  getAllUsersAdminAction,
  toggleUserAdminAction,
  updateUserCreditsAction,
  suspendUserAction,
  getUserHistoryAdminAction,
  recalculateUserUsageAction
} from "@/app/actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, ShieldSlash, Calendar, Coins, Plus, Minus, ClockCounterClockwise, ArrowsClockwise } from "phosphor-react"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Progress } from "@/components/ui/progress"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { open } = useSidebar();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await getAllUsersAdminAction();
      if (!res.success) throw new Error((res as any).error);
      return (res as any).data || [];
    }
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, currentStatus }: { userId: number, currentStatus: boolean }) => {
      const res = await toggleUserAdminAction(userId, !currentStatus);
      if (!res.success) throw new Error((res as any).error || "Failed to update status");
      return res;
    },
    onSuccess: () => {
      toast.success(`User admin status updated`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [creditAmount, setCreditAmount] = useState<string>("100");
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [historyUserId, setHistoryUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['admin-user-history', historyUserId],
    queryFn: async () => {
      if (!historyUserId) return null;
      const res = await getUserHistoryAdminAction(historyUserId);
      if (!res.success) throw new Error((res as any).error);
      return (res as any).data;
    },
    enabled: !!historyUserId && isHistoryDialogOpen,
  });

  const openHistoryDialog = (user: any) => {
    setHistoryUserId(user.id);
    setSelectedUser(user);
    setIsHistoryDialogOpen(true);
  };

  const updateCreditsMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: number, amount: number }) => {
      const res = await updateUserCreditsAction(userId, amount);
      if (!res.success) throw new Error((res as any).error || "Failed to update credits");
      return res;
    },
    onSuccess: () => {
      toast.success(`Credits updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsCreditDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ userId, isSuspended }: { userId: number; isSuspended: boolean }) => {
      const res = await suspendUserAction(userId, isSuspended);
      if (!res.success) throw new Error((res as any).error || "Failed to update suspension");
      return res;
    },
    onSuccess: () => {
      toast.success("User status updated");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const recalculateMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await recalculateUserUsageAction(userId);
      if (!res.success) throw new Error((res as any).error || "Failed to recalculate");
      return res;
    },
    onSuccess: (data: any) => {
      toast.success(`Usage recalculated: ${data.actualCount?.toLocaleString()} actual leads`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleToggleAdmin = (userId: number, currentStatus: boolean) => {
    toggleAdminMutation.mutate({ userId, currentStatus });
  }

  const openCreditDialog = (user: any) => {
    setSelectedUser(user);
    setIsCreditDialogOpen(true);
  }

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = !searchTerm
      || user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      || user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === "all" || user.planType === planFilter;
    const matchesStatus = statusFilter === "all"
      || (statusFilter === "suspended" ? user.isSuspended : !user.isSuspended);
    const matchesRole = roleFilter === "all"
      || (roleFilter === "admin" ? user.isAdmin : !user.isAdmin);

    return matchesSearch && matchesPlan && matchesStatus && matchesRole;
  });

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
                <BreadcrumbPage>User Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className={`flex-1 overflow-y-auto p-4 md:p-8 pt-6 ${open ? 'md:ml-[250px]' : 'md:ml-[30px]'}`}>
        {isLoading ? (
          <div className="flex h-[80vh] items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="w-full space-y-8 animate-in fade-in duration-700 pb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
              <p className="text-muted-foreground mt-1">
                View and manage all registered users, their plans, and administrative permissions.
              </p>
            </div>

            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>A complete list of users registered on the platform.</CardDescription>
                <div className="grid gap-3 pt-4 md:grid-cols-4">
                  <Input
                    placeholder="Search by name or email"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All plans</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[200px]">User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Bonus</TableHead>
                      <TableHead>Usage (Leads)</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: any) => (
                      <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {user.name}
                            {user.isAdmin && <Badge variant="secondary">Admin</Badge>}
                            {user.isSuspended && <Badge variant="destructive">Suspended</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={user.planType === 'premium' ? 'default' : user.planType === 'pro' ? 'secondary' : 'outline'}
                            className="capitalize"
                          >
                            {user.planType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1">
                            <Coins className="h-3 w-3" />
                            {user.bonusCredits || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold">
                              {user.leadsExtracted?.toLocaleString() || 0} / {user.planType === 'premium' ? 'Unlimited' : (500 + (user.bonusCredits || 0)).toLocaleString()}
                            </span>
                            <Progress
                              value={user.planType === 'premium' ? 0 : Math.min(((user.leadsExtracted || 0) / (500 + (user.bonusCredits || 0))) * 100, 100)}
                              className="h-1.5 w-24"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                              title={user.isAdmin ? "Remove Admin" : "Make Admin"}
                            >
                              {user.isAdmin ? <ShieldSlash className="h-4 w-4 text-red-500" /> : <Shield className="h-4 w-4 text-blue-500" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => suspendMutation.mutate({ userId: user.id, isSuspended: !user.isSuspended })}
                              title={user.isSuspended ? "Unsuspend user" : "Suspend user"}
                            >
                              <Shield className={`h-4 w-4 ${user.isSuspended ? "text-red-500" : "text-muted-foreground"}`} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openCreditDialog(user)} title="Manage Credits">
                              <Coins className="h-4 w-4 text-yellow-500" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openHistoryDialog(user)} title="View History">
                              <ClockCounterClockwise className="h-4 w-4 text-indigo-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => recalculateMutation.mutate(user.id)} 
                              title="Recalculate Usage (fix inflated counter)"
                              disabled={recalculateMutation.isPending}
                            >
                              <ArrowsClockwise className={`h-4 w-4 text-emerald-500 ${recalculateMutation.isPending ? 'animate-spin' : ''}`} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground italic">
                          No users found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage User Credits</DialogTitle>
            <DialogDescription>
              Add or remove additional lead extraction credits for <b>{selectedUser?.name}</b>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-dashed text-xs">
              <div className="space-y-1">
                <p className="text-muted-foreground uppercase font-black">Current Bonus</p>
                <p className="text-xl font-bold text-foreground">{selectedUser?.bonusCredits || 0} Credits</p>
              </div>
              <Coins className="h-8 w-8 text-yellow-500 opacity-20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Adjustment Amount</Label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="pl-9 bg-muted/10"
                  placeholder="e.g. 500"
                />
              </div>
              <p className="text-[10px] text-muted-foreground px-1">Positive values add credits, negative values remove them.</p>
            </div>
          </div>
          <DialogFooter className="gap-2  sm:gap-0">
            <Button
              variant="outline"
              className="gap-2 mr-2"
              onClick={() => {
                const amount = Math.abs(parseInt(creditAmount) || 0);
                if (selectedUser) updateCreditsMutation.mutate({ userId: selectedUser.id, amount: -amount });
              }}
              disabled={updateCreditsMutation.isPending || !selectedUser || !creditAmount}
            >
              <Minus className="h-4 w-4" /> Deduct
            </Button>
            <Button
              className="gap-2"
              onClick={() => {
                const amount = Math.abs(parseInt(creditAmount) || 0);
                if (selectedUser) updateCreditsMutation.mutate({ userId: selectedUser.id, amount: amount });
              }}
              disabled={updateCreditsMutation.isPending || !selectedUser || !creditAmount}
            >
              <Plus className="h-4 w-4" /> {updateCreditsMutation.isPending ? "Updating..." : "Add Credits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoryDialogOpen} onOpenChange={(open) => { setIsHistoryDialogOpen(open); if (!open) setHistoryUserId(null); }}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>User History</DialogTitle>
            <DialogDescription>
              Subscription, payment, and activity history for <b>{selectedUser?.name}</b> ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>

          {isHistoryLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : historyData ? (
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {/* User Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-muted/50 rounded-xl border border-dashed text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Plan</p>
                  <p className="text-sm font-bold text-foreground capitalize mt-1">{historyData.user.planType}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl border border-dashed text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Leads Used</p>
                  <p className="text-sm font-bold text-foreground mt-1">{historyData.user.leadsExtracted?.toLocaleString() || 0}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl border border-dashed text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Bonus Credits</p>
                  <p className="text-sm font-bold text-foreground mt-1">{historyData.user.bonusCredits || 0}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl border border-dashed text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Sub. Expiry</p>
                  <p className="text-sm font-bold text-foreground mt-1">
                    {historyData.user.subscriptionExpiry
                      ? format(new Date(historyData.user.subscriptionExpiry), 'MMM dd, yyyy')
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Payment Transactions */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-3">Payment Transactions</h4>
                {historyData.transactions.length === 0 ? (
                  <div className="text-center py-8 bg-muted/20 border border-dashed rounded-xl">
                    <p className="text-muted-foreground text-sm">No payment transactions found.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {historyData.transactions.map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-card border rounded-xl hover:bg-muted/30 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">{tx.planName || 'Unknown Plan'}</span>
                            <Badge
                              variant={tx.status === 'completed' ? 'default' : tx.status === 'failed' ? 'destructive' : 'secondary'}
                              className="text-[10px] capitalize"
                            >
                              {tx.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            {tx.gatewayOrderId && <span>Order: {tx.gatewayOrderId}</span>}
                            {tx.utr && <span>UTR: {tx.utr}</span>}
                            {tx.planCredits && <span>{tx.planCredits.toLocaleString()} credits</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm tabular-nums">Rs. {Number(tx.amount).toLocaleString()}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {tx.createdAt ? format(new Date(tx.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Audit Logs */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-3">Activity Log</h4>
                {historyData.auditLogs.length === 0 ? (
                  <div className="text-center py-8 bg-muted/20 border border-dashed rounded-xl">
                    <p className="text-muted-foreground text-sm">No activity logs found.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {historyData.auditLogs.map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between p-2.5 bg-card border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-1 h-6 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <div>
                            <span className="font-medium text-xs text-foreground capitalize">{log.action?.replace(/_/g, ' ')}</span>
                            {log.metadata && (
                              <p className="text-[10px] text-muted-foreground truncate max-w-[300px]">{log.metadata}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
                          {log.createdAt ? format(new Date(log.createdAt), 'MMM dd HH:mm') : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
