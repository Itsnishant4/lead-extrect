"use client"

import { useState } from "react"
import { 
  getAllUsersAdminAction, 
  toggleUserAdminAction,
  updateUserCreditsAction,
  suspendUserAction
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
import { Shield, ShieldSlash, Calendar, Coins, Plus, Minus } from "phosphor-react"
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
import { ThemeToggle } from "@/components/ThemeToggle"

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await getAllUsersAdminAction();
      if (!res.success) throw new Error(res.error);
      return res.data || [];
    }
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, currentStatus }: { userId: number, currentStatus: boolean }) => {
      const res = await toggleUserAdminAction(userId, !currentStatus);
      if (!res.success) throw new Error(res.error || "Failed to update status");
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
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const updateCreditsMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: number, amount: number }) => {
      const res = await updateUserCreditsAction(userId, amount);
      if (!res.success) throw new Error(res.error || "Failed to update credits");
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
      if (!res.success) throw new Error(res.error || "Failed to update suspension");
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

  const handleToggleAdmin = (userId: number, currentStatus: boolean) => {
    toggleAdminMutation.mutate({ userId, currentStatus });
  }

  const openCreditDialog = (user: any) => {
    setSelectedUser(user);
    setIsCreditDialogOpen(true);
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = !searchTerm
      || user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      || user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === "all" || user.plan_type === planFilter;
    const matchesStatus = statusFilter === "all"
      || (statusFilter === "suspended" ? user.is_suspended : !user.is_suspended);
    const matchesRole = roleFilter === "all"
      || (roleFilter === "admin" ? user.is_admin : !user.is_admin);

    return matchesSearch && matchesPlan && matchesStatus && matchesRole;
  });

  

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b">
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
        <ThemeToggle />
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-6">
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
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {user.name}
                            {user.is_admin && <Badge variant="secondary">Admin</Badge>}
                            {user.is_suspended && <Badge variant="destructive">Suspended</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.plan_type === 'premium' ? 'default' : user.plan_type === 'pro' ? 'secondary' : 'outline'} 
                            className="capitalize"
                            >
                            {user.plan_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                           <Badge variant="secondary" className="gap-1">
                             <Coins className="h-3 w-3" />
                             {user.bonus_credits || 0}
                           </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold">
                              {user.leads_extracted?.toLocaleString() || 0} / {((user.plan_type === 'pro' ? 5000 : user.plan_type === 'premium' ? 9999999 : 500) + (user.bonus_credits || 0)).toLocaleString()}
                            </span>
                            <Progress 
                              value={user.plan_type === 'premium' ? 0 : Math.min(((user.leads_extracted || 0) / ((user.plan_type === 'pro' ? 5000 : 500) + (user.bonus_credits || 0))) * 100, 100)} 
                              className="h-1.5 w-24"
                              />
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(user.created_at), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                              title={user.is_admin ? "Remove Admin" : "Make Admin"}
                              >
                              {user.is_admin ? <ShieldSlash className="h-4 w-4 text-red-500" /> : <Shield className="h-4 w-4 text-blue-500" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => suspendMutation.mutate({ userId: user.id, isSuspended: !user.is_suspended })}
                              title={user.is_suspended ? "Unsuspend user" : "Suspend user"}
                            >
                              <Shield className={`h-4 w-4 ${user.is_suspended ? "text-red-500" : "text-muted-foreground"}`} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openCreditDialog(user)} title="Manage Credits">
                              <Coins className="h-4 w-4 text-yellow-500" />
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
                   <p className="text-xl font-bold text-foreground">{selectedUser?.bonus_credits || 0} Credits</p>
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
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                className="gap-2" 
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
    </>
  )
}
