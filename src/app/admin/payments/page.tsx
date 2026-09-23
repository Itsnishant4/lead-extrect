"use client"

import { useState } from "react"
import {
  getAllPaymentsAdminAction,
  acceptPaymentAdminAction,
  rejectPaymentAdminAction
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MagnifyingGlass, CheckCircle, XCircle, CurrencyInr, Receipt, Clock, ArrowsClockwise } from "phosphor-react"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

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

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const { open } = useSidebar();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const res = await getAllPaymentsAdminAction();
      if (!res.success) throw new Error((res as any).error);
      return (res as any).data || [];
    },
    staleTime: 15_000,
    gcTime: 120_000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    refetchInterval: 30_000,
  });

  const acceptMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      const res = await acceptPaymentAdminAction(transactionId);
      if (!res.success) throw new Error((res as any).error || "Failed to accept payment");
      return res;
    },
    onSuccess: () => {
      toast.success("Payment accepted and credits applied");
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      const res = await rejectPaymentAdminAction(transactionId);
      if (!res.success) throw new Error((res as any).error || "Failed to reject payment");
      return res;
    },
    onSuccess: () => {
      toast.success("Payment rejected");
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const filteredPayments = payments.filter((p: any) => {
    const matchesSearch = !searchTerm
      || p.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      || p.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      || p.gatewayOrderId?.toLowerCase().includes(searchTerm.toLowerCase())
      || p.utr?.toLowerCase().includes(searchTerm.toLowerCase())
      || p.planName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
  const pendingCount = payments.filter((p: any) => p.status === 'pending').length;
  const paidCount = payments.filter((p: any) => p.status === 'paid').length;
  const rejectedCount = payments.filter((p: any) => p.status === 'rejected').length;

  const statusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
                <BreadcrumbPage>Payment Log</BreadcrumbPage>
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
              <h2 className="text-3xl font-bold tracking-tight">Payment Log</h2>
              <p className="text-muted-foreground mt-1">
                View all payment transactions. Accept or reject pending payments.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <Card className="border-border/50 bg-card/50 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-bold">Total Revenue</CardTitle>
                  <div className="bg-emerald-500/10 p-2 rounded-lg">
                    <CurrencyInr className="h-4 w-4 text-emerald-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">Rs. {totalRevenue.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1">From paid transactions</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-bold">Pending</CardTitle>
                  <div className="bg-amber-500/10 p-2 rounded-lg">
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{pendingCount}</div>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1">Awaiting action</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-bold">Paid</CardTitle>
                  <div className="bg-emerald-500/10 p-2 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{paidCount}</div>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1">Successful payments</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-bold">Rejected</CardTitle>
                  <div className="bg-rose-500/10 p-2 rounded-lg">
                    <XCircle className="h-4 w-4 text-rose-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{rejectedCount}</div>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1">Declined payments</p>
                </CardContent>
              </Card>
            </div>

            {/* Payments Table */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>Complete payment history across all users.</CardDescription>
                <div className="grid gap-3 pt-4 md:grid-cols-3">
                  <div className="relative md:col-span-2">
                    <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by user, order ID, UTR, or plan..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>UTR</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment: any) => (
                      <TableRow key={payment.id} className={cn(
                        "hover:bg-muted/30 transition-colors",
                        payment.status === 'pending' && "bg-amber-500/[0.03]"
                      )}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{payment.userName || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">{payment.userEmail || ''}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{payment.planName || 'N/A'}</div>
                            {payment.planCredits && (
                              <div className="text-[10px] text-muted-foreground">{payment.planCredits.toLocaleString()} credits</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold tabular-nums">
                          Rs. {Number(payment.amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {payment.gatewayOrderId || '-'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {payment.utr || '-'}
                        </TableCell>
                        <TableCell>
                          {statusBadge(payment.status)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {payment.createdAt ? format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          {payment.status === 'pending' ? (
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                onClick={() => acceptMutation.mutate(payment.id)}
                                disabled={acceptMutation.isPending || rejectMutation.isPending}
                                title="Accept payment"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                <span className="text-xs font-bold">Accept</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                onClick={() => rejectMutation.mutate(payment.id)}
                                disabled={acceptMutation.isPending || rejectMutation.isPending}
                                title="Reject payment"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                <span className="text-xs font-bold">Reject</span>
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">--</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredPayments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Receipt className="h-8 w-8 text-muted-foreground/30" />
                            <p className="text-muted-foreground text-sm">No transactions found.</p>
                          </div>
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
    </>
  )
}
