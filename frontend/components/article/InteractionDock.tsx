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
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface/85 backdrop-blur-md border border-outline-variant/50 rounded-full px-6 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center gap-6 z-40 transition-all hover:border-outline duration-300"
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant select-none">
        <Eye className="size-4 text-secondary" />
        <span>{post.views || 0} views</span>
      </div>
      
      <div className="w-px h-4 bg-outline-variant/40" />
      
      <button 
        onClick={() => {
          if (user) toggleBookmark(post._id);
          else router.push('/login');
        }}
        className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer bg-transparent border-0 outline-none"
      >
        <Bookmark className="size-4" fill={user?.bookmarks?.includes(post._id) ? "currentColor" : "none"} />
        <span>{user?.bookmarks?.includes(post._id) ? 'Saved' : 'Save'}</span>
      </button>
      
      <div className="w-px h-4 bg-outline-variant/40" />
      
      <button 
        onClick={handleShare}
        className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer bg-transparent border-0 outline-none"
      >
        <Share2 className="size-4" />
        <span>Share</span>
      </button>
      
      <div className="w-px h-4 bg-outline-variant/40" />
      
      <button 
        onClick={onDownloadPDF}
        disabled={pdfDownloading}
        className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary disabled:opacity-60 transition-colors cursor-pointer bg-transparent border-0 outline-none"
        title="Export Article to PDF"
      >
        {pdfDownloading ? (
          <Loader2 className="size-4 animate-spin text-primary" />
        ) : (
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        <span>{pdfDownloading ? 'Exporting...' : 'PDF'}</span>
      </button>
    </motion.div>
  );
}
