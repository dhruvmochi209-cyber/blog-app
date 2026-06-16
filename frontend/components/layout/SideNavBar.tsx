'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/ui-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Compass, Bookmark, X, PenLine } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function SideNavBar() {
  const pathname = usePathname();
  const { user } = useAuth();
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
    { name: 'Home', icon: Home, href: '/feed' },
    { name: 'Explore', icon: Compass, href: '/explore' },
    { name: 'Bookmarks', icon: Bookmark, href: '/bookmarks' },
  ];

  // Close mobile drawer on navigation click
  const handleLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* Responsive Navigation Sidebar/Drawer */}
      <nav
        className={`fixed md:sticky top-0 md:top-16 left-0 h-full md:h-[calc(100vh-64px)] border-r border-outline-variant/30 py-6 bg-surface/40 backdrop-blur-2xl transition-all duration-300 ease-in-out overflow-hidden flex flex-col z-50 md:z-30 shadow-2xl md:shadow-none ${
          sidebarOpen
            ? 'w-[260px] translate-x-0 opacity-100 pointer-events-auto'
            : 'w-[260px] md:w-0 -translate-x-full md:translate-x-0 md:border-r-0 md:opacity-0 md:px-0 md:pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full px-4 w-[260px]">

          {/* Mobile Drawer Header */}
          <div className="flex md:hidden items-center justify-between mb-8 px-2 pb-4 border-b border-outline-variant/30">
            <span className="font-headline-md text-lg font-black text-on-surface tracking-tight">Navigation</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-all cursor-pointer bg-surface-container-low border border-outline-variant/50 shadow-sm"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col gap-3 flex-1 pt-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  id={`sidenav-${item.name.toLowerCase()}`}
                  className={`relative flex items-center gap-4 px-5 py-4 rounded-[20px] transition-all duration-300 group select-none overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 translate-x-2'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:translate-x-1 border border-transparent hover:border-outline-variant/50 hover:shadow-sm'
                  }`}
                >
                  <item.icon className={`size-[22px] transition-transform duration-300 ${isActive ? 'scale-110 text-white' : 'group-hover:scale-110 group-hover:text-primary'}`} />
                  <span className={`font-body-md text-[15px] tracking-wide ${isActive ? 'font-black' : 'font-semibold'}`}>{item.name}</span>
                  
                  {/* Decorative glowing dot for active state */}
                  {isActive && (
                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.6)] animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom: Write CTA for logged-in users */}
          {user && (
            <div className="mt-auto pt-6 border-t border-outline-variant/30 mb-2">
              <Link
                href="/write"
                onClick={handleLinkClick}
                className="flex items-center justify-center gap-3 px-4 py-4 rounded-[20px] bg-surface-container-lowest border border-outline-variant/50 text-on-surface hover:border-primary/50 hover:shadow-[0_0_20px_rgba(79,70,229,0.15)] transition-all duration-300 group select-none relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <PenLine className="size-[18px] text-primary group-hover:scale-110 transition-transform duration-300 relative z-10" />
                <span className="font-label-caps text-xs uppercase tracking-widest font-black relative z-10">Write a Story</span>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
