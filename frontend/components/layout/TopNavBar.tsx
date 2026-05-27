'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useUIStore } from '@/lib/ui-store';

export default function TopNavBar() {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useUIStore();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

  const handleLogout = async () => {
    setShowMenu(false);
    await logout();
    router.push('/');
  };

  return (
    <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/30 flex justify-between items-center px-4 md:px-6 py-2 w-full">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 -ml-1 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors flex items-center justify-center cursor-pointer active:scale-95"
          title="Toggle Navigation Menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        <Link href="/feed" className="font-headline-lg text-xl font-bold text-on-surface select-none hover:opacity-90">
          Writen
        </Link>
        <div className="relative flex items-center self-center">
          <span className="material-symbols-outlined absolute left-2.5 text-secondary text-[18px] md:text-[20px] select-none pointer-events-none">search</span>
          <input 
            className="pl-8 md:pl-10 pr-3 md:pr-4 py-1.5 md:py-2 bg-surface-container-low border-none rounded-full text-body-md w-28 xs:w-36 sm:w-48 md:w-56 focus:ring-2 focus:ring-primary/20 transition-all text-xs md:text-sm outline-none placeholder:text-outline-variant/50" 
            placeholder="Search..." 
            type="text" 
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Write Button */}
        {user ? (
          <Link href="/write" className="hidden md:flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors px-3 py-2">
            <span className="material-symbols-outlined text-[20px]">edit_square</span>
            <span className="font-label-caps text-sm">Write</span>
          </Link>
        ) : (
          <Link href="/login" className="hidden md:flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors px-3 py-2">
            <span className="font-label-caps text-sm">Write</span>
          </Link>
        )}

        <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        
        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden border border-outline-variant/30 ml-1 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-label-caps text-on-surface text-xs">{user.name.charAt(0).toUpperCase()}</span>
              )}
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-11 w-56 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="px-4 py-3 border-b border-outline-variant/20">
                  <p className="font-body-md text-sm font-semibold text-on-surface truncate">{user.name}</p>
                  <p className="font-body-md text-xs text-on-surface-variant truncate">{user.email}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Profile
                </Link>
                <Link
                  href="/bookmarks"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">bookmarks</span>
                  Bookmarks
                </Link>
                <div className="border-t border-outline-variant/20 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-container/30 transition-colors w-full text-left"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="ml-1 px-4 py-2 bg-primary-container text-on-primary-container rounded-full font-label-caps text-sm hover:bg-primary transition-colors">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
