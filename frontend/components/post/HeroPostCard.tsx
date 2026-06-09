'use client';

import { motion } from 'framer-motion';
import { Bookmark, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { calculateReadingTime, formatDate, getAvatarFallback } from '@/lib/utils';

interface Author {
  _id: string;
  name: string;
  avatar: string | null;
}

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  category: string;
  htmlContent: string;
  createdAt: string;
  authorId: Author;
}

interface HeroPostCardProps {
  post: Post;
  isBookmarked: boolean;
  onBookmarkToggle: (postId: string) => void;
}

export function HeroPostCard({ post, isBookmarked, onBookmarkToggle }: HeroPostCardProps) {
  const router = useRouter();
  const author = post.authorId || {} as Author;

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, scale: 0.98 },
        show: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
      }}
      onClick={() => router.push(`/feed/${post.slug}`)}
      className="relative overflow-hidden rounded-2xl glass-card group cursor-pointer border border-white/5 hover:border-primary/30 transition-all"
    >
      {post.coverImage ? (
        <div className="aspect-[16/9] md:aspect-[21/9] w-full relative">
          <img
            src={post.coverImage}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt="Featured Post"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/20 to-transparent" />
        </div>
      ) : (
        <div className="aspect-[21/9] w-full bg-surface-container-high flex items-center justify-center">
          <FileText className="size-12 text-on-surface-variant/20" />
        </div>
      )}

      {/* Hero content overlay */}
      <div className={`${post.coverImage ? 'absolute bottom-0 left-0 w-full' : ''} p-6`}>
        <div className="flex gap-3 mb-3">
          {post.category && (
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-mono backdrop-blur-md border border-primary/20 uppercase tracking-widest">
              {post.category}
            </span>
          )}
          <span className="text-on-surface-variant/80 text-xs font-mono flex items-center gap-1">
            <Clock className="size-3" />
            {calculateReadingTime(post.htmlContent)} MIN READ
          </span>
        </div>

        <h1 className="font-headline-md text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-primary transition-colors leading-snug line-clamp-2">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-on-surface-variant text-sm line-clamp-2 max-w-2xl mb-5">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/profile/${author._id || ''}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 group/author"
            >
              {author.avatar ? (
                <img
                  src={author.avatar}
                  className="w-8 h-8 rounded-full object-cover border border-white/10"
                  alt={author.name || 'Author'}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm">
                  {getAvatarFallback(author.name)}
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-on-surface group-hover/author:text-primary transition-colors">
                  {author.name || 'Anonymous'}
                </div>
                <div className="text-xs text-on-surface-variant">{formatDate(post.createdAt)}</div>
              </div>
            </Link>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle(post._id);
            }}
            className="p-2 hover:text-primary hover:bg-white/10 rounded-full transition-all duration-200 cursor-pointer text-on-surface-variant/70 bg-transparent border-0"
          >
            <Bookmark className="size-4" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
