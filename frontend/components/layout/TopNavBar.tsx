'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useUIStore } from '@/lib/ui-store';
import ProfileDropdown from './ProfileDropdown';
import { Search, Edit3, Bell, Sun, Moon } from 'lucide-react';

export default function TopNavBar() {
  const { user, loading } = useAuth();
  const { toggleSidebar } = useUIStore();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const router = useRouter();
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/feed?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      router.push('/feed');
    }
  };

  // Initialize theme based on document state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setTheme('dark');
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant shadow-sm">
      <nav className="flex justify-between items-center h-16 px-6 w-full">

        {/* Left: Logo + Categories */}
        <div className="flex items-center gap-8">
          {/* Hamburger Menu (always visible) */}
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            title="Toggle Navigation"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link
            href="/feed"
            id="topnavbar-logo"
            className="font-headline-md text-3xl font-black text-primary tracking-tight select-none"
          >
            CodeNexus
          </Link>


        </div>

        {/* Right: Search + Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search trigger */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center gap-2 bg-[#f4f5f7] px-4 py-2 rounded-full border border-transparent hover:border-slate-200 transition-all focus-within:bg-white focus-within:border-slate-300 focus-within:shadow-sm">
            <Search className="size-[18px] shrink-0 text-slate-500" strokeWidth={2.5} />
            <input
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="bg-transparent border-none text-[15px] w-48 focus:outline-none text-slate-700 placeholder:text-slate-400 font-medium"
              placeholder="Search articles..."
              type="text"
            />
            <kbd className="font-sans text-[11px] font-semibold bg-[#e2e8f0] text-slate-500 px-1.5 py-0.5 rounded flex items-center justify-center tracking-widest ml-2">⌘K</kbd>
          </form>

          {/* Mobile search input toggle */}
          <form onSubmit={handleSearchSubmit} className="md:hidden flex items-center relative group">
            <input
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="absolute right-0 w-0 focus:w-48 bg-[#f4f5f7] px-3 py-2 rounded-full border border-transparent text-[15px] focus:outline-none transition-all duration-300 ease-in-out opacity-0 focus:opacity-100 z-20 text-slate-700"
              placeholder="Search..."
              type="text"
            />
            <button type="button" onClick={(e) => { (e.currentTarget.previousElementSibling as HTMLInputElement)?.focus(); }} className="p-2 z-30 bg-surface text-slate-500 hover:text-slate-800 rounded-full transition-colors cursor-pointer group-focus-within:bg-transparent">
              <Search className="size-5" />
            </button>
          </form>

          <div className="h-6 w-px bg-slate-200 hidden md:block" />

          {/* Write Button */}
          {loading ? (
             <div className="flex items-center gap-2 font-body-md text-[15px] font-medium text-slate-400 cursor-default">
               <Edit3 className="size-[18px] opacity-50" strokeWidth={2.5} />
               <span className="hidden sm:inline opacity-50">Write</span>
             </div>
          ) : user ? (
            <Link
              href="/write"
              id="topnavbar-write-btn"
              className="flex items-center gap-2 font-body-md text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors active:scale-95"
            >
              <Edit3 className="size-[18px]" strokeWidth={2.5} />
              <span className="hidden sm:inline">Write</span>
            </Link>
          ) : (
            <Link
              href="/login"
              id="topnavbar-write-anonymous-btn"
              className="flex items-center gap-2 font-body-md text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Edit3 className="size-[18px]" strokeWidth={2.5} />
              <span className="hidden sm:inline">Write</span>
            </Link>
          )}

          {/* Sign In / Profile */}
          {loading ? (
             <div className="w-9 h-9 rounded-full bg-surface-container-high animate-pulse ml-1" />
          ) : user ? (
            <ProfileDropdown />
          ) : (
            <Link
              href="/login"
              id="topnavbar-signin-btn"
              className="bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all active:scale-95 cursor-pointer shadow-lg shadow-primary/10"
            >
              Sign Up
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
