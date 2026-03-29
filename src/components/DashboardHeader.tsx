'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAutomation } from '@/context/AutomationContext';
import { logoutAction, getNotificationsAction, getUnreadNotificationCountAction, markNotificationReadAction, markAllNotificationsReadAction } from '@/app/actions';
import { toast } from 'sonner';
import { Logo } from '@/components/Logo';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Zap, Rocket, ChevronDown, User, CreditCard,
  LogOut, LogIn, UserPlus, X,
  Menu, Receipt, LayoutDashboard,
  Bell, Check, CheckCheck, AlertTriangle, CreditCard as CreditCardIcon,
  CircleCheck, CircleX, Info, Settings,
} from 'lucide-react';
import { Plugs } from 'phosphor-react';

type NavStyle = 'default' | 'segment' | 'iconOnly' | 'wide' | 'logoDashboard';

interface DashboardHeaderProps {
  activePage: 'dashboard' | 'leads' | 'campaigns';
  navStyle?: NavStyle;
}

const navIcons = {
  dashboard: LayoutDashboard,
  leads: Zap,
  campaigns: Rocket,
} as const;

function getNotifIcon(type: string) {
  switch (type) {
    case 'task_completed': return <CircleCheck size={14} />;
    case 'task_failed': return <CircleX size={14} />;
    case 'credits_low': return <AlertTriangle size={14} />;
    case 'payment_success': return <CreditCardIcon size={14} />;
    case 'subscription_expiring': return <AlertTriangle size={14} />;
    default: return <Info size={14} />;
  }
}

function getNotifIconStyle(type: string) {
  switch (type) {
    case 'task_completed': return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400';
    case 'task_failed': return 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400';
    case 'credits_low': return 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400';
    case 'payment_success': return 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400';
    case 'subscription_expiring': return 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400';
    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';
  }
}

function formatNotifTime(date: string | Date | null) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}

