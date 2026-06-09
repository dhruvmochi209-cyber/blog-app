import { Loader2, FileText } from 'lucide-react';
import { PostListItem } from '@/components/dashboard/PostListItem';

export function PostsTable({ 
  posts, 
  loading, 
  transitioningDeleteIds, 
  togglingId, 
  handleToggleStatus, 
  setDeletingPost 
}: any) {
  return (
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
              {posts.map((post: any) => {
                const isTransitioning = transitioningDeleteIds.includes(post._id);

                return (
                  <PostListItem
                    key={post._id}
                    post={post}
                    isTransitioning={isTransitioning}
                    isToggling={togglingId === post._id}
                    onToggleStatus={handleToggleStatus}
                    onDeleteClick={setDeletingPost}
                  />
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
