'use client';

import { motion } from 'framer-motion';
import { Bookmark, Clock, ImageIcon } from 'lucide-react';
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

interface PostGridCardProps {
  post: Post;
  isBookmarked: boolean;
  onBookmarkToggle: (postId: string) => void;
  variant?: 'glass' | 'solid';
}

export function PostGridCard({ post, isBookmarked, onBookmarkToggle, variant = 'glass' }: PostGridCardProps) {
  const router = useRouter();
  const author = post.authorId || {} as Author;
  const readTime = calculateReadingTime(post.htmlContent);
  const formattedDate = formatDate(post.createdAt);

  const isGlass = variant === 'glass';

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } }
      }}
      onClick={() => router.push(`/feed/${post.slug}`)}
      className={
        isGlass 
          ? "glass-card rounded-xl overflow-hidden group cursor-pointer hover:bg-surface-variant/20 transition-all glow-hover flex flex-col"
          : "bg-surface border border-outline-variant/30 hover:border-outline-variant/60 rounded-2xl overflow-hidden flex flex-col group cursor-pointer shadow-xs hover:shadow-md transition-all duration-300"
      }
    >
      {/* Cover Image */}
      {post.coverImage ? (
        <div className={isGlass ? "aspect-video relative overflow-hidden" : "h-48 bg-surface-container-low overflow-hidden relative"}>
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
          />
          {!isGlass && post.category && (
            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md text-on-surface font-label-caps text-sm uppercase tracking-widest font-black px-2.5 py-1 rounded-md shadow-sm">
              {post.category}
            </div>
          )}
        </div>
      ) : (
        !isGlass && (
          <div className="h-48 bg-surface-container-low overflow-hidden relative w-full flex flex-col items-center justify-center text-on-surface-variant/40 group-hover:scale-105 transition-transform duration-500">
            <ImageIcon className="size-10 mb-2 opacity-50" />
            <span className="font-label-caps text-xs uppercase tracking-widest font-bold">No Cover</span>
            {post.category && (
              <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md text-on-surface font-label-caps text-sm uppercase tracking-widest font-black px-2.5 py-1 rounded-md shadow-sm">
                {post.category}
              </div>
            )}
          </div>
        )
      )}

      {/* Card Content */}
      <div className={isGlass ? "p-4 flex flex-col gap-3 flex-1" : "p-5 flex flex-col flex-1"}>
        
        {/* Meta row / Author Info */}
        {isGlass ? (
          <div className="flex justify-between items-center">
            {post.category ? (
              <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">
                {post.category}
              </span>
            ) : (
              <span />
            )}
            <span className="font-mono text-xs text-on-surface-variant">{formattedDate}</span>
          </div>
        ) : (
          <Link href={`/profile/${author._id || ''}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 mb-3 group/author w-fit">
            {author.avatar ? (
              <img src={author.avatar} alt={author.name} className="w-6 h-6 rounded-full object-cover shadow-xs group-hover/author:border-primary border border-transparent transition-colors" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs group-hover/author:opacity-80 transition-opacity">
                {getAvatarFallback(author.name)}
              </div>
            )}
            <span className="text-xs font-semibold text-on-surface-variant truncate group-hover/author:text-primary transition-colors">{author.name || 'Unknown'}</span>
          </Link>
        )}

        {/* Title & Excerpt */}
        <h3 className={isGlass ? "font-headline-md text-base font-bold text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-2" : "font-headline-md text-[17px] font-bold text-on-surface leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2"}>
          {post.title}
        </h3>
        
        <p className={isGlass ? "text-on-surface-variant text-sm line-clamp-3 leading-relaxed mb-1" : "font-body-md text-sm text-on-surface-variant line-clamp-2 mb-4 flex-1 font-light"}>
          {post.excerpt || (isGlass ? 'No description provided.' : '')}
        </p>

        {/* Footer */}
        <div className={isGlass ? "pt-3 border-t border-white/5 flex items-center justify-between mt-auto" : "flex items-center justify-between text-sm font-label-caps font-bold tracking-widest uppercase text-on-surface-variant mt-auto pt-4 border-t border-outline-variant/20"}>
          {isGlass ? (
            <div className="flex items-center gap-3">
              <Link
                href={`/profile/${author._id || ''}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 group/author"
              >
                {author.avatar ? (
                  <img src={author.avatar} className="w-5 h-5 rounded-full object-cover border border-white/10" alt={author.name} />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {getAvatarFallback(author.name)}
                  </div>
                )}
                <span className="text-xs text-on-surface-variant group-hover/author:text-primary transition-colors">
                  {author.name || 'Anonymous'}
                </span>
              </Link>
              <span className="text-xs text-on-surface-variant/50 flex items-center gap-1">
                <Clock className="size-3" /> {readTime} min
              </span>
            </div>
          ) : (
            <span>{formattedDate}</span>
          )}

          {isGlass ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmarkToggle(post._id);
              }}
              className={`p-1.5 hover:text-primary hover:bg-white/10 rounded-full transition-all duration-200 cursor-pointer ${
                isBookmarked ? 'text-primary' : 'text-on-surface-variant/60'
              }`}
            >
              <Bookmark className="size-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span>{readTime} MIN READ</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmarkToggle(post._id);
                }}
                className="p-1 hover:text-primary hover:bg-surface-container rounded-full transition-all duration-200 cursor-pointer bg-transparent border-0 flex items-center justify-center -mr-1"
              >
                <Bookmark className="size-4" fill={isBookmarked ? "currentColor" : "none"} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
