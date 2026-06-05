'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, X, Image as ImageIcon, Bookmark } from 'lucide-react';
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

export default function ExplorePage() {
  const router = useRouter();
  const { user, toggleBookmark } = useAuth();

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Posts
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API}/posts?limit=24`;
      
      if (selectedCategory) {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (debouncedSearch.trim()) {
        url += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setPosts(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch explore posts:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, debouncedSearch]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative font-body-md transition-colors duration-300">
      <TopNavBar />

      <div className="flex-1 flex w-full">
        <SideNavBar />

        <div className="flex-1 flex justify-center px-4 py-8 md:px-8">
          <main className="flex-1 max-w-[1100px] w-full min-h-[calc(100vh-61px)] flex flex-col">
            
            {/* Header & Search Area */}
            <div className="mb-10 space-y-8">
              <div className="flex items-center gap-3 text-on-surface">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Compass className="size-8 text-primary" />
                </div>
                <div>
                  <h1 className="font-display-xl text-3xl font-black tracking-tight">Explore</h1>
                  <p className="text-sm font-label-caps text-on-surface-variant tracking-wider uppercase mt-1">Discover new narratives</p>
                </div>
              </div>

              {/* Large Search Input */}
              <div className="relative max-w-2xl">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-on-surface-variant/70" />
                <input 
                  type="text"
                  placeholder="Search articles, topics, or authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/40 rounded-full py-4 pl-14 pr-12 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-xs text-base"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Categories Horizontal Scroll */}
            <div className="mb-8 overflow-x-auto no-scrollbar scroll-smooth flex gap-3 pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-5 py-2.5 rounded-full font-label-caps text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all active:scale-95 border ${
                  selectedCategory === null
                    ? 'bg-primary text-on-primary border-primary shadow-md'
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                All Topics
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full font-label-caps text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all active:scale-95 border ${
                    selectedCategory === cat
                      ? 'bg-primary text-on-primary border-primary shadow-md'
                      : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Posts Grid */}
            <AnimatePresence mode="wait">
              {loading ? (
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
                    <Search className="size-8" />
                  </div>
                  <h3 className="font-headline-md text-xl font-bold text-on-surface">No matching stories</h3>
                  <p className="text-on-surface-variant text-sm max-w-md">
                    We couldn't find any articles matching your search or category. Try adjusting your filters to discover more.
                  </p>
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
                                  else router.push('/login');
                                }}
                                className="p-1 hover:text-primary hover:bg-surface-container rounded-full transition-all duration-200 cursor-pointer bg-transparent border-0 flex items-center justify-center -mr-1"
                              >
                                <Bookmark className="size-4" fill={user?.bookmarks?.includes(post._id) ? "currentColor" : "none"} />
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
