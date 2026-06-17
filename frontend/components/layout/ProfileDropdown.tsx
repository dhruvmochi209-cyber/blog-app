'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LayoutDashboard, User, Bookmark, LogOut } from 'lucide-react';

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
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

  if (!user) return null;

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`w-10 h-10 rounded-full bg-[#f3f4f6] flex items-center justify-center overflow-hidden border-2 cursor-pointer hover:shadow-md transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/20 active:scale-95 ml-2 ${showMenu ? 'border-indigo-500 shadow-sm' : 'border-transparent'}`}
        aria-label="User Profile Dropdown"
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random`; }} />
        ) : (
          <span className="font-label-caps text-gray-600 text-sm font-bold">
            {user.name.charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute right-0 top-14 w-64 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-[0_12px_40px_rgb(0,0,0,0.08)] py-3 animate-in fade-in zoom-in-95 duration-200 z-50 origin-top-right">
          <div className="px-5 py-3 border-b border-gray-100 mb-2">
            <p className="font-headline-md text-base font-black text-gray-900 truncate tracking-tight">{user.name}</p>
            <p className="font-body-md text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          
          <div className="px-2 space-y-1">
            {user.role === 'CREATOR' && (
              <Link
                href="/dashboard"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-[#f3f4f6] hover:text-indigo-600 transition-all cursor-pointer group"
              >
                <LayoutDashboard className="size-[18px] text-gray-400 group-hover:text-indigo-500 transition-colors" />
                <span>Dashboard</span>
              </Link>
            )}
            <Link
              href="/profile"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-[#f3f4f6] hover:text-indigo-600 transition-all cursor-pointer group"
            >
              <User className="size-[18px] text-gray-400 group-hover:text-indigo-500 transition-colors" />
              <span>Profile</span>
            </Link>
            <Link
              href="/bookmarks"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-[#f3f4f6] hover:text-indigo-600 transition-all cursor-pointer group"
            >
              <Bookmark className="size-[18px] text-gray-400 group-hover:text-indigo-500 transition-colors" />
              <span>Bookmarks</span>
            </Link>
          </div>

          <div className="border-t border-gray-100 mt-2 pt-2 px-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all w-full text-left font-bold cursor-pointer group"
            >
              <LogOut className="size-[18px] text-red-400 group-hover:text-red-600 transition-colors" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
