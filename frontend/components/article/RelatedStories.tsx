import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function RelatedStories({ relatedLoading, relatedPosts, calculateReadingTime }: any) {
  const router = useRouter();

  const getAvatarFallback = (name: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="related-stories-section border-t border-outline-variant/40 pt-16 pb-24">
      <h3 className="font-headline-md text-xl md:text-2xl font-black uppercase tracking-tight text-on-surface mb-8">
        Related Stories
      </h3>

      {relatedLoading ? (
        <div className="flex items-center gap-3 text-secondary/60 py-6">
          <Loader2 className="size-5 animate-spin text-primary" />
          <span className="text-sm font-semibold font-label-caps uppercase tracking-wider">Retrieving relevant narratives...</span>
        </div>
      ) : relatedPosts.length === 0 ? (
        <p className="text-sm text-on-surface-variant leading-relaxed">No related articles found under this topic.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedPosts.map((rPost: any, index: number) => (
            <motion.div
              key={rPost._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onClick={() => router.push(`/feed/${rPost.slug}`)}
              className="group flex flex-col justify-between bg-surface-container-lowest/30 hover:bg-surface-container-lowest border border-outline-variant/30 hover:border-outline-variant/80 rounded-xl p-4 cursor-pointer transition-all duration-300 editorial-shadow hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                {/* Image preview */}
                {rPost.coverImage ? (
                  <div className="w-full aspect-[16/10] overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-low shrink-0 relative">
                    <img
                      src={rPost.coverImage}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      alt={rPost.title}
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[16/10] rounded-lg border border-dashed border-outline-variant bg-surface-container-low/20 shrink-0 flex items-center justify-center text-secondary/40 select-none">
                    <span className="material-symbols-outlined text-3xl">image</span>
                  </div>
                )}

                <div className="space-y-2">
                  {rPost.category && (
                    <span className="inline-block px-2.5 py-0.5 bg-surface-container text-on-surface-variant rounded-full text-[9px] font-bold uppercase tracking-wider font-label-caps border border-outline-variant/20">
                      {rPost.category}
                    </span>
                  )}
                  <h4 className="font-headline-md text-sm font-bold text-on-surface group-hover:text-primary transition-colors duration-200 line-clamp-2 leading-snug">
                    {rPost.title}
                  </h4>
                  <p className="text-on-surface-variant font-light text-xs line-clamp-2 leading-relaxed">
                    {rPost.excerpt || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Author metadata */}
              <div className="flex items-center gap-2.5 pt-4 mt-4 border-t border-outline-variant/20">
                {rPost.authorId?.avatar ? (
                  <img src={rPost.authorId.avatar} className="w-5.5 h-5.5 rounded-full object-cover border border-outline-variant/30" alt={rPost.authorId.name} />
                ) : (
                  <div className="w-5.5 h-5.5 rounded-full bg-primary/5 text-primary flex items-center justify-center font-bold text-xs border border-primary/10">
                    {getAvatarFallback(rPost.authorId?.name || '')}
                  </div>
                )}
                <div className="min-w-0">
                  <span className="block font-body-md text-[11px] font-bold text-on-surface truncate leading-none">{rPost.authorId?.name || 'Anonymous'}</span>
                  <span className="block text-[9.5px] text-on-surface-variant font-medium mt-0.5 leading-none">
                    {calculateReadingTime(rPost.htmlContent)} min read
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
