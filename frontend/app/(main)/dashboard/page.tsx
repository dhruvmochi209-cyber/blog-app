'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Globe, FileText, Plus, Edit, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import TopNavBar from '@/components/layout/TopNavBar';
import SideNavBar from '@/components/layout/SideNavBar';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CreatorDashboard() {
  const { user, accessToken } = useAuth();
  const router = useRouter();

  // ── States ──
  const [posts, setPosts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    totalViews: 0,
    publishedCount: 0,
    draftsCount: 0,
    categories: [],
    monthlyTrend: []
  });
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingPost, setDeletingPost] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [transitioningDeleteIds, setTransitioningDeleteIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ── Strict Security Redirect ──
  useEffect(() => {
    if (user === null) {
      router.replace('/login');
    } else if (user && user.role !== 'CREATOR') {
      router.replace('/feed');
    }
  }, [user, router]);

  // ── Fetch Portfolio Data ──
  const fetchDashboardData = async () => {
    if (!accessToken) return;
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/posts/my`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const resData = await res.json();

      if (resData.success) {
        setPosts(resData.data || []);
        if (resData.analytics) {
          setAnalytics(resData.analytics);
        }
      } else {
        setError(resData.message || 'Failed to fetch portfolio data.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure. Make sure the backend server is running on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'CREATOR' && accessToken) {
      fetchDashboardData();
    }
  }, [user, accessToken]);

  // ── Toggle Draft/Published Status ──
  const handleToggleStatus = async (postId: string, currentStatus: string) => {
    if (togglingId) return;
    setTogglingId(postId);

    const nextStatus = currentStatus === 'DRAFT' ? 'PUBLISHED' : 'DRAFT';

    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const resData = await res.json();

      if (resData.success) {
        setPosts(prev =>
          prev.map(p => (p._id === postId ? { ...p, status: nextStatus } : p))
        );
        setAnalytics((prev: any) => ({
          ...prev,
          publishedCount: prev.publishedCount + (nextStatus === 'PUBLISHED' ? 1 : -1),
          draftsCount: prev.draftsCount + (nextStatus === 'DRAFT' ? 1 : -1),
        }));
      } else {
        alert(resData.message || 'Failed to update post status.');
      }
    } catch (err) {
      console.error(err);
      alert('Network issue. Failed to connect to server.');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Delete Post Trigger ──
  const handleDeletePost = async () => {
    if (!deletingPost || deleting) return;
    setDeleting(true);

    const targetId = deletingPost._id;
    setTransitioningDeleteIds(prev => [...prev, targetId]);
    setDeletingPost(null);

    setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/posts/${targetId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        const resData = await res.json();

        if (resData.success) {
          setAnalytics((prev: any) => ({
            ...prev,
            totalViews: prev.totalViews - (deletingPost.views || 0),
            publishedCount: prev.publishedCount - (deletingPost.status === 'PUBLISHED' ? 1 : 0),
            draftsCount: prev.draftsCount - (deletingPost.status === 'DRAFT' ? 1 : 0),
          }));
          setPosts(prev => prev.filter(p => p._id !== targetId));
        } else {
          setTransitioningDeleteIds(prev => prev.filter(id => id !== targetId));
          alert(resData.message || 'Failed to delete post.');
        }
      } catch (err) {
        console.error(err);
        setTransitioningDeleteIds(prev => prev.filter(id => id !== targetId));
        alert('Network failure occurred. Post was not deleted.');
      } finally {
        setDeleting(false);
      }
    }, 500);
  };

  if (!user || user.role !== 'CREATOR') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-primary/5 blur-3xl select-none pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] rounded-full bg-primary/5 blur-3xl select-none pointer-events-none" />
        
        <div className="flex flex-col items-center gap-4 z-10 animate-pulse">
          <Loader2 className="animate-spin text-primary size-10" />
          <p className="font-label-caps text-xs text-on-surface-variant font-semibold uppercase tracking-wider select-none">
            Verifying credentials...
          </p>
        </div>
      </div>
    );
  }

  // helper calculations for rendering charts
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const maxViews = Math.max(...(analytics.monthlyTrend || []).map((d: any) => d.views || 0), 10);
  const maxCategoryViews = Math.max(...(analytics.categories || []).map((c: any) => c.views || 0), 1);
  const topPosts = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);

  const trendData = analytics.monthlyTrend || [];
  const chartWidth = 600;
  const chartHeight = 160;
  const padding = { top: 15, right: 15, bottom: 25, left: 45 };

  const points = trendData.map((d: any, index: number) => {
    const ratio = trendData.length > 1 ? index / (trendData.length - 1) : 0.5;
    const x = padding.left + ratio * (chartWidth - padding.left - padding.right);
    const y = chartHeight - padding.bottom - ((d.views || 0) / maxViews) * (chartHeight - padding.top - padding.bottom);
    return { x, y, views: d.views };
  });

  const linePath = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p: any) => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${points[0].x} ${chartHeight - padding.bottom} Z`
    : '';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative font-body-md transition-colors duration-300">
      <TopNavBar />

      <div className="flex-1 flex w-full">
        <SideNavBar />

        <div className="flex-1 flex justify-center px-6 py-10 md:px-8">
          <motion.main 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 max-w-[1000px] w-full flex flex-col gap-8 min-h-[calc(100vh-61px)]"
          >
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-outline-variant/30">
              <div>
                <h1 className="font-display-xl text-3xl md:text-4xl font-black tracking-tight text-on-surface leading-tight">
                  Creator Space
                </h1>
                <p className="font-body-md text-sm text-on-surface-variant mt-1.5 leading-relaxed font-light">
                  Analyze performance metrics and manage your published publications catalog.
                </p>
              </div>

              <Link
                href="/write"
                id="dashboard-write-story-btn"
                className="bg-primary text-on-primary font-label-caps text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-full hover:opacity-90 transition-all active:scale-95 shadow-sm flex items-center gap-1.5"
              >
                <Plus className="size-4" />
                Write New Story
              </Link>
            </div>

            {/* Error Notifications */}
            {error && (
              <div className="p-4 bg-error-container text-on-error-container border border-error/15 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Analytics Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              {/* Metric 1: Views */}
              <div className="bg-surface-container-low border border-outline-variant/25 p-6 rounded-2xl flex items-center justify-between shadow-xs hover:border-outline transition-all duration-300 relative group overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full translate-x-8 -translate-y-8 blur-xl group-hover:scale-110 transition-transform select-none pointer-events-none" />
                <div className="space-y-1 z-10">
                  <span className="font-label-caps text-[10px] tracking-widest text-on-surface-variant font-bold uppercase block">Total Story Views</span>
                  <p className="text-3xl font-bold text-on-surface leading-none tracking-tight">
                    {loading ? '—' : analytics.totalViews.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-primary/5 text-primary border border-primary/10 rounded-xl flex items-center justify-center shrink-0 z-10">
                  <Eye className="size-5" />
                </div>
              </div>

              {/* Metric 2: Published */}
              <div className="bg-surface-container-low border border-outline-variant/25 p-6 rounded-2xl flex items-center justify-between shadow-xs hover:border-outline transition-all duration-300 relative group overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full translate-x-8 -translate-y-8 blur-xl group-hover:scale-110 transition-transform select-none pointer-events-none" />
                <div className="space-y-1 z-10">
                  <span className="font-label-caps text-[10px] tracking-widest text-on-surface-variant font-bold uppercase block">Published Articles</span>
                  <p className="text-3xl font-bold text-on-surface leading-none tracking-tight">
                    {loading ? '—' : analytics.publishedCount.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-emerald-500/5 text-emerald-600 border border-emerald-500/10 rounded-xl flex items-center justify-center shrink-0 z-10">
                  <Globe className="size-5" />
                </div>
              </div>

              {/* Metric 3: Drafts */}
              <div className="bg-surface-container-low border border-outline-variant/25 p-6 rounded-2xl flex items-center justify-between shadow-xs hover:border-outline transition-all duration-300 relative group overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-full translate-x-8 -translate-y-8 blur-xl group-hover:scale-110 transition-transform select-none pointer-events-none" />
                <div className="space-y-1 z-10">
                  <span className="font-label-caps text-[10px] tracking-widest text-on-surface-variant font-bold uppercase block">Unpublished Drafts</span>
                  <p className="text-3xl font-bold text-on-surface leading-none tracking-tight">
                    {loading ? '—' : analytics.draftsCount.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-amber-500/5 text-amber-600 border border-amber-500/10 rounded-xl flex items-center justify-center shrink-0 z-10">
                  <FileText className="size-5" />
                </div>
              </div>

            </div>

            {/* Analytics Graphics & Category Breakdown */}
            {!loading && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SVG Area Chart Card */}
                <div className="lg:col-span-2 bg-surface-container-low border border-outline-variant/25 p-6 rounded-2xl flex flex-col justify-between shadow-xs hover:border-outline transition-all duration-300 relative">
                  <div className="mb-4 flex justify-between items-center select-none">
                    <div>
                      <h3 className="font-label-caps text-xs tracking-widest text-on-surface-variant font-bold uppercase">View Trend over Time</h3>
                      <p className="text-[11px] text-on-surface-variant font-light mt-0.5">Views aggregated by publication month</p>
                    </div>
                  </div>
                  
                  {analytics.monthlyTrend && analytics.monthlyTrend.length > 0 ? (
                    <div className="w-full pt-2">
                      <svg viewBox={`0 0 600 160`} className="w-full h-auto max-h-[220px] aspect-[15/4] overflow-visible">
                        <defs>
                          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Horizontal grid lines */}
                        {Array.from({ length: 4 }).map((_, i) => {
                          const y = 15 + (i / 3) * (160 - 15 - 25);
                          const value = Math.round(maxViews - (i / 3) * maxViews);
                          return (
                            <g key={i} className="opacity-40">
                              <line 
                                x1={45} 
                                y1={y} 
                                x2={600 - 15} 
                                y2={y} 
                                stroke="var(--color-outline-variant)" 
                                strokeWidth={1} 
                                strokeDasharray="4 4" 
                              />
                              <text 
                                x={35} 
                                y={y + 4} 
                                textAnchor="end" 
                                className="text-[9px] fill-on-surface-variant/80 font-mono font-medium"
                              >
                                {value.toLocaleString()}
                              </text>
                            </g>
                          );
                        })}
                        
                        {/* Area Fill */}
                        <path d={areaPath} fill="url(#areaGradient)" />
                        
                        {/* Line Stroke */}
                        <path 
                          d={linePath} 
                          fill="none" 
                          stroke="var(--color-primary)" 
                          strokeWidth={2} 
                          className="opacity-90"
                        />
                        
                        {/* Data Points */}
                        {points.map((p: any, i: number) => (
                          <g key={i} className="group/point">
                            <circle 
                              cx={p.x} 
                              cy={p.y} 
                              r={4} 
                              fill="var(--color-surface)" 
                              stroke="var(--color-primary)" 
                              strokeWidth={2} 
                              className="transition-all duration-200 cursor-pointer group-hover/point:r-[5.5px]"
                            />
                            {/* Simple SVG text tooltip on hover */}
                            <g className="opacity-0 group-hover/point:opacity-100 transition-opacity duration-200 pointer-events-none">
                              <rect 
                                x={Math.max(10, p.x - 50)} 
                                y={p.y - 32} 
                                width={100} 
                                height={22} 
                                rx={4} 
                                fill="var(--color-inverse-surface)" 
                              />
                              <text 
                                x={Math.max(10, p.x - 50) + 50} 
                                y={p.y - 17} 
                                textAnchor="middle" 
                                className="text-[9.5px] fill-inverse-on-surface font-bold font-mono"
                              >
                                {p.views.toLocaleString()} views
                              </text>
                            </g>
                            
                            {/* X-axis labels */}
                            {analytics.monthlyTrend.length > 0 && (
                              <text 
                                x={p.x} 
                                y={160 - 6} 
                                textAnchor="middle" 
                                className="text-[9.5px] fill-on-surface-variant font-bold font-label-caps uppercase select-none"
                              >
                                {MONTHS[analytics.monthlyTrend[i]._id.month - 1]}
                              </text>
                            )}
                          </g>
                        ))}
                      </svg>
                    </div>
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center border border-dashed border-outline-variant/50 rounded-xl bg-surface-container-low/20">
                      <span className="text-[10px] uppercase font-label-caps font-bold text-on-surface-variant/50">No publication history yet</span>
                    </div>
                  )}
                </div>

                {/* Category Views Breakdown */}
                <div className="bg-surface-container-low border border-outline-variant/25 p-6 rounded-2xl flex flex-col justify-between shadow-xs hover:border-outline transition-all duration-300">
                  <div className="select-none">
                    <h3 className="font-label-caps text-xs tracking-widest text-on-surface-variant font-bold uppercase">Category Distribution</h3>
                    <p className="text-[11px] text-on-surface-variant font-light mt-0.5">Views accumulated per category</p>
                  </div>
                  
                  <div className="flex-1 mt-4 space-y-3.5 max-h-[160px] overflow-y-auto no-scrollbar pr-1">
                    {analytics.categories && analytics.categories.length > 0 ? (
                      analytics.categories.slice(0, 4).map((cat: any) => {
                        const percent = ((cat.views || 0) / maxCategoryViews) * 100;
                        return (
                          <div key={cat._id} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-on-surface truncate pr-2">{cat._id || 'Other'}</span>
                              <span className="text-on-surface-variant shrink-0 font-mono text-[11px]">{cat.views.toLocaleString()} views</span>
                            </div>
                            <div className="h-2 w-full bg-outline-variant/30 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all duration-500" 
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex items-center justify-center py-8 text-center text-on-surface-variant/40">
                        <span className="text-[10px] uppercase font-label-caps font-bold">No category details</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Top Performing Stories */}
            {!loading && posts.length > 0 && (
              <div className="bg-surface-container-low border border-outline-variant/25 p-6 rounded-2xl shadow-xs hover:border-outline transition-all duration-300">
                <div className="mb-4 select-none">
                  <h3 className="font-label-caps text-xs tracking-widest text-on-surface-variant font-bold uppercase">Top Performing Stories</h3>
                  <p className="text-[11px] text-on-surface-variant font-light mt-0.5">Your highest performing publications by view counts</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topPosts.map((post: any, index: number) => (
                    <div 
                      key={post._id} 
                      onClick={() => router.push(`/feed/${post.slug}`)}
                      className="group flex flex-col justify-between p-4 border border-outline-variant/30 hover:border-outline rounded-xl bg-surface-container-lowest/30 hover:bg-surface-container-lowest transition-all duration-300 cursor-pointer shadow-2xs"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="px-2 py-0.5 bg-surface-container border border-outline-variant/30 text-on-surface-variant text-[9px] rounded-full font-label-caps font-bold tracking-wider uppercase">
                            {post.category || 'Other'}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 border border-primary/15 rounded px-1.5 py-0.5">
                            #{index + 1}
                          </span>
                        </div>
                        <h4 className="font-headline-md text-xs font-bold text-on-surface group-hover:text-primary transition-colors duration-200 line-clamp-1 leading-snug">
                          {post.title}
                        </h4>
                        <p className="text-on-surface-variant font-light text-[11px] line-clamp-2 leading-relaxed">
                          {post.excerpt || 'No description provided.'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-outline-variant/20 text-[10px] font-semibold text-on-surface-variant">
                        <Eye className="size-3.5 text-secondary/70" />
                        <span>{post.views.toLocaleString()} views</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Articles Table Section */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-xs overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container/20">
                <h2 className="font-label-caps text-xs uppercase tracking-widest text-on-surface-variant font-bold select-none">
                  Your Publications ({posts.length})
                </h2>
              </div>

              <div className="overflow-x-auto w-full">
                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="animate-spin text-primary size-7" />
                    <span className="font-label-caps text-xs text-on-surface-variant font-semibold tracking-wider animate-pulse">Syncing catalog index...</span>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="py-20 text-center space-y-4 px-4 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mx-auto text-secondary">
                      <FileText className="size-5 text-on-surface-variant" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-headline-md text-base font-bold text-on-surface uppercase tracking-tight">No publications found</p>
                      <p className="font-body-md text-xs text-on-surface-variant leading-relaxed font-light">
                        You haven't authored any publications yet. Click "Write New Story" above to draft your technical masterpiece!
                      </p>
                    </div>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container/10 border-b border-outline-variant/30 select-none">
                        <th className="font-label-caps text-[10px] font-bold text-on-surface-variant/80 uppercase px-6 py-3.5 tracking-wider">Article Title</th>
                        <th className="hidden sm:table-cell font-label-caps text-[10px] font-bold text-on-surface-variant/80 uppercase px-6 py-3.5 tracking-wider w-[130px]">Category</th>
                        <th className="hidden xs:table-cell font-label-caps text-[10px] font-bold text-on-surface-variant/80 uppercase px-6 py-3.5 tracking-wider w-[100px] text-center">Views</th>
                        <th className="hidden md:table-cell font-label-caps text-[10px] font-bold text-on-surface-variant/80 uppercase px-6 py-3.5 tracking-wider w-[140px]">Last Updated</th>
                        <th className="font-label-caps text-[10px] font-bold text-on-surface-variant/80 uppercase px-6 py-3.5 tracking-wider w-[140px] text-center">Status</th>
                        <th className="font-label-caps text-[10px] font-bold text-on-surface-variant/80 uppercase px-6 py-3.5 tracking-wider w-[100px] text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {posts.map((post) => {
                        const isTransitioning = transitioningDeleteIds.includes(post._id);

                        return (
                          <tr
                            key={post._id}
                            className={`hover:bg-surface-container-low/60 transition-all duration-300 ${
                              isTransitioning ? 'opacity-0 scale-98 select-none pointer-events-none' : ''
                            }`}
                          >
                            {/* Title & Excerpt */}
                            <td className="px-6 py-4.5 min-w-[280px]">
                              <div className="flex flex-col gap-1">
                                <Link 
                                  href={`/feed/${post.slug}`}
                                  className="font-headline-md text-[14.5px] font-bold text-on-surface line-clamp-1 hover:text-primary transition-colors leading-tight"
                                >
                                  {post.title}
                                </Link>
                                <span className="font-body-md text-xs text-on-surface-variant line-clamp-1 font-light leading-normal">
                                  {post.excerpt || 'No summary description provided.'}
                                </span>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="hidden sm:table-cell px-6 py-4.5 whitespace-nowrap">
                              <span className="px-2.5 py-0.5 bg-surface-container border border-outline-variant/30 text-on-surface text-[10px] rounded-full font-label-caps font-bold tracking-wider uppercase">
                                {post.category || 'Uncategorized'}
                              </span>
                            </td>

                            {/* Views */}
                            <td className="hidden xs:table-cell px-6 py-4.5 whitespace-nowrap text-center">
                              <span className="font-body-md text-xs text-on-surface-variant font-semibold flex items-center justify-center gap-1.5">
                                <Eye className="size-3.5 text-secondary/60" />
                                {(post.views || 0).toLocaleString()}
                              </span>
                            </td>

                            {/* Last Updated */}
                            <td className="hidden md:table-cell px-6 py-4.5 whitespace-nowrap">
                              <span className="font-body-md text-xs text-on-surface-variant font-medium">
                                {formatRelativeTime(post.updatedAt)}
                              </span>
                            </td>

                            {/* Switch Status Button */}
                            <td className="px-6 py-4.5 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2.5">
                                <button
                                  onClick={() => handleToggleStatus(post._id, post.status)}
                                  disabled={togglingId === post._id}
                                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-outline-variant/30 transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-60 select-none items-center ${
                                    post.status === 'PUBLISHED' ? 'bg-primary' : 'bg-surface-container-high'
                                  }`}
                                  title={`Switch to ${post.status === 'PUBLISHED' ? 'Draft' : 'Publish'}`}
                                >
                                  <span
                                    className={`pointer-events-none relative inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out flex items-center justify-center ${
                                      post.status === 'PUBLISHED' ? 'translate-x-4.5' : 'translate-x-0.5'
                                    }`}
                                  >
                                    {togglingId === post._id && (
                                      <Loader2 className="animate-spin text-primary size-2" />
                                    )}
                                  </span>
                                </button>
                                <span
                                  className={`font-label-caps text-[9px] uppercase font-bold tracking-wider select-none w-14 text-left ${
                                    post.status === 'PUBLISHED' ? 'text-primary' : 'text-on-surface-variant/80'
                                  }`}
                                >
                                  {post.status}
                                </span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4.5 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Link
                                  href={`/edit/${post._id}`}
                                  className="p-1.5 hover:bg-surface-container text-on-surface-variant hover:text-primary rounded-lg transition-colors cursor-pointer active:scale-90 flex items-center justify-center"
                                  title="Edit publication"
                                >
                                  <Edit className="size-4" />
                                </Link>
                                <button
                                  onClick={() => setDeletingPost(post)}
                                  className="p-1.5 hover:bg-error-container/20 text-on-surface-variant hover:text-error rounded-lg transition-colors cursor-pointer active:scale-90 flex items-center justify-center"
                                  title="Delete publication"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </motion.main>
        </div>
      </div>

      {/* Danger Modal */}
      <AnimatePresence>
        {deletingPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-container-low border border-outline-variant/40 max-w-sm w-full rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 space-y-4">
                
                {/* Warning Title */}
                <div className="flex items-center gap-3 text-error">
                  <div className="p-2.5 bg-error/5 border border-error/15 rounded-xl">
                    <AlertTriangle className="size-5" />
                  </div>
                  <h3 className="font-headline-lg text-base font-bold text-on-surface">Delete Publication</h3>
                </div>

                {/* Warning Details */}
                <div className="space-y-2">
                  <p className="font-body-md text-[13.5px] text-on-surface leading-normal">
                    Are you absolutely sure you want to delete <strong className="font-bold">"{deletingPost.title}"</strong>?
                  </p>
                  <p className="font-body-md text-xs text-on-surface-variant leading-relaxed font-light">
                    This action is permanent and cannot be undone. All database records and statistics associated with this post will be erased.
                  </p>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setDeletingPost(null)}
                    disabled={deleting}
                    className="font-label-caps text-xs text-on-surface-variant hover:text-on-surface px-4 py-2.5 rounded-full border border-outline-variant/30 hover:bg-surface-container-high/40 transition-all font-semibold cursor-pointer disabled:opacity-50 outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeletePost}
                    disabled={deleting}
                    className="bg-error text-on-error font-label-caps text-xs px-5 py-2.5 rounded-full hover:opacity-95 transition-all active:scale-95 shadow-sm font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 outline-none"
                  >
                    {deleting && <Loader2 className="animate-spin size-3.5" />}
                    Delete Post
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
