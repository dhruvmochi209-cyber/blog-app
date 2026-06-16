import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowRight, Clock } from 'lucide-react';

export function WritePreviewOverlay({
  showPreview,
  setShowPreview,
  createdPost,
  router,
  category,
  title,
  user,
  readingTime,
  excerpt,
  coverImage,
  content,
  keywordChips,
}: any) {
  return (
    <AnimatePresence>
      {showPreview && createdPost && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed inset-0 z-[100] bg-surface overflow-y-auto flex flex-col"
        >
          {/* Preview Navigation Header */}
          <header className="sticky top-0 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-6 py-4 flex justify-between items-center z-10 w-full shadow-xs">
            <div className="flex items-center gap-2 text-on-surface select-none">
              <Eye className="size-4.5 text-primary" />
              <span className="font-label-caps text-xs uppercase tracking-wider font-bold">Story Reader Preview</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="font-label-caps text-xs text-on-surface-variant hover:text-on-surface px-4 py-2.5 rounded-full border border-outline-variant/30 hover:bg-surface-container-low transition-all font-semibold cursor-pointer"
              >
                Go Back & Edit
              </button>
              <button
                onClick={() => router.push('/feed')}
                className="bg-primary text-on-primary font-label-caps text-xs px-6 py-2.5 rounded-full hover:opacity-90 transition-all active:scale-95 shadow-sm font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                Finish & Exit
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </header>

          {/* Reader View Content Wrapper */}
          <article className="max-w-[720px] w-full mx-auto px-6 py-12 flex flex-col">
            {category && (
              <div className="mb-4">
                <span className="px-3.5 py-1 bg-surface-container border border-outline-variant/30 text-on-surface text-xs rounded-full font-bold uppercase tracking-widest font-label-caps select-none">
                  {category}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="font-display-xl text-4xl md:text-5xl font-black text-on-surface leading-tight mb-6 tracking-tight">
              {title}
            </h1>

            {/* Author details block */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-outline-variant/30">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant/30 select-none font-bold">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-label-caps text-on-surface text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <p className="font-body-md text-sm font-bold text-on-surface">{user?.name || 'Anonymous Author'}</p>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium mt-0.5 select-none">
                  <span className="flex items-center gap-1"><Clock className="size-3" /> {readingTime} min read</span>
                  <span>·</span>
                  <span>Published Today</span>
                </div>
              </div>
            </div>

            {/* Excerpt panel */}
            {excerpt && (
              <div className="mb-8 p-5 bg-surface-container-low border-l-4 border-primary rounded-r-xl italic font-serif text-on-surface-variant text-base leading-relaxed">
                "{excerpt}"
              </div>
            )}

            {/* Featured Cover Image */}
            {coverImage && (
              <div className="mb-10 aspect-video rounded-xl overflow-hidden border border-outline-variant/35 shadow-sm bg-surface-container-low">
                <img
                  src={coverImage}
                  alt="Article Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* TipTap Rich HTML Content */}
            <div
              className="tiptap font-serif leading-relaxed text-on-surface text-lg md:text-xl space-y-6 prose prose-zinc max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Keywords chips list */}
            {keywordChips?.length > 0 && (
              <div className="mt-12 pt-6 border-t border-outline-variant/30 flex flex-wrap gap-2 select-none">
                {keywordChips.map((chip: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-surface-container-low text-on-surface-variant text-xs rounded-full font-label-caps border border-outline-variant/20 flex items-center gap-0.5 font-bold uppercase tracking-wider"
                  >
                    <span className="text-xs text-on-surface-variant/70">#</span>
                    {chip}
                  </span>
                ))}
              </div>
            )}

          </article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
