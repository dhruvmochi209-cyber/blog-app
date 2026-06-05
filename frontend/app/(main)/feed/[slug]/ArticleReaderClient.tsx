'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, Bookmark, Share2, Clock, Calendar, Type, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import TopNavBar from '@/components/layout/TopNavBar';
import SideNavBar from '@/components/layout/SideNavBar';
import { DetailsPageSkeleton } from '@/components/ui/skeleton';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface Author {
  _id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface Post {
  _id: string;
  title: string;
  slug: string;
  htmlContent: string;
  category?: string;
  excerpt?: string;
  coverImage?: string;
  seoKeywords?: string;
  views: number;
  authorId?: Author;
  createdAt: string;
}

interface HeadingItem {
  id: string;
  text: string;
  level: string;
}

export default function ArticleReaderClient({ initialPost, slug }: { initialPost: Post | null; slug: string }) {
  const router = useRouter();
  const { user, toggleBookmark, accessToken } = useAuth();

  const [post, setPost] = useState<Post | null>(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  
  // Related posts state
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  // Dynamic Scroll Progress Tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch / Sync view updates & latest details on mount
  useEffect(() => {
    const fetchLatestDetails = async () => {
      if (!initialPost) {
        setLoading(true);
      }
      setError('');
      try {
        const headers: any = {};
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }
        const res = await fetch(`${API}/posts/${slug}`, { headers });
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          setPost(data.data);
        } else {
          throw new Error(data.message || 'Article not found');
        }
      } catch (err: any) {
        if (!initialPost) {
          setError(err.message || 'Article not found');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLatestDetails();
  }, [slug, accessToken, initialPost]);

  // Fetch Related Blogs
  useEffect(() => {
    const fetchRelated = async (postId: string) => {
      setRelatedLoading(true);
      try {
        const res = await fetch(`${API}/posts/${postId}/related?limit=3`);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          setRelatedPosts(data.data);
        }
      } catch (err) {
        console.error('Failed to load related posts:', err);
      } finally {
        setRelatedLoading(false);
      }
    };
    if (post?._id) {
      fetchRelated(post._id);
    }
  }, [post?._id]);

  // Parse Table of Contents Headings
  useEffect(() => {
    if (post?.htmlContent) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(post.htmlContent, 'text/html');
      const headingElements = doc.querySelectorAll('h2, h3');
      const items: HeadingItem[] = [];
      
      headingElements.forEach((el, idx) => {
        const text = el.textContent || '';
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        items.push({
          id: id || `heading-${idx}`,
          text,
          level: el.tagName.toLowerCase(),
        });
      });
      setHeadings(items);
    }
  }, [post?.htmlContent]);

  // IntersectionObserver to Highlight Active Section in Table of Contents
  useEffect(() => {
    if (headings.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -70% 0px', // Trigger when heading is in top portion of screen
      threshold: 0,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveHeadingId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => {
      headings.forEach((heading) => {
        const el = document.getElementById(heading.id);
        if (el) observer.unobserve(el);
      });
    };
  }, [headings]);

  // Inject IDs into HTML Headings for Table of Contents Navigation
  const getProcessedHtml = (html: string) => {
    if (typeof window === 'undefined') return html;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headingElements = doc.querySelectorAll('h2, h3');
    
    headingElements.forEach((el, idx) => {
      const text = el.textContent || '';
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      el.setAttribute('id', id || `heading-${idx}`);
    });
    return doc.body.innerHTML;
  };

  // Inject Copy-to-Clipboard buttons on Code Blocks
  useEffect(() => {
    if (!post) return;
    const preBlocks = document.querySelectorAll('.tiptap pre');
    preBlocks.forEach((pre) => {
      if (pre.querySelector('.copy-code-btn')) return;

      pre.classList.add('relative', 'group/code');

      const button = document.createElement('button');
      button.className = 'copy-code-btn absolute top-3 right-3 opacity-0 group-hover/code:opacity-100 bg-surface-container-high/90 hover:bg-primary/10 hover:text-primary border border-outline-variant/30 text-on-surface-variant rounded-md px-2 py-1.5 text-xs font-semibold select-none transition-all duration-200 shadow-xs flex items-center gap-1 cursor-pointer';
      button.style.zIndex = '10';
      button.innerHTML = `
        <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <span>Copy</span>
      `;

      button.addEventListener('click', async () => {
        const code = pre.querySelector('code')?.textContent || '';
        try {
          await navigator.clipboard.writeText(code);
          button.innerHTML = `
            <svg class="size-3.5" style="color: #10b981" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span style="color: #10b981" class="font-semibold">Copied!</span>
          `;
          setTimeout(() => {
            button.innerHTML = `
              <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy</span>
            `;
          }, 2000);
        } catch (err) {
          console.error('Failed to copy code:', err);
        }
      });

      pre.appendChild(button);
    });
  }, [post]);

  const handleDownloadPDF = async () => {
    if (pdfDownloading || !post) return;
    setPdfDownloading(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: ArticlePDF } = await import('@/components/elements/ArticlePDF');
      
      const blob = await pdf(<ArticlePDF post={post} authorName={post.authorId?.name || 'Anonymous'} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${post.slug}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setPdfDownloading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAvatarFallback = (name: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const calculateReadingTime = (htmlStr: string) => {
    if (!htmlStr) return 1;
    const text = htmlStr.replace(/<\/?[^>]+(>|$)/g, '');
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes || 1;
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  // Font size multiplier class mapping
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large':
        return 'text-xl md:text-2xl leading-relaxed font-serif';
      case 'xlarge':
        return 'text-2xl md:text-3xl leading-loose font-serif';
      default:
        return 'text-lg leading-relaxed font-serif';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary-container selection:text-on-primary-container transition-colors duration-300">
      <TopNavBar />

      {/* Dynamic Reading Progress Bar */}
      <div className="fixed top-[61px] left-0 right-0 h-0.5 bg-outline-variant/20 z-50">
        <div className="h-full bg-primary transition-all duration-75" style={{ width: `${scrollProgress}%` }} />
      </div>
      
      <div className="flex-1 flex w-full">
        <SideNavBar />
        
        <main className="flex-1 flex justify-center py-10 px-margin-mobile md:px-margin-desktop relative bg-background">
          
          {/* Back Navigation Button */}
          <Link 
            href="/feed" 
            id="postreader-back-btn"
            className="absolute top-8 left-6 md:top-10 md:left-12 inline-flex items-center gap-2 font-label-caps text-xs font-bold uppercase tracking-wider text-secondary hover:text-on-surface transition-all duration-200 cursor-pointer group"
          >
            <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Feed
          </Link>

          <div className="w-full max-w-[1080px] pt-12 flex gap-12 justify-center">
            
            {loading ? (
              <DetailsPageSkeleton />
            ) : error ? (
              <div className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-12 text-center space-y-6 editorial-shadow mx-auto mt-12">
                <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center mx-auto text-error shadow-xs">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </div>
                <div className="space-y-2">
                  <h1 className="font-headline-md text-xl font-black uppercase tracking-tight text-on-surface">Article Not Found</h1>
                  <p className="font-body-md text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                    {error === 'Post not found.' 
                      ? 'The story you are looking for might have been moved, deleted, or is currently saved as a draft.'
                      : error}
                  </p>
                </div>
                <Link href="/feed" className="inline-flex bg-primary text-on-primary font-label-caps text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs">
                  Return to Feed
                </Link>
              </div>
            ) : post ? (
              <>
                {/* Left Column: Article Content */}
                <div className="w-full max-w-[720px] shrink-1">
                  <motion.article 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-8 pb-20"
                  >
                    
                    {/* Header Category Tag & Font Controls */}
                    <div className="flex justify-between items-center">
                      {post.category ? (
                        <span className="inline-block px-3 py-1 bg-surface-container border border-outline-variant/30 text-on-surface rounded-full text-[10px] font-bold uppercase tracking-widest font-label-caps select-none">
                          {post.category}
                        </span>
                      ) : (
                        <span />
                      )}
                      
                      {/* Premium Text Resizer Widget */}
                      <div className="font-controls-widget flex items-center gap-1.5 bg-surface-container-low border border-outline-variant/50 rounded-full p-1 shadow-xs">
                        <button
                          onClick={() => setFontSize('normal')}
                          className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all active:scale-95 ${fontSize === 'normal' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                          title="Default Text"
                        >
                          A
                        </button>
                        <button
                          onClick={() => setFontSize('large')}
                          className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all active:scale-95 ${fontSize === 'large' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                          title="Large Text"
                        >
                          A+
                        </button>
                        <button
                          onClick={() => setFontSize('xlarge')}
                          className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all active:scale-95 ${fontSize === 'xlarge' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                          title="Extra Large Text"
                        >
                          A++
                        </button>
                      </div>
                    </div>

                    {/* Article Title */}
                    <h1 className="font-display-xl text-3xl md:text-4xl lg:text-5xl font-black text-on-surface leading-[1.1] tracking-tight">
                      {post.title}
                    </h1>

                    {/* Author Profile Metadata Row */}
                    <div className="flex items-center justify-between border-y border-outline-variant/30 py-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/profile/${post.authorId?._id || ''}`} className="flex items-center gap-3 group/author">
                          {post.authorId?.avatar ? (
                            <img 
                              src={post.authorId.avatar} 
                              className="w-10 h-10 rounded-full object-cover border border-outline-variant/20 group-hover/author:border-primary transition-colors" 
                              alt={post.authorId.name || 'Author'} 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center font-bold text-sm border border-primary/10 group-hover/author:border-primary transition-colors select-none">
                              {getAvatarFallback(post.authorId?.name || '')}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-body-md text-sm text-on-surface font-semibold group-hover/author:text-primary transition-colors">{post.authorId?.name || 'Anonymous'}</span>
                              {post.authorId?.role === 'CREATOR' && (
                                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold font-label-caps uppercase select-none">Creator</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2.5 text-xs text-on-surface-variant font-medium mt-0.5">
                              <span className="flex items-center gap-1"><Calendar className="size-3" /> {formatDate(post.createdAt)}</span>
                              <span className="text-on-surface-variant/40 select-none">·</span>
                              <span className="flex items-center gap-1"><Clock className="size-3" /> {calculateReadingTime(post.htmlContent)} min read</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Optional Cover Image Banner */}
                    {post.coverImage && (
                      <div className="w-full aspect-[2/1] overflow-hidden rounded-xl border border-outline-variant/35 bg-surface-container-low shadow-sm">
                        <img 
                          src={post.coverImage} 
                          className="w-full h-full object-cover animate-in zoom-in-95 duration-500" 
                          alt={post.title} 
                        />
                      </div>
                    )}

                    {/* Rich-Text Content Column with Dynamic Text Resizing */}
                    <div className={`tiptap text-on-surface/90 pt-4 prose prose-zinc max-w-none ${getFontSizeClass()}`}>
                      <div dangerouslySetInnerHTML={{ __html: getProcessedHtml(post.htmlContent) }} />
                    </div>

                    {/* Premium Floating Interaction Dock */}
                    <motion.div 
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface/85 backdrop-blur-md border border-outline-variant/50 rounded-full px-6 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center gap-6 z-40 transition-all hover:border-outline duration-300"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant select-none">
                        <Eye className="size-4 text-secondary" />
                        <span>{post.views || 0} views</span>
                      </div>
                      
                      <div className="w-px h-4 bg-outline-variant/40" />
                      
                      <button 
                        onClick={() => {
                          if (user) toggleBookmark(post._id);
                          else router.push('/login');
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer bg-transparent border-0 outline-none"
                      >
                        <Bookmark className="size-4" fill={user?.bookmarks?.includes(post._id) ? "currentColor" : "none"} />
                        <span>{user?.bookmarks?.includes(post._id) ? 'Saved' : 'Save'}</span>
                      </button>
                      
                      <div className="w-px h-4 bg-outline-variant/40" />
                      
                      <button 
                        onClick={handleShare}
                        className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer bg-transparent border-0 outline-none"
                      >
                        <Share2 className="size-4" />
                        <span>Share</span>
                      </button>
                      
                      <div className="w-px h-4 bg-outline-variant/40" />
                      
                      <button 
                        onClick={handleDownloadPDF}
                        disabled={pdfDownloading}
                        className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary disabled:opacity-60 transition-colors cursor-pointer bg-transparent border-0 outline-none"
                        title="Export Article to PDF"
                      >
                        {pdfDownloading ? (
                          <Loader2 className="size-4 animate-spin text-primary" />
                        ) : (
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        <span>{pdfDownloading ? 'Exporting...' : 'PDF'}</span>
                      </button>
                    </motion.div>

                  </motion.article>

                  {/* Related Narratives Section */}
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
                        {relatedPosts.map((rPost, index) => (
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
                </div>

                {/* Right Column: Sticky Table of Contents Sidebar */}
                {headings.length > 0 && (
                  <aside className="hidden lg:block w-[240px] xl:w-[280px] shrink-0">
                    <div className="sticky top-24 space-y-6 bg-surface-container-lowest/30 border border-outline-variant/40 rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] backdrop-blur-xs">
                      <h4 className="font-label-caps text-xs text-on-surface font-bold uppercase tracking-widest pb-3 border-b border-outline-variant/30">
                        Table of Contents
                      </h4>
                      <ul className="space-y-3.5 text-xs max-h-[calc(100vh-280px)] overflow-y-auto no-scrollbar scroll-smooth pr-1">
                        {headings.map((heading) => {
                          const isH3 = heading.level === 'h3';
                          const isActive = activeHeadingId === heading.id;
                          return (
                            <li 
                              key={heading.id} 
                              className={`${isH3 ? 'pl-4' : ''} transition-all duration-200`}
                            >
                              <a
                                href={`#${heading.id}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  document.getElementById(heading.id)?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start',
                                  });
                                }}
                                className={`group flex items-start gap-1.5 py-0.5 leading-normal transition-all duration-200 hover:text-primary ${
                                  isActive 
                                    ? 'text-primary font-bold' 
                                    : 'text-on-surface-variant font-medium'
                                }`}
                              >
                                <ChevronRight 
                                  className={`size-3.5 mt-0.5 shrink-0 transition-all duration-200 ${
                                    isActive 
                                      ? 'opacity-100 translate-x-0 text-primary' 
                                      : 'opacity-0 -translate-x-1 text-on-surface-variant group-hover:opacity-60 group-hover:translate-x-0'
                                  }`} 
                                />
                                <span className="truncate">{heading.text}</span>
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                      
                      {/* Sticky Footer Info */}
                      <div className="border-t border-outline-variant/30 pt-4 flex items-center justify-between text-[10px] text-on-surface-variant font-medium select-none">
                        <span className="flex items-center gap-1"><Clock className="size-3" /> {calculateReadingTime(post.htmlContent)} min read</span>
                        <span>{headings.length} sections</span>
                      </div>
                    </div>
                  </aside>
                )}
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
