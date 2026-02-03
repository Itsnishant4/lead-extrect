'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  List,
  Search,
  Database,
  History,
  Settings,
  LogOut,
} from 'lucide-react';
import { logoutAction } from '@/app/actions';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const menuItems = [
    {
      title: 'Navigation',
      items: [
        {
          title: 'Lead Extractor',
          icon: Search,
          url: '/',
        },
        {
          title: 'Keyword Gen',
          icon: List,
          url: '/keywords',
        },
        {
          title: 'Automation Tasks',
          icon: Activity,
          url: '/tasks',
        },
        {
          title: 'Generation History',
          icon: History,
          url: '/history',
        },
        {
          title: 'Settings',
          icon: Settings,
          url: '/settings',
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" variant={'floating'} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className=" ml-[-1.5px] data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex  aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-sidebar-primary-foreground">
                <Database className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="font-semibold truncate">LeadExtractor Pro</span>
                <span className="text-xs truncate">v2.0.0-pro</span>
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
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg"
              className="mt-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={async () => {
                const res = await logoutAction();
                if (res.success) {
                  toast.success('Logged out successfully');
                  window.location.href = '/login';
                }
              }}
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
