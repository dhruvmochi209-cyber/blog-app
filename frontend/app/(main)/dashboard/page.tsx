'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { PostsTable } from '@/components/dashboard/PostsTable';
import { DeletePostModal } from '@/components/dashboard/DeletePostModal';
import TopNavBar from '@/components/layout/TopNavBar';
import SideNavBar from '@/components/layout/SideNavBar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://blog-application-fjg9.onrender.com/api';

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
  const { user, accessToken, loading: authLoading } = useAuth();
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

  // Security handled by ProtectedRoute wrapper

  // ── Fetch Portfolio Data ──
  const fetchDashboardData = async () => {
    if (!accessToken) return;
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/posts/my?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        cache: 'no-store'
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

        // Refresh full analytics in the background for charts
        fetchDashboardData();
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

          // Refresh full analytics in the background for charts
          fetchDashboardData();
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

  // Loading states handled by ProtectedRoute

  return (
    <ProtectedRoute creatorOnly={true}>
      <div className="min-h-screen bg-[#f8f9fa] text-foreground flex flex-col relative font-body-md transition-colors duration-300">
        <TopNavBar />

      <div className="flex-1 flex w-full pt-16">
        <SideNavBar />

        <div className="flex-1 flex justify-center px-6 py-10 md:px-8">
          <motion.main
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 max-w-[1000px] w-full flex flex-col gap-8 min-h-[calc(100vh-61px)]"
          >

            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-surface-container-low border border-outline-variant/20 p-8 sm:p-10 mb-2 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              
              <div className="z-10">
                <h1 className="font-display-xl text-3xl md:text-[2.5rem] font-black tracking-tight text-on-surface leading-tight mb-2">
                  Author Workspace
                </h1>
                <p className="font-body-md text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-md">
                  Manage your portfolio, track story performance, and edit your drafts all in one place.
                </p>
              </div>

              <div className="z-10 shrink-0">
                <Link
                  href="/write"
                  id="dashboard-write-story-btn"
                  className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-on-surface text-surface rounded-xl font-label-caps text-xs font-bold uppercase tracking-wider overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <Plus className="size-4 relative z-10" />
                  <span className="relative z-10">New Story</span>
                </Link>
              </div>
            </div>

            {/* Error Notifications */}
            {error && (
              <div className="p-4 bg-error-container text-on-error-container border border-error/15 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <MetricsGrid analytics={analytics} loading={loading} />

            {/* Articles Table Section */}
            <PostsTable 
              posts={posts}
              loading={loading}
              transitioningDeleteIds={transitioningDeleteIds}
              togglingId={togglingId}
              handleToggleStatus={handleToggleStatus}
              setDeletingPost={setDeletingPost}
            />

          </motion.main>
        </div>
      </div>

      {/* Danger Modal */}
      <DeletePostModal 
        deletingPost={deletingPost}
        deleting={deleting}
        setDeletingPost={setDeletingPost}
        handleDeletePost={handleDeletePost}
      />
    </div>
    </ProtectedRoute>
  );
}
