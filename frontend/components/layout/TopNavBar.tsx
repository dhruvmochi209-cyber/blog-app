'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useUIStore } from '@/lib/ui-store';
import ProfileDropdown from './ProfileDropdown';
import { Search, Edit3, Bell, Sun, Moon } from 'lucide-react';

export default function TopNavBar() {
  const { user } = useAuth();
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
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-white/5 shadow-sm">
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
            className="font-headline-md text-xl font-bold text-primary tracking-tight select-none"
          >
            DevLog
          </Link>


        </div>

        {/* Right: Search + Actions */}
        <div className="flex items-center gap-3">
          {/* Search trigger */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg border border-white/5 text-on-surface-variant hover:bg-surface-variant/50 transition-all">
            <Search className="size-5 shrink-0" />
            <input
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="bg-transparent border-none text-sm w-36 focus:outline-none text-on-surface placeholder:text-on-surface-variant/50"
              placeholder="Search articles..."
              type="text"
            />
            <kbd className="font-mono text-xs bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant">⌘K</kbd>
          </form>

          {/* Mobile search icon */}
          <button className="md:hidden p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            <Search className="size-5" />
          </button>

          <div className="h-6 w-px bg-white/10 hidden md:block" />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-on-surface-variant hover:text-primary rounded-full transition-all duration-200 cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
          </button>

          {/* Notifications */}
          <button className="p-2 text-on-surface-variant hover:text-primary rounded-full transition-all duration-200 cursor-pointer">
            <Bell className="size-[18px]" />
          </button>

          {/* Write Button */}
          {user ? (
            <Link
              href="/write"
              id="topnavbar-write-btn"
              className="hidden sm:flex items-center gap-2 font-body-md text-sm text-on-surface-variant hover:text-primary transition-colors active:scale-95"
            >
              <Edit3 className="size-4" />
              Write
            </Link>
          ) : (
            <Link
              href="/login"
              id="topnavbar-write-anonymous-btn"
              className="hidden sm:flex items-center gap-2 font-body-md text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              <Edit3 className="size-4" />
              Write
            </Link>
          )}

          {/* Sign In / Profile */}
          {user ? (
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
