'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAutomation } from '@/context/AutomationContext';
import { logoutAction } from '@/app/actions';
import { toast } from 'sonner';
import { Logo } from '@/components/Logo';
import { useQueryClient } from '@tanstack/react-query';
import {
  Search, Zap, Rocket, ChevronDown, User, CreditCard,
  LogOut, LogIn, UserPlus, X,
  Menu, Receipt,
} from 'lucide-react';

interface DashboardHeaderProps {
  activePage: 'search' | 'bulk' | 'campaigns';
}

const navIcons = {
  search: Search,
  bulk: Zap,
  campaigns: Rocket,
} as const;

export function DashboardHeader({ activePage }: DashboardHeaderProps) {
  const { user, isLoadingUser, isFetchingUser } = useAutomation();
  const queryClient = useQueryClient();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Consider user as loading if either initial load is true, OR it's fetching and we don't have user yet (fresh login)
  const isActuallyLoading = isLoadingUser || (isFetchingUser && !user);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
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

  const navLinks = [
    { key: 'search', href: '/leads', label: 'Search' },
    { key: 'bulk', href: '/keywords', label: 'Bulk' },
    { key: 'campaigns', href: '/tasks', label: 'Campaigns' },
  ] as const;

  return (
    <>
      <header className="w-full fixed top-0 z-50 px-4 pt-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between rounded-full px-4 py-2.5 backdrop-blur-xl">
          {/* Logo */}
          <Link href="/leads" className="flex items-center gap-2 shrink-0">
            <Logo className="w-7 h-7" />
            <span className="text-base font-bold tracking-tight text-indigo-950 dark:text-indigo-100">LeadSpotter</span>
          </Link>

          {/* Desktop nav — hidden on mobile */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = navIcons[link.key];
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`px-3 py-1.5 text-sm rounded-full flex items-center gap-1.5 transition-all duration-200 ${activePage === link.key
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

          {/* Desktop profile dropdown — hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => !isActuallyLoading && setShowDropdown(!showDropdown)}
                disabled={isActuallyLoading}
                className={`flex items-center gap-3 p-1 pr-3 rounded-full border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-white/5 transition-colors ${isActuallyLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-white/10'}`}
              >
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-700 shadow-sm bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-sm">
                  {isActuallyLoading ? '...' : (user?.name?.charAt(0)?.toUpperCase() || 'U')}
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
                <div className="absolute right-0 mt-2 w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/50 dark:shadow-black/30 overflow-hidden z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
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
                        Subscription
                      </Link>
                      <Link
                        href="/payment/history"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <Receipt size={18} />
                        Payment History
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

          <button
            onClick={() => setShowMobileMenu(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-colors"
          >
            <Menu size={18} className="text-slate-600 dark:text-slate-300" />
          </button>
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
                Subscription
              </Link>
              <Link
                href="/payment/history"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-foreground transition-colors mb-0.5"
              >
                <Receipt size={18} />
                Payment History
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
