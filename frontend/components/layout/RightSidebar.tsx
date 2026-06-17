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
    <aside className="hidden lg:flex flex-col w-full gap-4">

      {/* Trending Stories Section */}
      <section className="rounded-3xl p-6 bg-white border border-slate-200 shadow-sm flex-1 flex flex-col mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        
        <h3 className="font-sans font-bold text-xs text-slate-400 mb-6 tracking-[0.2em] uppercase flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Trending Now
        </h3>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 py-2">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-xs font-medium">Loading stories...</span>
          </div>
        ) : staffPicks.length === 0 ? (
          <div className="text-xs text-slate-400 py-2 font-medium">No trending stories found.</div>
        ) : (
          <div className="space-y-3 flex-1 overflow-y-auto pr-1 no-scrollbar relative z-10">
            {staffPicks.map((post, i) => (
              <a
                key={post._id}
                onClick={() => router.push(`/feed/${post.slug}`)}
                className="relative flex gap-4 p-4 rounded-2xl bg-[#f8f9fa] hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all group cursor-pointer overflow-hidden"
              >
                <span className="absolute -right-2 -bottom-4 font-black text-slate-900/[0.03] group-hover:text-primary/[0.05] transition-colors text-7xl select-none pointer-events-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                
                <div className="flex-1 min-w-0 z-10">
                  <div className="flex items-center gap-2 mb-2">
                    {post.authorId?.avatar ? (
                      <img
                        src={post.authorId.avatar}
                        className="w-5 h-5 rounded-full object-cover border border-slate-200 shadow-sm"
                        alt={post.authorId.name || 'Author'}
                        onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorId?.name || 'U')}&background=random`; }}
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] border border-primary/20">
                        {post.authorId?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <span className="text-[13px] text-slate-600 truncate font-semibold">
                      {post.authorId?.name || 'Unknown'}
                    </span>
                  </div>
                  <h4 className="font-body-md text-[15px] font-bold text-slate-900 group-hover:text-primary transition-colors duration-200 leading-snug line-clamp-2">
                    {post.title}
                  </h4>
                  {post.category && (
                    <span className="text-[11px] font-mono font-semibold tracking-wider text-slate-400 mt-2 block uppercase">
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
          className="inline-flex items-center justify-center gap-1.5 mt-6 py-2.5 px-4 bg-[#f8f9fa] hover:bg-slate-100 rounded-xl text-slate-600 text-[13px] font-bold tracking-wide transition-colors group uppercase"
        >
          See Full List
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </section>

    </aside>
  );
}
