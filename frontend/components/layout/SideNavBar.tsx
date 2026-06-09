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
        className={`fixed md:sticky top-0 md:top-16 left-0 h-full md:h-[calc(100vh-64px)] border-r border-white/5 py-6 bg-surface transition-all duration-300 ease-in-out overflow-hidden flex flex-col z-50 md:z-30 shadow-2xl md:shadow-none ${
          sidebarOpen
            ? 'w-[220px] translate-x-0 opacity-100 pointer-events-auto'
            : 'w-[220px] md:w-0 -translate-x-full md:translate-x-0 md:border-r-0 md:opacity-0 md:px-0 md:pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full px-3 w-[220px]">

          {/* Mobile Drawer Header */}
          <div className="flex md:hidden items-center justify-between mb-6 px-2 pb-4 border-b border-white/5">
            <span className="font-headline-md text-base font-bold text-on-surface">Navigation</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-all cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col gap-1 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  id={`sidenav-${item.name.toLowerCase()}`}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group select-none ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                  }`}
                >
                  {/* Active background glow */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBackground"
                      className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  <item.icon className={`size-[18px] transition-colors duration-200 ${isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}`} />
                  <span className="font-body-md text-sm">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Bottom: Write CTA for logged-in users */}
          {user && (
            <div className="mt-auto pt-4 border-t border-white/5">
              <Link
                href="/write"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 group select-none"
              >
                <PenLine className="size-[17px]" />
                <span className="font-body-md text-sm font-semibold">New Story</span>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
