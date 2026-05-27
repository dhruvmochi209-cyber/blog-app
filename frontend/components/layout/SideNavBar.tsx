'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useUIStore } from '@/lib/ui-store';

export default function SideNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  // Screen size detection: default to closed on mobile and open on desktop
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        if (window.innerWidth < 768) {
          setSidebarOpen(false);
        } else {
          setSidebarOpen(true);
        }
      };

      // Set initial size
      handleResize();

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [setSidebarOpen]);

  const navItems = [
    { name: 'Home', icon: 'home', href: '/feed' },
    { name: 'Explore', icon: 'explore', href: '/explore' },
    { name: 'Bookmarks', icon: 'bookmarks', href: '/bookmarks' },
  ];

  // Close mobile drawer on navigation click
  const handleLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    await logout();
    router.push('/');
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-all duration-300 cursor-pointer"
        />
      )}

      {/* Responsive Navigation Sidebar/Drawer */}
      <nav
        className={`fixed md:sticky top-0 md:top-[57px] left-0 h-full md:h-[calc(100vh-57px)] border-r border-outline-variant/30 py-6 md:py-4 px-4 md:px-3 bg-surface transition-all duration-300 ease-in-out overflow-hidden flex flex-col justify-between z-50 md:z-30 shadow-2xl md:shadow-none ${
          sidebarOpen
            ? 'w-[240px] md:w-[220px] translate-x-0 opacity-100 pointer-events-auto'
            : 'w-[240px] md:w-0 -translate-x-full md:translate-x-0 md:border-r-0 md:opacity-0 md:px-0 md:pointer-events-none'
        }`}
      >
        {/* Navigation list */}
        <div>
          {/* Mobile Drawer Header */}
          <div className="flex md:hidden items-center justify-between mb-6 pb-4 border-b border-outline-variant/20">
            <span className="font-headline-lg text-lg font-bold text-on-surface">Menu</span>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-surface-container text-on-surface font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-low/60 hover:text-on-surface'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span className="font-body-md text-sm">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Profile / Sign out Section */}
        {user && (
          <div className="border-t border-outline-variant/20 pt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant/30 shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-label-caps text-on-surface text-sm">{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-body-md text-sm font-bold text-on-surface truncate">{user.name}</p>
                <p className="font-body-md text-xs text-on-surface-variant truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-error hover:bg-error-container/20 rounded-xl transition-all w-full text-left font-medium active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span>Sign out</span>
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
