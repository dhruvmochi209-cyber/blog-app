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
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/60 to-gray-900/10" />
        </div>
      ) : (
        <div className="aspect-[21/9] w-full bg-surface-container-high flex items-center justify-center">
          <FileText className="size-12 text-on-surface-variant/20" />
        </div>
      )}

      {/* Hero content overlay */}
      <div className={`${post.coverImage ? 'absolute bottom-0 left-0 w-full' : ''} p-6 md:p-8 z-10`}>
        <div className="flex gap-3 mb-3">
          {post.category && (
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase ${post.coverImage ? 'bg-primary text-white' : 'bg-primary/20 text-primary border border-primary/20'}`}>
              {post.category}
            </span>
          )}
          <span className={`text-xs font-mono flex items-center gap-1 font-medium ${post.coverImage ? 'text-white/90' : 'text-on-surface-variant/80'}`}>
            <Clock className="size-3" />
            {calculateReadingTime(post.htmlContent)} MIN READ
          </span>
        </div>

        <h1 className={`font-headline-md text-2xl md:text-3xl lg:text-4xl font-black mb-3 transition-colors leading-snug line-clamp-2 ${post.coverImage ? 'text-white group-hover:text-primary-100' : 'text-on-surface group-hover:text-primary'}`}>
          {post.title}
        </h1>

        {post.excerpt && (
          <p className={`text-sm md:text-base line-clamp-2 max-w-2xl mb-6 leading-relaxed ${post.coverImage ? 'text-white/80' : 'text-on-surface-variant'}`}>
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/profile/${author._id || ''}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-3 group/author"
            >
              {author.avatar ? (
                <img
                  src={author.avatar}
                  className={`w-9 h-9 rounded-full object-cover border-2 ${post.coverImage ? 'border-white/20' : 'border-outline-variant'}`}
                  alt={author.name || 'Author'}
                />
              ) : (
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${post.coverImage ? 'bg-white/20 text-white' : 'bg-primary/15 text-primary'}`}>
                  {getAvatarFallback(author.name)}
                </div>
              )}
              <div>
                <div className={`text-sm font-bold transition-colors ${post.coverImage ? 'text-white group-hover/author:text-primary-100' : 'text-on-surface group-hover/author:text-primary'}`}>
                  {author.name || 'Anonymous'}
                </div>
                <div className={`text-xs ${post.coverImage ? 'text-white/60' : 'text-on-surface-variant'}`}>{formatDate(post.createdAt)}</div>
              </div>
            </Link>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle(post._id);
            }}
            className={`p-2.5 rounded-full transition-all duration-200 cursor-pointer border-0 ${post.coverImage ? 'text-white/80 hover:text-white hover:bg-white/20' : 'text-on-surface-variant/70 hover:text-primary hover:bg-surface-variant'}`}
          >
            <Bookmark className="size-4.5" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
