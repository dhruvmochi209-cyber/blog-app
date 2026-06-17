import { motion } from 'framer-motion';
import { Eye, Bookmark, Share2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function InteractionDock({ post, pdfDownloading, onDownloadPDF }: any) {
  const router = useRouter();
  const { user, toggleBookmark } = useAuth();

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-full px-7 py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center gap-6 z-40 transition-transform hover:-translate-y-1 duration-300"
    >
      <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-700 select-none">
        <Eye className="size-[18px] text-purple-600" />
        <span>{post.views || 0} views</span>
      </div>
      
      <div className="w-px h-5 bg-slate-200" />
      
      <button 
        onClick={() => {
          if (user) toggleBookmark(post._id);
          else router.push('/login');
        }}
        className="flex items-center gap-2 text-[14px] font-semibold text-slate-700 hover:text-purple-600 transition-colors cursor-pointer bg-transparent border-0 outline-none group"
      >
        <Bookmark className="size-[18px] text-slate-600 group-hover:text-purple-600" fill={user?.bookmarks?.includes(post._id) ? "currentColor" : "none"} />
        <span>{user?.bookmarks?.includes(post._id) ? 'Saved' : 'Save'}</span>
      </button>
      
      <div className="w-px h-5 bg-slate-200" />
      
      <button 
        onClick={handleShare}
        className="flex items-center gap-2 text-[14px] font-semibold text-slate-700 hover:text-purple-600 transition-colors cursor-pointer bg-transparent border-0 outline-none group"
      >
        <Share2 className="size-[18px] text-slate-600 group-hover:text-purple-600" />
        <span>Share</span>
      </button>
      
      <div className="w-px h-5 bg-slate-200" />
      
      <button 
        onClick={onDownloadPDF}
        disabled={pdfDownloading}
        className="flex items-center gap-2 text-[14px] font-semibold text-slate-700 hover:text-purple-600 disabled:opacity-60 transition-colors cursor-pointer bg-transparent border-0 outline-none group"
        title="Export Article to PDF"
      >
        {pdfDownloading ? (
          <Loader2 className="size-[18px] animate-spin text-purple-600" />
        ) : (
          <svg className="size-[18px] text-slate-600 group-hover:text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        <span>{pdfDownloading ? 'Exporting...' : 'PDF'}</span>
      </button>
    </motion.div>
  );
}
