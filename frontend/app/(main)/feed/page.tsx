'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, MoreHorizontal, FileText, ChevronDown, Compass, Loader2, Clock, Eye, X } from 'lucide-react';
import TopNavBar from '@/components/layout/TopNavBar';
import SideNavBar from '@/components/layout/SideNavBar';
import { HeroPostCard } from '@/components/post/HeroPostCard';
import { PostGridCard } from '@/components/post/PostGridCard';
import { FeedCategories } from '@/components/post/FeedCategories';
import RightSidebar from '@/components/layout/RightSidebar';
import { useAuth } from '@/lib/auth-context';
import { ListingSkeleton } from '@/components/ui/skeleton';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://blog-application-fjg9.onrender.com/api';

// ─── Feed Page ─────────────────────────────────────────────────────────────
function FeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const { user, toggleBookmark } = useAuth();

  // Dynamic Tabs & Filter States
  const [categories, setCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('For you');
  const [sortBy, setSortBy] = useState<'latest' | 'views'>('latest');

  // Posts Feed & Pagination States
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Fetch Categories on Mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API}/posts/categories`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Posts on Tab or Initial Load
  const fetchPosts = async (pageNum: number, tabName: string, isAppend = false, activeSort = sortBy) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let url = `${API}/posts?page=${pageNum}&limit=5`;

      // Category filter query check (ignore For you & Following)
      if (tabName !== 'For you' && tabName !== 'Following') {
        url += `&category=${encodeURIComponent(tabName)}`;
      }

      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      if (activeSort === 'views') {
        url += `&sortBy=views`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setPosts(data.data);
        setHasNextPage(data.pagination?.hasNextPage || false);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to query posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Reset page and trigger fetch on tab, search, or sort changes
  useEffect(() => {
    fetchPosts(1, activeTab, false, sortBy);
    setPage(1);
  }, [activeTab, searchQuery, sortBy]);

  const handleNextPage = () => {
    if (!hasNextPage || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, activeTab, false, sortBy);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (page <= 1 || loadingMore) return;
    const prevPage = page - 1;
    setPage(prevPage);
    fetchPosts(prevPage, activeTab, false, sortBy);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Word-count reading estimator (200 words per minute rule)
  const calculateReadingTime = (htmlStr: string) => {
    if (!htmlStr) return 1;
    const text = htmlStr.replace(/<\/?[^>]+(>|$)/g, '');
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes || 1;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getAvatarFallback = (name: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const allTabs = ['For you', 'Following', ...categories];

  // Hero post = first post; grid = remaining
  const [heroPost, ...gridPosts] = posts;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-on-background flex flex-col">
      <TopNavBar />

      {/* pt-16 offsets the fixed navbar */}
      <div className="flex-1 flex w-full pt-16">
        <SideNavBar />

        {/* Main area: lg:col-span-8 + sidebar lg:col-span-4 */}
        <div className="flex-1 max-w-[1200px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">

          {/* ── Left Column: Category Tabs + Feed ─────────────── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Category Tab Bar */}
            <FeedCategories 
              categories={categories}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Search Banner */}
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary/10 border border-primary/20"
              >
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-primary/70">
                    Search Results
                  </span>
                  <p className="text-sm font-semibold text-on-surface mt-0.5">
                    Showing results for{' '}
                    <span className="text-primary">"{searchQuery}"</span>
                  </p>
                </div>
                <button
                  onClick={() => router.push('/feed')}
                  className="px-4 py-1.5 border border-white/10 hover:border-primary/30 text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <X className="size-3" /> Clear
                </button>
              </motion.div>
            )}

            {/* Feed Posts */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <ListingSkeleton count={3} />
                </motion.div>
              ) : posts.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center py-20 px-6 rounded-2xl border border-dashed border-white/10 bg-surface-container-low/20 my-4"
                >
                  <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center mb-5">
                    <FileText className="size-6 text-on-surface-variant" />
                  </div>
                  <h3 className="font-headline-md text-lg text-on-surface font-bold mb-2">
                    No stories found
                  </h3>
                  <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed mb-6">
                    There are no published articles under this category yet. Be the first to share your story!
                  </p>
                  <button
                    onClick={() => router.push('/write')}
                    className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:opacity-90 active:scale-95 transition-all duration-200 shadow-lg shadow-primary/20"
                  >
                    Write a Story
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="posts"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.08 }
                    }
                  }}
                  className="space-y-4"
                >
                  {/* ── Featured / Hero Post (First item) ── */}
                  {heroPost && (
                    <HeroPostCard 
                      post={heroPost as any} 
                      isBookmarked={!!user?.bookmarks?.includes(heroPost._id)}
                      onBookmarkToggle={toggleBookmark}
                    />
                  )}

                  {/* ── Grid of article cards — stitch 2-col grid ── */}
                  {gridPosts.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {gridPosts.map((post) => (
                        <PostGridCard 
                          key={post._id} 
                          post={post as any} 
                          isBookmarked={!!user?.bookmarks?.includes(post._id)}
                          onBookmarkToggle={(id) => {
                            if (user) toggleBookmark(id);
                            else router.push('/login');
                          }}
                          variant="glass"
                        />
                      ))}
                    </div>
                  )}

                  {/* Pagination Controls */}
                  {(hasNextPage || page > 1) && (
                    <div className="pt-8 pb-4 flex justify-between items-center border-t border-white/5 mt-8">
                      <button
                        onClick={handlePrevPage}
                        disabled={page === 1 || loadingMore}
                        className="px-5 py-2.5 border border-white/10 hover:border-primary/30 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:text-primary hover:bg-white/5 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        Previous
                      </button>
                      <span className="text-sm font-mono text-on-surface-variant font-medium">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={handleNextPage}
                        disabled={!hasNextPage || loadingMore}
                        className="px-5 py-2.5 border border-white/10 hover:border-primary/30 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:text-primary hover:bg-white/5 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right Sidebar: lg:col-span-4 ─────────────────── */}
          <div className="lg:col-span-4 self-start lg:sticky lg:top-24 mt-8 lg:mt-0">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9fa] text-on-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary size-8" />
          <p className="font-mono text-xs text-on-surface-variant font-semibold uppercase tracking-widest animate-pulse">
            Loading feed...
          </p>
        </div>
      </div>
    }>
      <FeedContent />
    </Suspense>
  );
}
