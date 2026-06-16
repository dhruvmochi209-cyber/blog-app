'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Compass, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import TopNavBar from '@/components/layout/TopNavBar';
import SideNavBar from '@/components/layout/SideNavBar';
import { PostGridCard } from '@/components/post/PostGridCard';
import RightSidebar from '@/components/layout/RightSidebar';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://blog-application-fjg9.onrender.com/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calculateReadingTime(htmlContent: string = '') {
  const text = htmlContent.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Post Grid Card Skeleton ──────────────────────────────────────────────────
function GridCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden flex flex-col animate-pulse">
      <div className="h-40 bg-outline-variant/20 w-full" />
      <div className="p-5 flex-1 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-outline-variant/30" />
          <div className="w-20 h-3 bg-outline-variant/20 rounded" />
        </div>
        <div className="space-y-2">
          <div className="w-11/12 h-5 bg-outline-variant/30 rounded" />
          <div className="w-4/5 h-5 bg-outline-variant/30 rounded" />
        </div>
        <div className="w-full h-3 bg-outline-variant/20 rounded" />
        <div className="w-2/3 h-3 bg-outline-variant/20 rounded" />
      </div>
    </div>
  );
}

export default function BookmarksPage() {
  const router = useRouter();
  const { user, accessToken, toggleBookmark, loading: authLoading } = useAuth();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API}/users/bookmarks`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: 'include'
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setPosts(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch bookmarked posts:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchBookmarks();
    }
  }, [user, authLoading, fetchBookmarks]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground flex flex-col relative font-body-md transition-colors duration-300">
        <TopNavBar />

      <div className="flex-1 flex w-full pt-16">
        <SideNavBar />

        <div className="flex-1 flex justify-center px-4 py-8 md:px-8">
          <main className="flex-1 max-w-[1100px] w-full min-h-[calc(100vh-61px)] flex flex-col">
            
            {/* Header Area */}
            <div className="mb-10 space-y-8">
              <div className="flex items-center gap-3 text-on-surface">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Bookmark className="size-8 text-primary" fill="currentColor" />
                </div>
                <div>
                  <h1 className="font-display-xl text-3xl font-black tracking-tight">Bookmarks</h1>
                  <p className="text-sm font-label-caps text-on-surface-variant tracking-wider uppercase mt-1">Your saved stories</p>
                </div>
              </div>
            </div>

            {/* Posts Grid */}
            <AnimatePresence mode="wait">
              {loading || authLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <GridCardSkeleton />
                  <GridCardSkeleton />
                  <GridCardSkeleton />
                </motion.div>
              ) : posts.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                    <Bookmark className="size-8" />
                  </div>
                  <h3 className="font-headline-md text-xl font-bold text-on-surface">No saved stories</h3>
                  <p className="text-on-surface-variant text-sm max-w-md">
                    You haven't bookmarked any articles yet. Discover some amazing stories on the Explore page!
                  </p>
                  <button 
                    onClick={() => router.push('/explore')}
                    className="mt-4 px-6 py-2.5 bg-primary text-on-primary rounded-full font-label-caps font-bold tracking-widest text-xs uppercase hover:opacity-90 transition-opacity"
                  >
                    Explore Now
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20"
                >
                  {posts.map(post => {
                    const author = post.authorId || {};
                    const readTime = calculateReadingTime(post.htmlContent);
                    
                    // Allow optimistic UI to hide removed bookmarks instantly
                    if (!user?.bookmarks?.includes(post._id)) return null;

                    return (
                      <PostGridCard
                        key={post._id}
                        post={post as any}
                        isBookmarked={!!user?.bookmarks?.includes(post._id)}
                        onBookmarkToggle={(id) => {
                          if (user) toggleBookmark(id);
                        }}
                        variant="solid"
                      />
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

          </main>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
