import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Cloud,
  WifiOff,
  AlertTriangle,
  MoreHorizontal,
  Home,
  Save,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import ProfileDropdown from '@/components/layout/ProfileDropdown';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useRef, useState } from 'react';

export function WriteTopBar({
  syncStatus,
  publishing,
  showManualSavedTick,
  postId,
  handlePublish,
  handleSaveDraft,
  setShowDeleteModal,
}: any) {
  const { user } = useAuth();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close more menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMoreMenu]);

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-outline-variant/30 px-6 py-3.5 flex justify-between items-center shadow-xs">
      <div className="flex items-center gap-4">
        <Link href="/feed" className="font-headline-md text-xl font-bold text-on-surface tracking-tight hover:opacity-85 transition-opacity">
          DevLog
        </Link>

        {/* Dynamic Sync Status Indicator */}
        <div className="h-6 flex items-center">
          {syncStatus === 'idle' && (
            <span className="font-label-caps text-[10px] text-on-surface-variant/80 px-2.5 py-0.5 bg-surface-container border border-outline-variant/20 rounded-md select-none font-bold uppercase tracking-wider">
              Draft
            </span>
          )}
          {syncStatus === 'saving' && (
            <span className="font-label-caps text-[10px] text-on-surface-variant/80 px-2.5 py-0.5 bg-surface-container border border-outline-variant/20 rounded-md select-none font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <Loader2 className="animate-spin size-3 text-primary" />
              Saving...
            </span>
          )}
          {syncStatus === 'saved' && (
            <span className="font-label-caps text-[10px] text-primary bg-primary/5 px-2.5 py-0.5 rounded-md border border-primary/25 select-none flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <Cloud className="size-3" />
              Saved to cloud
            </span>
          )}
          {syncStatus === 'offline_saved' && (
            <span className="font-label-caps text-[10px] text-amber-600 bg-amber-500/5 px-2.5 py-0.5 rounded-md border border-amber-500/20 select-none flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <WifiOff className="size-3" />
              Saved locally
            </span>
          )}
          {syncStatus === 'error' && (
            <span className="font-label-caps text-[10px] text-error bg-error/5 px-2.5 py-0.5 rounded-md border border-error/20 select-none flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <AlertTriangle className="size-3" />
              Save failed
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handlePublish}
          disabled={publishing}
          id="write-publish-btn"
          className="bg-primary text-on-primary font-label-caps text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full hover:opacity-90 active:scale-95 disabled:opacity-60 flex items-center gap-2 shadow-xs transition-all duration-200 cursor-pointer"
        >
          {publishing && <Loader2 className="animate-spin size-3.5" />}
          Publish
        </button>

        {/* More Actions Dropdown Menu */}
        <div className="relative" ref={moreMenuRef}>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            id="write-more-menu-btn"
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center border border-outline-variant/30"
            title="More Actions"
          >
            <MoreHorizontal className="size-4" />
          </button>

          <AnimatePresence>
            {showMoreMenu && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-48 bg-surface border border-outline-variant/40 rounded-xl shadow-md py-2 z-50 overflow-hidden"
              >
                <Link
                  href="/feed"
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer"
                >
                  <Home className="size-4 text-secondary" />
                  Feed Home
                </Link>

                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    handleSaveDraft();
                  }}
                  disabled={syncStatus === 'saving' || publishing}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer w-full text-left disabled:opacity-60 focus:outline-none"
                >
                  {syncStatus === 'saving' ? (
                    <Loader2 className="animate-spin size-4 text-secondary" />
                  ) : showManualSavedTick ? (
                    <CheckCircle2 className="size-4 text-primary" />
                  ) : (
                    <Save className="size-4 text-secondary" />
                  )}
                  <span>
                    {syncStatus === 'saving'
                      ? 'Saving...'
                      : showManualSavedTick
                        ? 'Saved!'
                        : 'Save Draft'}
                  </span>
                </button>

                {postId && (
                  <div className="border-t border-outline-variant/20 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        setShowDeleteModal(true);
                      }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-error hover:bg-error-container/10 hover:text-error transition-colors cursor-pointer w-full text-left focus:outline-none"
                    >
                      <Trash2 className="size-4 text-error" />
                      <span>Delete Post</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {user && <ProfileDropdown />}
      </div>
    </header>
  );
}
