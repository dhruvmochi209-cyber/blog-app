'use client';

import Link from 'next/link';
import { Eye, Loader2, Edit, Trash2 } from 'lucide-react';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: string;
  views: number;
  updatedAt: string;
}

interface PostListItemProps {
  post: Post;
  isTransitioning: boolean;
  isToggling: boolean;
  onToggleStatus: (postId: string, currentStatus: string) => void;
  onDeleteClick: (post: Post) => void;
}

export function PostListItem({
  post,
  isTransitioning,
  isToggling,
  onToggleStatus,
  onDeleteClick
}: PostListItemProps) {
  // Simple relative time formatter
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className={`bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 hover:border-outline-variant/60 hover:shadow-md transition-all duration-300 ${
        isTransitioning ? 'opacity-0 scale-95 select-none pointer-events-none' : ''
      }`}
    >
      {/* Left side: Title, Excerpt, Category, Time */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Link
            href={`/feed/${post.slug}`}
            className="font-headline-md text-base sm:text-lg font-bold text-on-surface truncate hover:text-primary transition-colors"
          >
            {post.title}
          </Link>
          <span className="shrink-0 px-2.5 py-0.5 bg-surface-container border border-outline-variant/30 text-on-surface text-xs rounded-md font-label-caps font-bold tracking-wider uppercase hidden sm:inline-block">
            {post.category || 'Uncategorized'}
          </span>
        </div>
        
        <p className="font-body-md text-sm text-on-surface-variant line-clamp-1 font-light pr-4">
          {post.excerpt || 'No summary description provided.'}
        </p>

        <div className="flex items-center gap-4 mt-1">
          <span className="font-body-md text-sm font-semibold text-on-surface-variant flex items-center gap-1.5 uppercase tracking-widest">
            <Eye className="size-3.5" />
            {(post.views || 0).toLocaleString()} Views
          </span>
          <span className="w-1 h-1 rounded-full bg-outline-variant/50" />
          <span className="font-body-md text-sm text-on-surface-variant/80 font-medium">
            Updated {formatRelativeTime(post.updatedAt)}
          </span>
        </div>
      </div>

      {/* Right side: Status toggle & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-[240px] shrink-0 border-t border-outline-variant/20 sm:border-t-0 pt-4 sm:pt-0">
        
        {/* Switch Status Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleStatus(post._id, post.status)}
            disabled={isToggling}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-outline-variant/30 transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-60 select-none items-center ${
              post.status === 'PUBLISHED' ? 'bg-primary border-primary' : 'bg-surface-container-high'
            }`}
            title={`Switch to ${post.status === 'PUBLISHED' ? 'Draft' : 'Publish'}`}
          >
            <span
              className={`pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out flex items-center justify-center ${
                post.status === 'PUBLISHED' ? 'translate-x-6' : 'translate-x-1'
              }`}
            >
              {isToggling && (
                <Loader2 className="animate-spin text-primary size-3" />
              )}
            </span>
          </button>
          <span
            className={`font-label-caps text-xs uppercase font-bold tracking-wider select-none w-16 text-left ${
              post.status === 'PUBLISHED' ? 'text-primary' : 'text-on-surface-variant/80'
            }`}
          >
            {post.status}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Link
            href={`/edit/${post._id}`}
            className="p-2 bg-surface-container hover:bg-surface-variant text-on-surface-variant hover:text-primary rounded-xl transition-colors cursor-pointer active:scale-95 flex items-center justify-center border border-outline-variant/20"
            title="Edit publication"
          >
            <Edit className="size-4" />
          </Link>
          <button
            onClick={() => onDeleteClick(post)}
            className="p-2 bg-surface-container hover:bg-error-container/40 text-on-surface-variant hover:text-error rounded-xl transition-colors cursor-pointer active:scale-95 flex items-center justify-center border border-outline-variant/20"
            title="Delete publication"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
