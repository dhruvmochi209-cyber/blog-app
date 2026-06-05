'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Hash, ArrowUpRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function RightSidebar() {
  const router = useRouter();
  const [topics, setTopics] = useState<string[]>([]);
  const [staffPicks, setStaffPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, postsRes] = await Promise.all([
          fetch(`${API}/posts/categories`),
          fetch(`${API}/posts?limit=4`)
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          if (catData.success && Array.isArray(catData.data)) {
            setTopics(catData.data.slice(0, 10));
          }
        }

        if (postsRes.ok) {
          const postData = await postsRes.json();
          if (postData.success && Array.isArray(postData.data)) {
            setStaffPicks(postData.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch sidebar data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <aside className="hidden xl:flex flex-col w-[300px] flex-shrink-0 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto no-scrollbar">
      <div className="p-6 space-y-8">

        {/* Trending Stories */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <TrendingUp className="size-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant font-label-caps">
              Trending
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-on-surface-variant/50 py-3">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-xs">Loading...</span>
            </div>
          ) : staffPicks.length === 0 ? (
            <p className="text-xs text-on-surface-variant py-2">No trending stories yet.</p>
          ) : (
            <div className="space-y-4">
              {staffPicks.map((post, i) => (
                <motion.div
                  key={post._id}
                  whileHover={{ x: 3 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => router.push(`/feed/${post.slug}`)}
                  className="group cursor-pointer"
                >
                  <div className="flex gap-3">
                    <span className="text-2xl font-black text-outline/30 font-headline-md leading-none mt-0.5 w-6 shrink-0 select-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {post.authorId?.avatar ? (
                          <img
                            src={post.authorId.avatar}
                            className="w-4 h-4 rounded-full object-cover border border-outline-variant/30"
                            alt={post.authorId.name || 'Author'}
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-[9px] border border-primary/20">
                            {post.authorId?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <span className="text-[11px] font-semibold text-on-surface-variant truncate">
                          {post.authorId?.name || 'Unknown'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors duration-200 leading-snug line-clamp-2 font-headline-md">
                        {post.title}
                      </h4>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <Link
            href="/explore"
            id="rightsidebar-full-list"
            className="inline-flex items-center gap-1 mt-5 text-primary text-xs font-bold tracking-wide uppercase hover:opacity-80 transition-opacity group font-label-caps"
          >
            See all stories
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Divider */}
        <div className="h-px bg-outline-variant/25" />

        {/* Topics */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <Hash className="size-3.5 text-primary" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant font-label-caps">
              Explore Topics
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-on-surface-variant/50 py-3">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-xs">Loading...</span>
            </div>
          ) : topics.length === 0 ? (
            <p className="text-xs text-on-surface-variant py-2">No topics available.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <motion.button
                  key={topic}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/explore')}
                  id={`rightsidebar-topic-${topic.toLowerCase()}`}
                  className="px-3.5 py-1.5 bg-surface-container-low hover:bg-primary/10 text-on-surface-variant hover:text-primary border border-outline-variant/30 hover:border-primary/30 rounded-full text-[11px] font-semibold transition-all duration-200 cursor-pointer select-none"
                >
                  {topic}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[10.5px] font-medium text-on-surface-variant/60 pt-4 border-t border-outline-variant/20">
          {['Help', 'Status', 'About', 'Careers', 'Privacy', 'Terms'].map((label) => (
            <Link key={label} href="#" className="hover:text-on-surface-variant transition-colors">
              {label}
            </Link>
          ))}
          <span className="w-full text-[10px] mt-1 opacity-50">© 2025 Writen Inc.</span>
        </div>
      </div>
    </aside>
  );
}
