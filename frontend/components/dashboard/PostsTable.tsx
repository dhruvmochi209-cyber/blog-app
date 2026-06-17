import { Loader2, FileText } from 'lucide-react';
import { PostListItem } from '@/components/dashboard/PostListItem';
import { PostsTableSkeleton } from '@/components/ui/skeleton';

export function PostsTable({ 
  posts, 
  loading, 
  transitioningDeleteIds, 
  togglingId, 
  handleToggleStatus, 
  setDeletingPost 
}: any) {
  return (
    <div className="flex flex-col gap-4 mt-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display-md text-xl font-bold text-on-surface select-none">
          Recent Stories
        </h2>
        <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
          {posts.length} {posts.length === 1 ? 'Entry' : 'Entries'}
        </span>
      </div>

      <div className="w-full flex flex-col gap-3">
        {loading ? (
          <PostsTableSkeleton count={4} />
        ) : posts.length === 0 ? (
          <div className="py-24 text-center space-y-4 px-4 bg-surface-container-low rounded-3xl border border-outline-variant/20">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto shadow-sm">
              <FileText className="size-6 text-on-surface-variant" />
            </div>
            <div className="space-y-2">
              <p className="font-headline-md text-lg font-bold text-on-surface tracking-tight">Your workspace is empty</p>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed max-w-sm mx-auto">
                Start your writing journey. Click "New Story" to create your first draft.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
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
          </div>
        )}
      </div>
    </div>
  );
}
