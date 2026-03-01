'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  List,
  MagnifyingGlass,
  Database,
  ClockCounterClockwise,
  GearSix,
  SignOut,
  User,
  CaretUp,
  CreditCard,
  Stack
} from 'phosphor-react';
import { Progress } from '@/components/ui/progress';
import { logoutAction } from '@/app/actions';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAutomation } from '@/context/AutomationContext';
import { Logo } from './Logo';
import { useSidebar } from '@/components/ui/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user, isLoadingUser, isFetchingUser } = useAutomation();
  const { open } = useSidebar();
  const queryClient = useQueryClient();

  const isActuallyLoading = isLoadingUser || (isFetchingUser && !user);

  const menuItems = [
    {
      title: 'Navigation',
      items: [
        {
          title: 'Lead Extractor',
          icon: MagnifyingGlass,
          url: '/leads',
        },
        {
          title: 'Keyword Generator',
          icon: List,
          url: '/keywords',
        },
        {
          title: 'Automation Tasks',
          icon: Activity,
          url: '/tasks',
        },
        {
          title: 'History',
          icon: ClockCounterClockwise,
          url: '/history',
        },
        {
          title: 'Saved Lists',
          icon: Stack,
          url: '/lists',
        },
        {
          title: 'Settings',
          icon: GearSix,
          url: '/settings',
        },
        {
          title: 'Subscription',
          icon: CreditCard,
          url: '/subscription',
        },
      ],
    }
  ];

  return (
    <Sidebar collapsible="icon" variant={'floating'} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className=" ml-[-1.5px] data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex items-center justify-center rounded-lg text-sidebar-primary-foreground">
                <Logo className={`${open ? "w-10" : "w-7"} ${open ? "h-10" : "h-7"} ml-[-4px]`}/>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="font-semibold truncate">LeadSpotter</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className='ml-1.5 mr-3'>
        {menuItems.map((group) => (
          <React.Fragment  key={group.title}>
            <SidebarMenu >
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </React.Fragment>
        ))}

        

        {isActuallyLoading ? (
          <div className="px-4 py-4 mt-4 bg-sidebar-accent/30 rounded-xl mx-2 flex justify-center items-center">
            <span className="text-xs font-medium text-muted-foreground animate-pulse">Loading usage...</span>
          </div>
        ) : user && open && (
          <div className="px-4 py-4 mt-4 bg-sidebar-accent/30 rounded-xl mx-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-muted-foreground  tracking-wider">Usage</span>
              {(() => {
                const isUnlimited = user.planType === 'premium' || user.planType === 'enterprise';
                const bonus = (user as any).bonusCredits || 0;
                const total = isUnlimited ? Infinity : 500 + bonus;
                
                return (
                  <span className="text-xs font-bold text-primary">
                    {user.leadsExtracted?.toLocaleString() || 0} / {total === Infinity ? '∞' : total.toLocaleString()}
                  </span>
                );
              })()}
            </div>
            {(() => {
                const isUnlimited = user.planType === 'premium' || user.planType === 'enterprise';
                const bonus = (user as any).bonusCredits || 0;
                const total = isUnlimited ? Infinity : 500 + bonus;
                const percent = total === Infinity ? 0 : Math.min(((user.leadsExtracted || 0) / total) * 100, 100);
                
                return <Progress value={percent} className="h-1.5" />;
            })()}
            <p className="text-[10px] text-muted-foreground mt-2 text-center italic">
              Plan: <span className="font-bold capitalize">{user.planType}</span>
            </p>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 pt-4 group-data-[collapsible=icon]:hidden">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 overflow-hidden">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick actions</p>
            <div className="mt-3 grid gap-2">
              <Button asChild size="sm" className="w-full justify-start">
                <Link href="/leads" className="flex w-full items-center gap-2 min-w-0">
                  <MagnifyingGlass className="h-4 w-4 shrink-0" />
                  <span className="truncate">New extraction</span>
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="w-full justify-start">
                <Link href="/keywords" className="flex w-full items-center gap-2 min-w-0">
                  <List className="h-4 w-4 shrink-0" />
                  <span className="truncate">Generate keywords</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  disabled={isActuallyLoading}
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <User className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{isActuallyLoading ? 'Loading...' : (user?.name || 'Account')}</span>
                    <span className="truncate text-xs">{isActuallyLoading ? 'Please wait' : (user?.email || '')}</span>
                  </div>
                  <CaretUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <User className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.name}</span>
                      <span className="truncate text-xs">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="size-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  onClick={async () => {
                    const res = await logoutAction();
                    if (res.success) {
                      queryClient.clear();
                      localStorage.clear();
                      toast.success('Logged out successfully');
                      window.location.href = '/login';
                    }
                  }}
                >
                  <SignOut className="size-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
