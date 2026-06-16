import { Eye, Globe, FileText } from 'lucide-react';

export function MetricsGrid({ analytics, loading }: { analytics: any, loading: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Metric 1: Views */}
      <div className="bg-surface-container/30 border-l-4 border-l-primary border-y border-r border-outline-variant/30 p-5 rounded-r-2xl flex flex-col justify-between shadow-sm relative group overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="font-label-caps text-xs tracking-widest text-on-surface-variant font-bold uppercase">Story Views</span>
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Eye className="size-4" />
          </div>
        </div>
        <p className="font-display-xl text-4xl font-black text-on-surface tracking-tighter">
          {loading ? '—' : (analytics?.totalViews || 0).toLocaleString()}
        </p>
      </div>

      {/* Metric 2: Published */}
      <div className="bg-surface-container/30 border-l-4 border-l-indigo-500 border-y border-r border-outline-variant/30 p-5 rounded-r-2xl flex flex-col justify-between shadow-sm relative group overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="font-label-caps text-xs tracking-widest text-on-surface-variant font-bold uppercase">Published</span>
          <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg">
            <Globe className="size-4" />
          </div>
        </div>
        <p className="font-display-xl text-4xl font-black text-on-surface tracking-tighter">
          {loading ? '—' : (analytics?.publishedCount || 0).toLocaleString()}
        </p>
      </div>

      {/* Metric 3: Drafts */}
      <div className="bg-surface-container/30 border-l-4 border-l-amber-500 border-y border-r border-outline-variant/30 p-5 rounded-r-2xl flex flex-col justify-between shadow-sm relative group overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="font-label-caps text-xs tracking-widest text-on-surface-variant font-bold uppercase">Drafts</span>
          <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
            <FileText className="size-4" />
          </div>
        </div>
        <p className="font-display-xl text-4xl font-black text-on-surface tracking-tighter">
          {loading ? '—' : (analytics?.draftsCount || 0).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
