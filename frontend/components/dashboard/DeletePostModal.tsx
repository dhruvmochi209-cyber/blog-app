import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';

export function DeletePostModal({ 
  deletingPost, 
  deleting, 
  setDeletingPost, 
  handleDeletePost 
}: any) {
  return (
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
  );
}
