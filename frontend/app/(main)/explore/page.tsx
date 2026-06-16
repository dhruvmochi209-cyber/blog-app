'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, X, Image as ImageIcon, Bookmark } from 'lucide-react';
import TopNavBar from '@/components/layout/TopNavBar';
import SideNavBar from '@/components/layout/SideNavBar';
import { PostGridCard } from '@/components/post/PostGridCard';
import RightSidebar from '@/components/layout/RightSidebar';
import { useAuth } from '@/lib/auth-context';

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

      <div className="flex-1 flex w-full pt-16">
        <SideNavBar />

        <div className="flex-1 flex justify-center px-4 py-8 md:px-8 min-w-0">
          <main className="flex-1 max-w-[1100px] w-full min-w-0 min-h-[calc(100vh-61px)] flex flex-col">
            
            {/* Redesigned Hero & Search Area */}
            <div className="mb-12 flex flex-col items-center text-center mt-4">
              <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
                <Compass className="size-10 text-primary animate-[spin_10s_linear_infinite]" />
              </div>
              <h1 className="font-display-xl text-4xl md:text-6xl font-black tracking-tight mb-4 text-on-surface">
                Discover Your Next Read
              </h1>
              <p className="font-body-md text-base md:text-lg text-on-surface-variant max-w-2xl mb-10">
                Dive into thousands of stories, technical tutorials, and creative narratives shared by top creators.
              </p>

              {/* Massive Search Input */}
              <div className="relative max-w-3xl w-full group">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-hover:bg-primary/10 transition-colors duration-500 pointer-events-none" />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-6 text-on-surface-variant/60 group-focus-within:text-primary transition-colors z-10" />
                <input 
                  type="text"
                  placeholder="What do you want to learn today?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="relative w-full bg-surface-container-lowest border-2 border-outline-variant/50 rounded-2xl py-5 pl-16 pr-14 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all shadow-md text-lg md:text-xl z-0"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-on-surface-variant hover:bg-surface-container rounded-full hover:text-on-surface transition-all z-10"
                  >
                    <X className="size-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Redesigned Categories Tabs */}
            <div className="mb-10 w-full overflow-x-auto no-scrollbar scroll-smooth flex justify-start md:justify-center gap-2 pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-3 rounded-xl font-label-caps text-xs font-bold tracking-widest uppercase whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === null
                    ? 'bg-on-surface text-surface shadow-xl -translate-y-0.5'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                Everything
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-3 rounded-xl font-label-caps text-xs font-bold tracking-widest uppercase whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === cat
                      ? 'bg-on-surface text-surface shadow-xl -translate-y-0.5'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
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
                      <PostGridCard
                        key={post._id}
                        post={post as any}
                        isBookmarked={!!user?.bookmarks?.includes(post._id)}
                        onBookmarkToggle={(id) => {
                          if (user) toggleBookmark(id);
                          else router.push('/login');
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
  );
}
