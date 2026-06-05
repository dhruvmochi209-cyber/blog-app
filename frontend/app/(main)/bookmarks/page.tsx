'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Compass, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import TopNavBar from '@/components/layout/TopNavBar';
import SideNavBar from '@/components/layout/SideNavBar';
import { useAuth } from '@/lib/auth-context';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

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
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchBookmarks();
      }
    }
  }, [user, authLoading, router, fetchBookmarks]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative font-body-md transition-colors duration-300">
      <TopNavBar />

      <div className="flex-1 flex w-full">
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
                      <motion.article
                        key={post._id}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } }
                        }}
                        onClick={() => router.push(`/feed/${post.slug}`)}
                        className="bg-surface border border-outline-variant/30 hover:border-outline-variant/60 rounded-2xl overflow-hidden flex flex-col group cursor-pointer shadow-xs hover:shadow-md transition-all duration-300"
                      >
                        {/* Cover Image */}
                        <div className="h-48 bg-surface-container-low overflow-hidden relative">
                          {post.coverImage ? (
                            <img 
                              src={post.coverImage} 
                              alt={post.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/40 group-hover:scale-105 transition-transform duration-500">
                              <ImageIcon className="size-10 mb-2 opacity-50" />
                              <span className="font-label-caps text-[10px] uppercase tracking-widest font-bold">No Cover</span>
                            </div>
                          )}
                          {/* Category Badge overlay */}
                          {post.category && (
                            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md text-on-surface font-label-caps text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-md shadow-sm">
                              {post.category}
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="p-5 flex-1 flex flex-col">
                          {/* Author Info */}
                          <Link href={`/profile/${author._id || ''}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 mb-3 group/author w-fit">
                            {author.avatar ? (
                              <img src={author.avatar} alt={author.name} className="w-6 h-6 rounded-full object-cover shadow-xs group-hover/author:border-primary border border-transparent transition-colors" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-[10px] group-hover/author:opacity-80 transition-opacity">
                                {author.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                            )}
                            <span className="text-xs font-semibold text-on-surface-variant truncate group-hover/author:text-primary transition-colors">{author.name || 'Unknown'}</span>
                          </Link>

                          {/* Title & Excerpt */}
                          <h2 className="font-headline-md text-[17px] font-bold text-on-surface leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h2>
                          <p className="font-body-md text-sm text-on-surface-variant line-clamp-2 mb-4 flex-1 font-light">
                            {post.excerpt}
                          </p>

                          {/* Footer details */}
                          <div className="flex items-center justify-between text-[11px] font-label-caps font-bold tracking-widest uppercase text-on-surface-variant mt-auto pt-4 border-t border-outline-variant/20">
                            <span>{formatDate(post.createdAt)}</span>
                            <div className="flex items-center gap-3">
                              <span>{readTime} MIN READ</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (user) toggleBookmark(post._id);
                                }}
                                className="p-1 text-primary hover:bg-surface-container rounded-full transition-all duration-200 cursor-pointer bg-transparent border-0 flex items-center justify-center -mr-1"
                              >
                                <Bookmark className="size-4" fill="currentColor" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

          </main>
        </div>
      </div>
    </div>
  );
}