export function DashboardHeader({ activePage, navStyle = 'default' }: DashboardHeaderProps) {
  const { user, isLoadingUser, isFetchingUser } = useAutomation();
  const queryClient = useQueryClient();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Consider user as loading if either initial load is true, OR it's fetching and we don't have user yet (fresh login)
  const isActuallyLoading = isLoadingUser || (isFetchingUser && !user);

  // ── Notification queries ──
  const { data: unreadData } = useQuery({
    queryKey: ['notification-unread-count'],
    queryFn: () => getUnreadNotificationCountAction(),
    refetchInterval: 60_000, // poll every 60s
    enabled: !!user,
  });
  const unreadCount = (unreadData?.success && 'count' in unreadData) ? (unreadData.count as number) : 0;

  const { data: notifsData, isLoading: isLoadingNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotificationsAction(),
    enabled: !!user && showNotifications,
    refetchInterval: showNotifications ? 30_000 : false,
  });
  const notifications = (notifsData?.success && 'data' in notifsData && notifsData.data) ? notifsData.data : [];

  const markReadMutation = useMutation({
    mutationFn: (id: number) => markNotificationReadAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsReadAction(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
    },
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showMobileMenu]);

  const handleLogout = async () => {
    setShowMobileMenu(false);
    const res = await logoutAction();
    if (res.success) {
      queryClient.clear();
      localStorage.clear();
      toast.success('Logged out successfully');
      window.location.href = '/login';
    }
  };

  const allNavLinks = [
    { key: 'dashboard' as const, href: '/dashboard', label: 'Dashboard' },
    { key: 'leads' as const, href: '/leads', label: 'Leads' },
    { key: 'campaigns' as const, href: '/tasks', label: 'Campaigns' },
  ];

  // Option D: remove Dashboard tab (logo links to dashboard instead)
  const navLinks = navStyle === 'logoDashboard'
    ? allNavLinks.filter(l => l.key !== 'dashboard')
    : allNavLinks;

  return (
    <>
      <header className="w-full fixed top-0 z-50 pt-4">
        <div className={`${navStyle === 'wide' ? 'max-w-5xl' : 'max-w-4xl'} mx-auto flex items-center justify-between rounded-full px-4 py-2.5 backdrop-blur-xl`}>
          {/* Logo */}
          <Link href={navStyle === 'logoDashboard' ? '/dashboard' : '/leads'} id="tour-logo" className="flex mr-4 items-center gap-2 shrink-0">
            <Logo className="w-7 h-7 " />
            <span className="text-base font-bold tracking-tight text-indigo-950 dark:text-indigo-100">LeadSpotter</span>
          </Link>

          {/* Desktop nav — hidden on mobile */}
          {navStyle === 'segment' ? (
            /* Option A: Segment Control — tabs inside a pill container */
            <nav className="hidden md:flex items-center bg-slate-100/70 dark:bg-slate-800/50 rounded-full p-1" id="tour-nav">
              {navLinks.map((link) => {
                const Icon = navIcons[link.key];
                const isActive = activePage === link.key;
                return (
                  <Link
                    key={link.key}
                    href={link.href}
                    id={`tour-nav-${link.key}`}
                    className={`px-3.5 py-1.5 text-sm rounded-full flex items-center gap-1.5 transition-all duration-200 ${isActive
                      ? 'font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-700 shadow-sm'
                      : 'font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          ) : navStyle === 'iconOnly' ? (
            /* Option B: Icon-only inactive tabs, icon+label for active */
            <nav className="hidden md:flex items-center gap-1" id="tour-nav">
              {navLinks.map((link) => {
                const Icon = navIcons[link.key];
                const isActive = activePage === link.key;
                return (
                  <Link
                    key={link.key}
                    href={link.href}
                    id={`tour-nav-${link.key}`}
                    title={link.label}
                    className={`py-1.5 text-sm rounded-full flex items-center gap-1.5 transition-all duration-200 ${isActive
                      ? 'px-3.5 font-semibold text-indigo-600 hover:shadow-md bg-gradient-to-b from-white to-gray-900/01 shadow-sm'
                      : 'px-2.5 font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-white/5'
                      }`}
                  >
                    <Icon size={18} />
                    {isActive && <span>{link.label}</span>}
                  </Link>
                );
              })}
            </nav>
          ) : (
            /* Default / Wide / LogoDashboard — standard tabs (natural width) */
            <nav className="hidden md:flex items-center gap-1 " id="tour-nav">
              {navLinks.map((link) => {
                const Icon = navIcons[link.key];
                return (
                  <Link
                    key={link.key}
                    href={link.href}
                    id={`tour-nav-${link.key}`}
                    className={`px-3 py-1.5  text-sm rounded-full flex items-center gap-1.5 transition-all duration-200 ${activePage === link.key
                      ? 'font-semibold text-indigo-600 hover:shadow-md bg-gradient-to-b from-white to-gray-900/01 shadow-sm'
                      : 'font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                      }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Desktop profile dropdown — hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <div className="relative" ref={dropdownRef}>
              <button
                id="tour-profile"
                onClick={() => !isActuallyLoading && setShowDropdown(!showDropdown)}
                disabled={isActuallyLoading}
                className={`flex items-center gap-3 p-1 pr-3 rounded-full border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-white/5 transition-colors ${isActuallyLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-white/10'}`}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-700 shadow-sm bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-sm">
                    {isActuallyLoading ? '...' : (user?.name?.charAt(0)?.toUpperCase() || 'U')}
                  </div>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[8px] font-bold px-0.5 shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                {isActuallyLoading ? (
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Loading...</span>
                ) : user ? (
                  <div className="text-left">
                    <p className="text-xs font-bold truncate w-[70px] text-slate-800 dark:text-slate-200 leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium capitalize">{user.planType || 'Free'} Plan</p>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Account</span>
                )}
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/50 dark:shadow-black/30 overflow-hidden z-50" ref={notifRef}>
                  {user ? (
                    showNotifications ? (
                      /* ── Notification panel inside dropdown ── */
                      <>
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            <ChevronDown size={14} className="rotate-90" />
                            Notifications
                          </button>
                          {unreadCount > 0 && (
                            <button
                              onClick={() => markAllReadMutation.mutate()}
                              disabled={markAllReadMutation.isPending}
                              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-[340px] overflow-y-auto">
                          {isLoadingNotifs ? (
                            <div className="px-4 py-8 text-center text-sm text-slate-400">Loading...</div>
                          ) : notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                              <Bell size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                              <p className="text-sm text-slate-400 dark:text-slate-500">No notifications yet</p>
                            </div>
                          ) : (
                            notifications.map((n: any) => (
                              <button
                                key={n.id}
                                onClick={() => { if (!n.isRead) markReadMutation.mutate(n.id); }}
                                className={`w-full text-left px-4 py-3 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}`}
                              >
                                <div className="flex items-start gap-2.5">
                                  <div className={`mt-0.5 shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${getNotifIconStyle(n.type)}`}>
                                    {getNotifIcon(n.type)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <p className={`text-xs font-semibold truncate ${!n.isRead ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {n.title}
                                      </p>
                                      {!n.isRead && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{formatNotifTime(n.createdAt)}</p>
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    ) : (
                      /* ── Normal dropdown menu ── */
                      <>
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={() => setShowNotifications(true)}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <div className="relative">
                            <Bell size={18} />
                            {unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[8px] font-bold px-0.5">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                          </div>
                          Notifications
                        </button>
                        <Link
                          href="/profile"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <User size={18} />
                          Profile
                        </Link>
                        <Link
                          href="/subscription"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <CreditCard size={18} />
                          Subscription & Billing
                        </Link>
                        <Link
                          href="/integrations"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <Plugs size={18} />
                          Integrations
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <Settings size={18} />
                          Settings
                        </Link>
                        <div className="border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                          >
                            <LogOut size={18} />
                            Log out
                          </button>
                        </div>
                      </>
                    )
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                      >
                        <LogIn size={18} />
                        Log in
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-t border-slate-100 dark:border-slate-800"
                      >
                        <UserPlus size={18} />
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile: notification bell + hamburger */}
          <div className="md:hidden flex items-center gap-1.5">
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative w-9 h-9 flex items-center justify-center rounded-full border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-colors"
                >
                  <Bell size={18} className="text-slate-600 dark:text-slate-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold px-1 shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-80 max-h-[420px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/50 dark:shadow-black/30 overflow-hidden z-50 flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Notifications</p>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllReadMutation.mutate()}
                          disabled={markAllReadMutation.isPending}
                          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {isLoadingNotifs ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-400">Loading...</div>
                      ) : notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <Bell size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                          <p className="text-sm text-slate-400 dark:text-slate-500">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((n: any) => (
                          <button
                            key={n.id}
                            onClick={() => { if (!n.isRead) markReadMutation.mutate(n.id); }}
                            className={`w-full text-left px-4 py-3 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className={`mt-0.5 shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${getNotifIconStyle(n.type)}`}>
                                {getNotifIcon(n.type)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <p className={`text-xs font-semibold truncate ${!n.isRead ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {n.title}
                                  </p>
                                  {!n.isRead && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{formatNotifTime(n.createdAt)}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setShowMobileMenu(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-colors"
            >
              <Menu size={18} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${showMobileMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setShowMobileMenu(false)}
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/20 transition-transform duration-300 ease-out md:hidden flex flex-col ${showMobileMenu ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <Link href="/leads" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2">
            <Logo className="w-6 h-6" />
            <span className="text-sm font-bold tracking-tight text-indigo-950 dark:text-indigo-100">LeadSpotter</span>
          </Link>
          <button
            onClick={() => setShowMobileMenu(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800">
          <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            Navigation
          </p>
          {navLinks.map((link) => {
            const Icon = navIcons[link.key];
            const isActive = activePage === link.key;
            return (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors mb-0.5 ${isActive
                  ? 'font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
                  : 'font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-foreground'
                  }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Account links */}
        <div className="px-3 py-3 flex-1">
          <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            Account
          </p>
          {isActuallyLoading ? (
            <div className="px-3 py-2.5 text-sm font-medium text-slate-400 dark:text-slate-500">
              Loading...
            </div>
          ) : user ? (
            <>
              <Link
                href="/profile"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-foreground transition-colors mb-0.5"
              >
                <User size={18} />
                Profile
              </Link>
              <Link
                href="/subscription"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-foreground transition-colors mb-0.5"
              >
                <CreditCard size={18} />
                Subscription & Billing
              </Link>
              <Link
                href="/settings"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-foreground transition-colors mb-0.5"
              >
                <Settings size={18} />
                Settings
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors mb-0.5"
              >
                <LogIn size={18} />
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mb-0.5"
              >
                <UserPlus size={18} />
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Logout at bottom */}
        {/* User info */}
        {user && (
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-base ring-2 ring-white dark:ring-slate-700 shadow-sm">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-2.5">
              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                {user.planType || 'Free'} Plan
              </span>
            </div>
          </div>
        )}
        {user && (
          <div className="px-3 py-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
            >
              <LogOut size={18} />
              Log out
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
