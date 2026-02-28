'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layout,
  Users,
  FileText,
  ArrowLeft,
  Database,
  User,
  CaretUp,
  SignOut,
  ShieldCheck,
  CreditCard,
  Megaphone
} from 'phosphor-react';
import { logoutAction } from '@/app/actions';
import { toast } from 'sonner';
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

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user } = useAutomation();
  const queryClient = useQueryClient();

  const adminMenuItems = [
    {
      title: 'Admin Overview',
      icon: Layout,
      url: '/admin',
    },
    {
      title: 'User Management',
      icon: Users,
      url: '/admin/users',
    },
    {
      title: 'Blog Management',
      icon: FileText,
      url: '/admin/blog',
    },
    {
      title: 'Plans & Pricing',
      icon: CreditCard,
      url: '/admin/plans',
    },
    {
      title: 'Payment Log',
      icon: CreditCard,
      url: '/admin/payments',
    },
    {
      title: 'Banner Settings',
      icon: Megaphone,
      url: '/admin/banner',
    },
    {
      title: 'System Logs',
      icon: Layout, // Changed icon for Logs since FileText is better for Blog
      url: '/admin/logs',
    },
  ];

  return (
    <Sidebar collapsible="icon" variant={'floating'} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="ml-[-1.5px] data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="font-semibold truncate">Admin Panel</span>
                <span className="text-xs truncate text-muted-foreground">System Control</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className='ml-1.5 mr-3'>
        <SidebarMenu>
          {adminMenuItems.map((item) => (
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
          
          <div className="my-4 border-t border-sidebar-border mx-2" />
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to App">
              <Link href="/">
                <ArrowLeft className="size-4" />
                <span>Back to App</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <User className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name || 'Admin'}</span>
                    <span className="truncate text-xs">{user?.email || ''}</span>
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
