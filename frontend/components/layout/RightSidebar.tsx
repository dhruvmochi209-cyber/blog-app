'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://blog-application-fjg9.onrender.com/api';

export default function RightSidebar() {
  const router = useRouter();
  const [staffPicks, setStaffPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postsRes = await fetch(`${API}/posts?limit=10`);

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
    <aside className="hidden lg:flex w-[340px] flex-shrink-0 flex-col pt-8 px-0 overflow-y-auto no-scrollbar sticky top-16 h-[calc(100vh-64px)]">

      {/* Trending Stories Section */}
      <section className="glass-card rounded-xl p-5 border-l-4 border-l-primary shadow-sm bg-surface flex-1 flex flex-col mb-4">
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
          <div className="space-y-4 flex-1 overflow-y-auto pr-1 no-scrollbar">
            {staffPicks.map((post, i) => (
              <a
                key={post._id}
                onClick={() => router.push(`/feed/${post.slug}`)}
                className="flex gap-4 p-2 rounded-lg hover:bg-surface-variant transition-colors group cursor-pointer"
              >
                <span className="font-headline-md font-bold text-outline-variant/60 group-hover:text-primary transition-colors text-lg leading-none pt-0.5 w-6 shrink-0 select-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {post.authorId?.avatar ? (
                      <img
                        src={post.authorId.avatar}
                        className="w-4 h-4 rounded-full object-cover border border-outline-variant"
                        alt={post.authorId.name || 'Author'}
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm">
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

    </aside>
  );
}
