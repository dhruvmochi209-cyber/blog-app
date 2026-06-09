import { Eye, Globe, FileText } from 'lucide-react';

export function MetricsGrid({ analytics, loading }: { analytics: any, loading: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {/* Metric 1: Views */}
      <div className="bg-surface-container-low border border-outline-variant/25 p-6 rounded-2xl flex items-center justify-between shadow-xs hover:border-outline transition-all duration-300 relative group overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full translate-x-8 -translate-y-8 blur-xl group-hover:scale-110 transition-transform select-none pointer-events-none" />
        <div className="space-y-1 z-10">
          <span className="font-label-caps text-[10px] tracking-widest text-on-surface-variant font-bold uppercase block">Total Story Views</span>
          <p className="text-3xl font-bold text-on-surface leading-none tracking-tight">
            {loading ? '—' : (analytics?.totalViews || 0).toLocaleString()}
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
            {loading ? '—' : (analytics?.publishedCount || 0).toLocaleString()}
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
            {loading ? '—' : (analytics?.draftsCount || 0).toLocaleString()}
          </p>
        </div>
        <div className="p-3 bg-amber-500/5 text-amber-600 border border-amber-500/10 rounded-xl flex items-center justify-center shrink-0 z-10">
          <FileText className="size-5" />
        </div>
      </div>
    </div>
  );
}
