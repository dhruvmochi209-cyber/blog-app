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
      className="relative flex flex-col-reverse md:flex-row overflow-hidden rounded-[2rem] bg-[#f8f9fa] shadow-sm border border-slate-200 group cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-300"
    >
      {/* Text Section (Left half on desktop) */}
      <div className="flex-1 p-6 md:p-10 flex flex-col justify-center z-10">
        <div className="flex gap-3 mb-4">
          {post.category && (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-primary/10 text-primary border border-primary/20">
              {post.category}
            </span>
          )}
          <span className="text-xs font-mono flex items-center gap-1 font-semibold text-slate-500">
            <Clock className="size-3.5" />
            {calculateReadingTime(post.htmlContent)} MIN READ
          </span>
        </div>

        <h1 className="font-headline-md text-2xl md:text-3xl lg:text-4xl font-black mb-4 text-slate-900 group-hover:text-primary transition-colors leading-tight line-clamp-3">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-sm md:text-[15px] line-clamp-2 max-w-2xl mb-8 leading-relaxed text-slate-600 font-medium">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200/60">
          <div className="flex items-center gap-3">
            <Link
              href={`/profile/${author._id || ''}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-3 group/author"
            >
              {author.avatar ? (
                <img
                  src={author.avatar}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  alt={author.name || 'Author'}
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name || 'U')}&background=random`;
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-primary/15 text-primary border-2 border-white shadow-sm">
                  {getAvatarFallback(author.name)}
                </div>
              )}
              <div>
                <div className="text-sm font-bold transition-colors text-slate-800 group-hover/author:text-primary">
                  {author.name || 'Anonymous'}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mt-0.5">{formatDate(post.createdAt)}</div>
              </div>
            </Link>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle(post._id);
            }}
            className="p-3 rounded-full transition-all duration-200 cursor-pointer bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-primary hover:border-primary/30"
          >
            <Bookmark className="size-4" strokeWidth={2.5} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Image Section (Right half on desktop) */}
      {post.coverImage ? (
        <div className="w-full md:w-[45%] lg:w-[50%] h-64 md:h-auto relative shrink-0 overflow-hidden bg-slate-100">
          <img
            src={post.coverImage}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt="Featured Post"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f8f9fa] via-transparent to-transparent opacity-100 hidden md:block w-32" />
        </div>
      ) : (
        <div className="w-full md:w-[45%] lg:w-[50%] h-64 md:h-auto bg-slate-100 flex items-center justify-center border-l border-slate-200">
          <FileText className="size-16 text-slate-300" strokeWidth={1} />
        </div>
      )}
    </motion.section>
  );
}
