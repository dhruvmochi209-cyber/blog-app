'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark, FileText, ChevronRight, Loader2,
  Clock, Eye, ArrowRight, Flame, Zap, X
} from 'lucide-react';
import TopNavBar from '@/components/layout/TopNavBar';
import SideNavBar from '@/components/layout/SideNavBar';
import RightSidebar from '@/components/layout/RightSidebar';
import { useAuth } from '@/lib/auth-context';
import { ListingSkeleton } from '@/components/ui/skeleton';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// ─── Feed Page ──────────────────────────────────────────────────────────────
function FeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const { user, toggleBookmark } = useAuth();

  const [categories, setCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('For you');
  const [sortBy, setSortBy] = useState<'latest' | 'views'>('latest');

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Fetch Categories
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

  const fetchPosts = async (pageNum: number, tabName: string, isAppend = false, activeSort = sortBy) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      let url = `${API}/posts?page=${pageNum}&limit=10`;
      if (tabName !== 'For you' && tabName !== 'Following') {
        url += `&category=${encodeURIComponent(tabName)}`;
      }
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        if (isAppend) {
          setPosts((prev) => [...prev, ...data.data]);
        } else {
          setPosts(data.data);
        }
        setHasNextPage(data.pagination?.hasNextPage || false);
      }
    } catch (err) {
      console.error('Failed to query posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, activeTab, false, sortBy);
    setPage(1);
  }, [activeTab, searchQuery, sortBy]);

  const handleLoadMore = () => {
    if (!hasNextPage || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, activeTab, true, sortBy);
  };

  const calculateReadingTime = (htmlStr: string) => {
    if (!htmlStr) return 1;
    const text = htmlStr.replace(/<\/?[^>]+(>|$)/g, '');
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / 200) || 1;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getAvatarFallback = (name: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const allTabs = ['For you', 'Following', ...categories];

  // First post = hero, rest = list
  const [heroPost, ...remainingPosts] = posts;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      <TopNavBar />

      <div className="flex-1 flex w-full max-w-screen-2xl mx-auto">
        <SideNavBar />

        {/* Main Content Area */}
        <div className="flex-1 flex min-w-0">
          <main className="flex-1 min-w-0 border-r border-outline-variant/20">

            {/* ── Tab Bar ─────────────────────────────────────── */}
            <div className="sticky top-[57px] z-40 bg-background/95 backdrop-blur-md border-b border-outline-variant/20">
              <div className="flex items-center justify-between px-6 pt-4">
                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto no-scrollbar pb-4">
                  {allTabs.map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        id={`feed-tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
                        className={`relative whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer font-label-caps select-none ${
                          isActive
                            ? 'bg-primary text-on-primary shadow-sm shadow-primary/25'
                            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>

                {/* Sort Selector */}
                <div className="pb-4 shrink-0 ml-4 flex items-center gap-2">
                  {/* Flame icon for trending */}
                  <button
                    onClick={() => setSortBy(sortBy === 'latest' ? 'views' : 'latest')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-200 cursor-pointer font-label-caps uppercase tracking-wider select-none ${
                      sortBy === 'views'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        : 'border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    {sortBy === 'views' ? <Flame className="size-3.5" /> : <Zap className="size-3.5" />}
                    {sortBy === 'views' ? 'Popular' : 'Latest'}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Content ─────────────────────────────────────── */}
            <div className="px-6 py-6 max-w-[740px]">

              {/* Search Banner */}
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between mb-6 px-4 py-3 rounded-2xl bg-primary/8 border border-primary/20"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/70 font-label-caps">
                      Search Results
                    </span>
                    <p className="text-sm font-bold text-on-surface mt-0.5">
                      Showing results for{' '}
                      <span className="text-primary">"{searchQuery}"</span>
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/feed')}
                    className="p-1.5 rounded-full hover:bg-primary/15 text-primary transition-colors cursor-pointer"
                  >
                    <X className="size-4" />
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
                    <ListingSkeleton count={4} />
                  </motion.div>
                ) : posts.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center py-20 px-6 rounded-3xl border border-dashed border-outline-variant/50 bg-surface-container-low/20 my-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mb-5 shadow-sm">
                      <FileText className="size-6 text-on-surface-variant" />
                    </div>
                    <h3 className="text-lg font-black text-on-surface mb-2 font-headline-md">
                      No stories found
                    </h3>
                    <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed mb-6">
                      There are no published articles under this category yet. Be the first to share your story!
                    </p>
                    <button
                      onClick={() => router.push('/write')}
                      className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-label-caps text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all duration-200 shadow-sm shadow-primary/20"
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
                      show: { opacity: 1, transition: { staggerChildren: 0.06 } }
                    }}
                  >
                    {/* ── Hero Post Card (first post) ── */}
                    {heroPost && (
                      <motion.article
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }
                        }}
                        onClick={() => router.push(`/feed/${heroPost.slug}`)}
                        className="group cursor-pointer mb-8 rounded-2xl overflow-hidden border border-outline-variant/25 hover:border-outline-variant/50 bg-surface hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
                      >
                        {/* Cover Image */}
                        {heroPost.coverImage && (
                          <div className="w-full h-48 sm:h-56 overflow-hidden bg-surface-container-low relative">
                            <img
                              src={heroPost.coverImage}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              alt="Article Cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-surface/60 via-transparent to-transparent" />
                            {heroPost.category && (
                              <span className="absolute bottom-3 left-4 px-3 py-1 bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest rounded-full font-label-caps shadow-sm">
                                {heroPost.category}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="p-5">
                          {/* Author row */}
                          <div className="flex items-center gap-2 mb-3">
                            <Link href={`/profile/${heroPost.authorId?._id || ''}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 group/author">
                              {heroPost.authorId?.avatar ? (
                                <img src={heroPost.authorId.avatar} className="w-6 h-6 rounded-full object-cover border border-outline-variant/30" alt={heroPost.authorId.name} />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                                  {getAvatarFallback(heroPost.authorId?.name)}
                                </div>
                              )}
                              <span className="text-xs font-semibold text-on-surface group-hover/author:text-primary transition-colors">
                                {heroPost.authorId?.name || 'Anonymous'}
                              </span>
                            </Link>
                            <span className="text-on-surface-variant/30 text-xs">·</span>
                            <span className="text-xs text-on-surface-variant">{formatDate(heroPost.createdAt)}</span>
                          </div>

                          <h2 className="font-headline-md text-xl font-black text-on-surface mb-2 group-hover:text-primary transition-colors duration-200 leading-snug line-clamp-2">
                            {heroPost.title}
                          </h2>
                          <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed mb-4 font-light">
                            {heroPost.excerpt || 'No description provided.'}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-on-surface-variant/70">
                              <span className="flex items-center gap-1">
                                <Clock className="size-3.5" />
                                {calculateReadingTime(heroPost.htmlContent)} min read
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (user) toggleBookmark(heroPost._id);
                                  else router.push('/login');
                                }}
                                className={`p-2 rounded-xl hover:bg-surface-container transition-all duration-200 cursor-pointer ${
                                  user?.bookmarks?.includes(heroPost._id) ? 'text-primary' : 'text-on-surface-variant/60 hover:text-primary'
                                }`}
                              >
                                <Bookmark className="size-4" fill={user?.bookmarks?.includes(heroPost._id) ? 'currentColor' : 'none'} />
                              </button>
                              <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                                Read more <ArrowRight className="size-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    )}

                    {/* ── Section Header ── */}
                    {remainingPosts.length > 0 && (
                      <div className="flex items-center gap-3 mb-5">
                        <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60 font-label-caps">
                          More Stories
                        </h2>
                        <div className="flex-1 h-px bg-outline-variant/25" />
                      </div>
                    )}

                    {/* ── Remaining Posts ── */}
                    <div className="space-y-0 divide-y divide-outline-variant/15">
                      {remainingPosts.map((post) => {
                        const author = post.authorId || {};
                        const readTime = calculateReadingTime(post.htmlContent);
                        const isBookmarked = user?.bookmarks?.includes(post._id);

                        return (
                          <motion.article
                            key={post._id}
                            variants={{
                              hidden: { opacity: 0, y: 12 },
                              show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } }
                            }}
                            onClick={() => router.push(`/feed/${post.slug}`)}
                            className="group cursor-pointer py-5 hover:bg-surface-container-low/30 px-3 -mx-3 rounded-2xl transition-all duration-200"
                          >
                            <div className="flex gap-4">
                              {/* Text content */}
                              <div className="flex-1 min-w-0">
                                {/* Author row */}
                                <div className="flex items-center gap-2 mb-2">
                                  <Link href={`/profile/${author._id || ''}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 group/author">
                                    {author.avatar ? (
                                      <img src={author.avatar} className="w-5 h-5 rounded-full object-cover border border-outline-variant/30 group-hover/author:border-primary transition-colors" alt={author.name} />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] border border-primary/20">
                                        {getAvatarFallback(author.name)}
                                      </div>
                                    )}
                                    <span className="text-[11px] font-semibold text-on-surface-variant group-hover/author:text-primary transition-colors">
                                      {author.name || 'Anonymous'}
                                    </span>
                                  </Link>
                                  <span className="text-on-surface-variant/30 text-xs">·</span>
                                  <span className="text-[11px] text-on-surface-variant/70">{formatDate(post.createdAt)}</span>
                                </div>

                                <h3 className="font-headline-md text-base font-bold text-on-surface mb-1.5 group-hover:text-primary transition-colors duration-200 leading-snug line-clamp-2">
                                  {post.title}
                                </h3>
                                <p className="text-[13px] text-on-surface-variant line-clamp-2 leading-relaxed font-light mb-3">
                                  {post.excerpt || 'No description provided.'}
                                </p>

                                {/* Meta row */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    {post.category && (
                                      <span className="px-2.5 py-0.5 bg-surface-container text-on-surface-variant rounded-full text-[10px] font-black uppercase tracking-wider border border-outline-variant/25 font-label-caps">
                                        {post.category}
                                      </span>
                                    )}
                                    <span className="text-[11px] text-on-surface-variant/60 flex items-center gap-1">
                                      <Clock className="size-3" />
                                      {readTime} min
                                    </span>
                                  </div>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (user) toggleBookmark(post._id);
                                      else router.push('/login');
                                    }}
                                    className={`p-1.5 rounded-xl hover:bg-surface-container transition-all duration-200 cursor-pointer ${
                                      isBookmarked ? 'text-primary' : 'text-on-surface-variant/50 hover:text-primary'
                                    }`}
                                  >
                                    <Bookmark className="size-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
                                  </button>
                                </div>
                              </div>

                              {/* Thumbnail */}
                              {post.coverImage && (
                                <div className="w-[90px] h-[70px] sm:w-[110px] sm:h-[80px] hidden sm:block overflow-hidden rounded-xl border border-outline-variant/25 shrink-0 bg-surface-container-low">
                                  <img
                                    src={post.coverImage}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    alt="Article Cover"
                                  />
                                </div>
                              )}
                            </div>
                          </motion.article>
                        );
                      })}
                    </div>

                    {/* Load More */}
                    {hasNextPage && (
                      <div className="pt-8 pb-6 flex justify-center">
                        <button
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                          className="group flex items-center gap-2 px-6 py-3 rounded-2xl border border-outline-variant/40 hover:border-primary/40 hover:bg-primary/5 text-on-surface-variant hover:text-primary text-xs font-bold uppercase tracking-wider font-label-caps transition-all duration-200 disabled:opacity-50 select-none cursor-pointer active:scale-95"
                        >
                          {loadingMore ? (
                            <>
                              <Loader2 className="size-3.5 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              Load more stories
                              <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>

          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary size-5" />
            </div>
            <p className="font-label-caps text-[11px] text-on-surface-variant font-bold uppercase tracking-widest animate-pulse">
              Loading your feed...
            </p>
          </div>
        </div>
      }
    >
      <FeedContent />
    </Suspense>
  );
}
