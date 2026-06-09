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
    <tr
      className={`hover:bg-surface-container-low/60 transition-all duration-300 ${
        isTransitioning ? 'opacity-0 scale-98 select-none pointer-events-none' : ''
      }`}
    >
      {/* Title & Excerpt */}
      <td className="px-6 py-4.5 min-w-[280px]">
        <div className="flex flex-col gap-1">
          <Link
            href={`/feed/${post.slug}`}
            className="font-headline-md text-[14.5px] font-bold text-on-surface line-clamp-1 hover:text-primary transition-colors leading-tight"
          >
            {post.title}
          </Link>
          <span className="font-body-md text-xs text-on-surface-variant line-clamp-1 font-light leading-normal">
            {post.excerpt || 'No summary description provided.'}
          </span>
        </div>
      </td>

      {/* Category */}
      <td className="hidden sm:table-cell px-6 py-4.5 whitespace-nowrap">
        <span className="px-2.5 py-0.5 bg-surface-container border border-outline-variant/30 text-on-surface text-[10px] rounded-full font-label-caps font-bold tracking-wider uppercase">
          {post.category || 'Uncategorized'}
        </span>
      </td>

      {/* Views */}
      <td className="hidden xs:table-cell px-6 py-4.5 whitespace-nowrap text-center">
        <span className="font-body-md text-xs text-on-surface-variant font-semibold flex items-center justify-center gap-1.5">
          <Eye className="size-3.5 text-secondary/60" />
          {(post.views || 0).toLocaleString()}
        </span>
      </td>

      {/* Last Updated */}
      <td className="hidden md:table-cell px-6 py-4.5 whitespace-nowrap">
        <span className="font-body-md text-xs text-on-surface-variant font-medium">
          {formatRelativeTime(post.updatedAt)}
        </span>
      </td>

      {/* Switch Status Button */}
      <td className="px-6 py-4.5 whitespace-nowrap text-center">
        <div className="flex items-center justify-center gap-2.5">
          <button
            onClick={() => onToggleStatus(post._id, post.status)}
            disabled={isToggling}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-outline-variant/30 transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-60 select-none items-center ${
              post.status === 'PUBLISHED' ? 'bg-primary' : 'bg-surface-container-high'
            }`}
            title={`Switch to ${post.status === 'PUBLISHED' ? 'Draft' : 'Publish'}`}
          >
            <span
              className={`pointer-events-none relative inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out flex items-center justify-center ${
                post.status === 'PUBLISHED' ? 'translate-x-4.5' : 'translate-x-0.5'
              }`}
            >
              {isToggling && (
                <Loader2 className="animate-spin text-primary size-2" />
              )}
            </span>
          </button>
          <span
            className={`font-label-caps text-[9px] uppercase font-bold tracking-wider select-none w-14 text-left ${
              post.status === 'PUBLISHED' ? 'text-primary' : 'text-on-surface-variant/80'
            }`}
          >
            {post.status}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4.5 whitespace-nowrap text-center">
        <div className="flex items-center justify-center gap-1">
          <Link
            href={`/edit/${post._id}`}
            className="p-1.5 hover:bg-surface-container text-on-surface-variant hover:text-primary rounded-lg transition-colors cursor-pointer active:scale-90 flex items-center justify-center"
            title="Edit publication"
          >
            <Edit className="size-4" />
          </Link>
          <button
            onClick={() => onDeleteClick(post)}
            className="p-1.5 hover:bg-error-container/20 text-on-surface-variant hover:text-error rounded-lg transition-colors cursor-pointer active:scale-90 flex items-center justify-center"
            title="Delete publication"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
