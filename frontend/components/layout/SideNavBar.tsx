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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        if (window.innerWidth < 768) {
          setSidebarOpen(false);
        } else {
          setSidebarOpen(true);
        }
      };
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

  const handleLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <nav
        className={`fixed md:sticky top-0 md:top-[57px] left-0 h-full md:h-[calc(100vh-57px)] bg-surface border-r border-outline-variant/20 flex flex-col z-50 md:z-30 shadow-2xl md:shadow-none transition-all duration-300 ease-in-out overflow-hidden ${
          sidebarOpen
            ? 'w-[220px] translate-x-0 opacity-100 pointer-events-auto'
            : 'w-[220px] md:w-0 -translate-x-full md:translate-x-0 md:opacity-0 md:px-0 md:pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full py-4 px-3 w-[220px]">

          {/* Mobile Header */}
          <div className="flex md:hidden items-center justify-between mb-6 px-2 pb-4 border-b border-outline-variant/20">
            <span className="text-base font-bold text-on-surface">Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer"
            >
              <X className="size-4.5" />
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
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group overflow-hidden select-none ${
                    isActive
                      ? 'text-primary bg-primary/8 font-bold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/60'
                  }`}
                >
                  {/* Active pill indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBackground"
                      className="absolute inset-0 bg-primary/8 rounded-xl -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-on-surface-variant group-hover:text-on-surface group-hover:bg-surface-container'
                  }`}>
                    <item.icon className="size-[17px]" />
                  </div>

                  <span className="text-sm font-semibold tracking-wide">{item.name}</span>

                  {/* Active dot */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom: Write CTA */}
          {user && (
            <div className="mt-auto pt-4 border-t border-outline-variant/20 px-1">
              <Link
                href="/write"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/15 transition-all duration-200 group select-none"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                  <PenLine className="size-[16px]" />
                </div>
                <span className="text-sm font-bold">New Story</span>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
