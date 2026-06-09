'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
            setTopics(catData.data.slice(0, 10)); // Top 10 categories
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
    <aside className="hidden lg:block w-[340px] flex-shrink-0 space-y-4 pt-8 px-0 overflow-y-auto no-scrollbar sticky top-16 h-[calc(100vh-64px)]">

      {/* Trending Stories Section — stitch style */}
      <section className="glass-card rounded-xl p-5">
        <h3 className="font-mono text-xs text-on-surface-variant mb-4 px-1 tracking-widest uppercase">
          TRENDING NOW
        </h3>

        {loading ? (
          <div className="flex items-center gap-2 text-on-surface-variant/50 py-2">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-xs">Loading stories...</span>
          </div>
        ) : staffPicks.length === 0 ? (
          <div className="text-xs text-on-surface-variant py-2">No trending stories found.</div>
        ) : (
          <div className="space-y-4">
            {staffPicks.map((post, i) => (
              <a
                key={post._id}
                onClick={() => router.push(`/feed/${post.slug}`)}
                className="flex gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <span className="font-headline-md font-bold text-outline-variant/60 group-hover:text-primary transition-colors text-lg leading-none pt-0.5 w-6 shrink-0 select-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {post.authorId?.avatar ? (
                      <img
                        src={post.authorId.avatar}
                        className="w-4 h-4 rounded-full object-cover border border-white/10"
                        alt={post.authorId.name || 'Author'}
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-[9px]">
                        {post.authorId?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <span className="text-xs text-on-surface-variant truncate font-medium">
                      {post.authorId?.name || 'Unknown'}
                    </span>
                  </div>
                  <h4 className="font-body-md text-sm font-semibold text-on-surface group-hover:text-primary transition-colors duration-200 leading-snug line-clamp-2">
                    {post.title}
                  </h4>
                  {post.category && (
                    <span className="text-xs text-on-surface-variant mt-1 block">
                      {post.category}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        <Link
          href="/explore"
          id="rightsidebar-full-list"
          className="inline-flex items-center gap-1 mt-4 px-2 text-primary text-xs font-semibold tracking-wide hover:opacity-80 transition-opacity group font-label-caps uppercase"
        >
          See Full List
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </section>

      {/* Recommended Topics Section — stitch style */}
      <section>
        <h3 className="font-mono text-xs text-on-surface-variant mb-3 px-1 tracking-widest uppercase">
          POPULAR TAGS
        </h3>

        {loading ? (
          <div className="flex items-center gap-2 text-on-surface-variant/50 py-2">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-xs">Loading topics...</span>
          </div>
        ) : topics.length === 0 ? (
          <div className="text-xs text-on-surface-variant py-2">No recommended topics available.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => router.push('/explore')}
                id={`rightsidebar-topic-${topic.toLowerCase()}`}
                className="px-3 py-1.5 bg-surface-container hover:bg-surface-variant rounded-lg border border-white/5 text-xs font-mono hover:text-primary transition-all duration-200 cursor-pointer select-none text-on-surface-variant"
              >
                #{topic}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Footer Links */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10.5px] font-medium text-on-surface-variant/50 pt-4 border-t border-white/5 px-1">
        {['Help', 'Status', 'About', 'Careers', 'Privacy', 'Terms'].map((label) => (
          <Link key={label} href="#" className="hover:text-on-surface-variant transition-colors">
            {label}
          </Link>
        ))}
        <span className="w-full text-[10px] mt-1 opacity-60">© 2025 DevLog Inc.</span>
      </div>
    </aside>
  );
}
