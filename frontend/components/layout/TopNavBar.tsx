'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useUIStore } from '@/lib/ui-store';
import ProfileDropdown from './ProfileDropdown';
import { Search, Edit3, Bell, Sun, Moon, PanelLeftOpen, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopNavBar() {
  const { user } = useAuth();
  const { toggleSidebar } = useUIStore();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const router = useRouter();
  const [searchVal, setSearchVal] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/feed?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      router.push('/feed');
    }
  };

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
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant/20 bg-background/90 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3 gap-4 max-w-screen-2xl mx-auto">

        {/* Left: Toggle + Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <motion.button
            onClick={toggleSidebar}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all duration-200 cursor-pointer"
            title="Toggle Navigation"
          >
            <PanelLeftOpen className="size-[18px]" />
          </motion.button>

          <Link
            href="/feed"
            id="topnavbar-logo"
            className="flex items-center gap-2 select-none group"
          >
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Sparkles className="size-4 text-on-primary" />
            </div>
            <span className="font-headline-md text-[19px] font-black text-on-surface tracking-tight group-hover:text-primary transition-colors duration-200 hidden sm:block">
              Writen
            </span>
          </Link>
        </div>

        {/* Center: Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-[520px] relative group"
        >
          <div className={`relative flex items-center transition-all duration-300 ${searchFocused ? 'scale-[1.02]' : 'scale-100'}`}>
            <Search
              className={`absolute left-3.5 size-4 pointer-events-none transition-colors duration-200 ${searchFocused ? 'text-primary' : 'text-on-surface-variant/50'}`}
            />
            <input
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-2xl text-sm outline-none placeholder:text-on-surface-variant/40 font-medium text-on-surface focus:bg-surface focus:border-primary/50 focus:ring-4 focus:ring-primary/8 transition-all duration-200"
              placeholder="Search stories, authors..."
              type="text"
            />
            <AnimatePresence>
              {searchVal && (
                <motion.button
                  type="submit"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-2 px-3 py-1 bg-primary text-on-primary text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Go
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </form>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Write Button */}
          {user ? (
            <Link
              href="/write"
              id="topnavbar-write-btn"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:opacity-90 active:scale-95 transition-all duration-200 shadow-sm shadow-primary/20 select-none"
            >
              <Edit3 className="size-3.5" />
              <span className="font-label-caps uppercase tracking-wider">Write</span>
            </Link>
          ) : (
            <Link
              href="/login"
              id="topnavbar-write-anonymous-btn"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs font-bold transition-all duration-200 select-none"
            >
              <Edit3 className="size-3.5" />
              <span className="font-label-caps uppercase tracking-wider">Write</span>
            </Link>
          )}

          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            whileTap={{ scale: 0.85, rotate: 15 }}
            className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all duration-200 cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <Moon className="size-[18px]" />
            ) : (
              <Sun className="size-[18px]" />
            )}
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all duration-200 cursor-pointer relative"
          >
            <Bell className="size-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
          </motion.button>

          {/* Profile / Sign In */}
          {user ? (
            <ProfileDropdown />
          ) : (
            <Link
              href="/login"
              id="topnavbar-signin-btn"
              className="ml-1 px-4 py-2 bg-primary text-on-primary rounded-xl font-label-caps text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm shadow-primary/20"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
