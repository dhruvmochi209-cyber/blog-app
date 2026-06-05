'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Cloud,
  WifiOff,
  AlertTriangle,
  MoreHorizontal,
  Home,
  Save,
  Check,
  Bell,
  Link as LinkIcon,
  FolderOpen,
  Image as ImageIcon,
  ImagePlus,
  FileText,
  Tag,
  Edit3,
  X,
  Plus,
  Clock,
  ArrowRight,
  Eye,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useFormCacheStore } from '@/lib/form-store';
import ProfileDropdown from '@/components/layout/ProfileDropdown';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Dynamically import TipTap editor (it uses browser APIs)
const RichEditor = dynamic(() => import('@/components/editor/RichEditor'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[40vh] flex items-center justify-center text-on-surface-variant text-sm gap-2">
      <Loader2 className="animate-spin size-4 text-primary" />
      Loading editor workspace...
    </div>
  ),
});

const CATEGORIES = [
  'Engineering',
  'Design',
  'Product',
  'AI & Machine Learning',
  'DevOps',
  'Career',
  'Open Source',
  'Startups',
  'Culture',
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

type BlockType = 'category' | 'coverImage' | 'excerpt' | 'keywords' | 'content';

export default function WritePage() {
  const { user, accessToken, refreshUser } = useAuth();
  const router = useRouter();
  const titleInputRef = useRef<HTMLInputElement>(null);

  // ── Form State ──
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [keywords, setKeywords] = useState('');
  const [content, setContent] = useState('');

  // ── Block State ──
  const [activeBlocks, setActiveBlocks] = useState<BlockType[]>([]);
  const [showToolbar, setShowToolbar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Publish States ──
  const [publishing, setPublishing] = useState(false);
  const publishingRef = useRef(false);
  const [showPreview, setShowPreview] = useState(false);
  const [createdPost, setCreatedPost] = useState<any>(null);

  // ── Auto-Save and Draft States ──
  const [postId, setPostId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'offline_saved' | 'error'>('idle');
  const [showManualSavedTick, setShowManualSavedTick] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const lastSavedRef = useRef<string>('');
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close more menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMoreMenu]);

  // ── Database Fetch Draft Routine ──
  const fetchPostFromDatabase = async (id: string) => {
    if (!accessToken) return;
    setSyncStatus('saving');
    try {
      const res = await fetch(`${API_BASE}/posts/${id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const resData = await res.json();

      if (resData.success) {
        const post = resData.data;
        setPostId(post._id);
        setTitle(post.title || '');
        setCategory(post.category || '');
        setCoverImage(post.coverImage || '');
        setExcerpt(post.excerpt || '');
        setKeywords(post.seoKeywords || '');
        setContent(post.htmlContent || '');

        // Reconstruct active blocks dynamically based on database properties
        const blocks: BlockType[] = [];
        if (post.category) blocks.push('category');
        if (post.coverImage) blocks.push('coverImage');
        if (post.excerpt) blocks.push('excerpt');
        if (post.seoKeywords) blocks.push('keywords');
        if (post.htmlContent) blocks.push('content');
        setActiveBlocks(blocks);

        lastSavedRef.current = JSON.stringify({
          title: post.title || '',
          category: post.category || '',
          coverImage: post.coverImage || '',
          excerpt: post.excerpt || '',
          keywords: post.seoKeywords || '',
          content: post.htmlContent || '',
        });
        setSyncStatus('saved');
      } else {
        setErrors({ submit: resData.message || 'Failed to load article draft.' });
        setSyncStatus('error');
      }
    } catch (err) {
      console.error(err);
      setErrors({ submit: 'Failed to connect to backend server. Draft could not be loaded.' });
      setSyncStatus('error');
    }
  };

  // Load draft on mount (priority: query param id > localStorage backup)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');

      if (id) {
        if (accessToken) {
          fetchPostFromDatabase(id);
        }
      } else {
        // Restore from Zustand Form Cache automatically
        const cached = useFormCacheStore.getState();
        if (cached.title || cached.content || cached.excerpt || cached.category) {
          setPostId(cached.postId);
          setTitle(cached.title);
          setCategory(cached.category);
          setCoverImage(cached.coverImage);
          setExcerpt(cached.excerpt);
          setKeywords(cached.keywords);
          setContent(cached.content);
          setActiveBlocks(cached.activeBlocks as BlockType[]);
          lastSavedRef.current = JSON.stringify({
            title: cached.title,
            category: cached.category,
            coverImage: cached.coverImage,
            excerpt: cached.excerpt,
            keywords: cached.keywords,
            content: cached.content,
          });
          setSyncStatus('saved');
        }
      }
    }
  }, [accessToken]);

  // Auto-generated slug
  const slug = useMemo(() => slugify(title), [title]);

  // Keyword chips for display
  const keywordChips = useMemo(
    () => keywords.split(',').map(k => k.trim()).filter(Boolean),
    [keywords]
  );

  // Reading time calculator
  const readingTime = useMemo(() => {
    const text = content.replace(/<[^>]*>/g, ''); // strip html tags
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [content]);

  const handleBlockAction = (blockType: BlockType) => {
    if (activeBlocks.includes(blockType)) {
      setShowToolbar(false);
      const el = document.getElementById(`block-card-${blockType}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-primary/45');
        setTimeout(() => el.classList.remove('ring-2', 'ring-primary/45'), 1500);
      }
      const inputEl = document.getElementById(`input-${blockType}`);
      if (inputEl) {
        inputEl.focus();
      }
      return;
    }

    setActiveBlocks([...activeBlocks, blockType]);
    setShowToolbar(false);

    if (errors[`block_${blockType}`]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[`block_${blockType}`];
        return next;
      });
    }

    setTimeout(() => {
      const el = document.getElementById(`input-${blockType}`);
      if (el) el.focus();
    }, 100);
  };

  const deleteBlock = (blockType: BlockType) => {
    setActiveBlocks(activeBlocks.filter(b => b !== blockType));
    setErrors(prev => {
      const next = { ...prev };
      delete next[blockType];
      delete next[`block_${blockType}`];
      return next;
    });
  };

  // ── Aligned Zod Validation ──
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title is too short (must be at least 5 characters)';
    } else if (title.trim().length > 200) {
      newErrors.title = 'Title is too long (cannot exceed 200 characters)';
    }

    const required: BlockType[] = ['category', 'coverImage', 'excerpt', 'keywords', 'content'];
    required.forEach(req => {
      if (!activeBlocks.includes(req)) {
        newErrors[`block_${req}`] = `This workspace requires the ${req === 'content' ? 'Rich Content' : req.replace(/([A-Z])/g, ' $1')} block to be added.`;
      }
    });

    if (activeBlocks.includes('category')) {
      if (!category) {
        newErrors.category = 'Please select a category';
      } else if (category.length < 2 || category.length > 50) {
        newErrors.category = 'Category must be between 2 and 50 characters';
      }
    }

    if (activeBlocks.includes('coverImage')) {
      if (!coverImage.trim()) {
        newErrors.coverImage = 'Cover image URL is required';
      } else {
        try {
          new URL(coverImage.trim());
        } catch {
          newErrors.coverImage = 'Please enter a valid cover image URL (e.g. https://...)';
        }
      }
    }

    if (activeBlocks.includes('excerpt')) {
      if (!excerpt.trim()) {
        newErrors.excerpt = 'Excerpt is required';
      } else if (excerpt.trim().length < 10) {
        newErrors.excerpt = 'Excerpt is too short (must be at least 10 characters)';
      } else if (excerpt.trim().length > 500) {
        newErrors.excerpt = 'Excerpt is too long (cannot exceed 500 characters)';
      }
    }

    if (activeBlocks.includes('keywords')) {
      if (!keywords.trim()) {
        newErrors.keywords = 'SEO keywords are required';
      } else if (keywords.trim().length > 500) {
        newErrors.keywords = 'SEO keywords string cannot exceed 500 characters';
      }
    }

    if (activeBlocks.includes('content')) {
      const textOnly = content.replace(/<[^>]*>/g, '').trim();
      if (!content.trim() || content === '<p></p>') {
        newErrors.content = 'Content is required';
      } else if (textOnly.length < 10) {
        newErrors.content = 'Content is too short (must be at least 10 characters)';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.title) {
        titleInputRef.current?.focus();
      } else {
        const firstErrorBlock = required.find(req => newErrors[req] || newErrors[`block_${req}`]);
        if (firstErrorBlock && activeBlocks.includes(firstErrorBlock)) {
          const cardEl = document.getElementById(`block-card-${firstErrorBlock}`);
          if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const inputEl = document.getElementById(`input-${firstErrorBlock}`);
          if (inputEl) inputEl.focus();
        }
      }
      return false;
    }
    return true;
  };

  // ── API Publish Hook ──
  const handlePublish = async () => {
    if (publishingRef.current) return;
    if (!validate()) return;
    publishingRef.current = true;
    setPublishing(true);
    setSyncStatus('saving');

    try {
      const url = postId ? `${API_BASE}/posts/${postId}` : `${API_BASE}/posts`;
      const method = postId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title,
          htmlContent: content,
          category,
          excerpt,
          coverImage,
          seoKeywords: keywords,
          status: 'PUBLISHED',
        }),
      });

      const resData = await res.json();

      if (resData.success) {
        setCreatedPost(resData.data);
        setShowPreview(true);
        setSyncStatus('saved');

        if (typeof window !== 'undefined') {
          localStorage.removeItem('writen_offline_draft');
        }

        useFormCacheStore.getState().clearCache();

        if (resData.roleUpgraded) {
          await refreshUser();
        }
      } else {
        setSyncStatus('error');
        if (resData.errors && Array.isArray(resData.errors)) {
          const newErrors: Record<string, string> = {};
          resData.errors.forEach((err: any) => {
            newErrors[err.field] = err.message;
          });
          setErrors(newErrors);
        } else {
          setErrors({ submit: resData.message || 'Failed to publish post.' });
        }
      }
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
      setErrors({ submit: 'An unexpected connection error occurred. Make sure the backend server is running on port 5001.' });
    } finally {
      publishingRef.current = false;
      setPublishing(false);
    }
  };

  // ── Auto-Save Draft Handler ──
  const autoSaveDraft = async () => {
    if (publishingRef.current || (!title.trim() && !content.trim())) return;

    const currentPayload = JSON.stringify({
      title,
      category,
      coverImage,
      excerpt,
      keywords,
      content,
    });

    if (currentPayload === lastSavedRef.current) {
      return;
    }

    setSyncStatus('saving');

    const payload = {
      title: title.trim() || 'Untitled Draft',
      htmlContent: content,
      category: category || 'Other',
      excerpt: excerpt || 'Draft excerpt...',
      coverImage: coverImage,
      seoKeywords: keywords,
      status: 'DRAFT',
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('writen_offline_draft', JSON.stringify({
        postId,
        title,
        category,
        coverImage,
        excerpt,
        keywords,
        content,
        activeBlocks,
      }));
    }

    try {
      const url = postId ? `${API_BASE}/posts/${postId}` : `${API_BASE}/posts`;
      const method = postId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (resData.success) {
        if (!postId && resData.data?._id) {
          setPostId(resData.data._id);
        }
        lastSavedRef.current = currentPayload;
        setSyncStatus('saved');

        if (typeof window !== 'undefined') {
          localStorage.setItem('writen_offline_draft', JSON.stringify({
            postId: resData.data?._id || postId,
            title,
            category,
            coverImage,
            excerpt,
            keywords,
            content,
            activeBlocks,
          }));
        }
      } else {
        console.error('Auto-save rejected:', resData.message);
        setSyncStatus('offline_saved');
      }
    } catch (err) {
      console.error('Auto-save network error:', err);
      setSyncStatus('offline_saved');
    }
  };

  // ── Manual Save Draft Trigger ──
  const handleSaveDraft = async () => {
    if (syncStatus === 'saving') return;
    setSyncStatus('saving');

    const currentPayload = JSON.stringify({
      title,
      category,
      coverImage,
      excerpt,
      keywords,
      content,
    });

    const payload = {
      title: title.trim() || 'Untitled Draft',
      htmlContent: content,
      category: category || 'Other',
      excerpt: excerpt || 'Draft excerpt...',
      coverImage: coverImage,
      seoKeywords: keywords,
      status: 'DRAFT',
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('writen_offline_draft', JSON.stringify({
        postId,
        title,
        category,
        coverImage,
        excerpt,
        keywords,
        content,
        activeBlocks,
      }));
    }

    try {
      const url = postId ? `${API_BASE}/posts/${postId}` : `${API_BASE}/posts`;
      const method = postId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (resData.success) {
        if (!postId && resData.data?._id) {
          setPostId(resData.data._id);
        }
        lastSavedRef.current = currentPayload;
        setSyncStatus('saved');
        setShowManualSavedTick(true);
        setTimeout(() => {
          setShowManualSavedTick(false);
        }, 2000);
      } else {
        setSyncStatus('error');
      }
    } catch (err) {
      console.error(err);
      setSyncStatus('offline_saved');
      setShowManualSavedTick(true);
      setTimeout(() => {
        setShowManualSavedTick(false);
      }, 2000);
    }
  };

  const handleDeletePost = async () => {
    if (!postId || !accessToken || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem('writen_offline_draft');
        useFormCacheStore.getState().clearCache();
        router.push('/dashboard');
      } else {
        setErrors(prev => ({ ...prev, submit: data.message || 'Failed to delete publication.' }));
        setShowDeleteModal(false);
      }
    } catch (err) {
      console.error(err);
      setErrors(prev => ({ ...prev, submit: 'Network connection failure. Post could not be deleted.' }));
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  // Auto-Save Effect
  useEffect(() => {
    if (publishing || (!title.trim() && !content.trim())) return;

    const timer = setTimeout(() => {
      autoSaveDraft();
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, category, coverImage, excerpt, keywords, content, publishing]);

  // Real-time local cache using Zustand persist
  useEffect(() => {
    useFormCacheStore.getState().setCache({
      postId,
      title,
      category,
      coverImage,
      excerpt,
      keywords,
      content,
      activeBlocks,
    });
  }, [postId, title, category, coverImage, excerpt, keywords, content, activeBlocks]);

  const insertOptions = [
    { type: 'category' as BlockType, icon: <FolderOpen className="size-4.5" />, label: 'Category' },
    { type: 'coverImage' as BlockType, icon: <ImageIcon className="size-4.5" />, label: 'Featured Cover' },
    { type: 'excerpt' as BlockType, icon: <FileText className="size-4.5" />, label: 'Short Excerpt' },
    { type: 'keywords' as BlockType, icon: <Tag className="size-4.5" />, label: 'SEO Keywords' },
    { type: 'content' as BlockType, icon: <Edit3 className="size-4.5" />, label: 'Rich Content' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-body-md relative pb-32 transition-colors duration-300">
      {/* hoisted document metadata for SEO */}
      <title>Write Story // Writen</title>
      <meta name="description" content="Draft and format technical narratives. Focus on clean layouts, structured code blocks, and markdown alignments." />

      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-outline-variant/30 px-6 py-3.5 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-4">
          <Link href="/feed" className="font-headline-md text-xl font-bold text-on-surface tracking-tight hover:opacity-85 transition-opacity">
            Writen
          </Link>

          {/* Dynamic Sync Status Indicator */}
          <div className="h-6 flex items-center">
            {syncStatus === 'idle' && (
              <span className="font-label-caps text-[10px] text-on-surface-variant/80 px-2.5 py-0.5 bg-surface-container border border-outline-variant/20 rounded-md select-none font-bold uppercase tracking-wider">
                Draft
              </span>
            )}
            {syncStatus === 'saving' && (
              <span className="font-label-caps text-[10px] text-on-surface-variant/80 px-2.5 py-0.5 bg-surface-container border border-outline-variant/20 rounded-md select-none font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                <Loader2 className="animate-spin size-3 text-primary" />
                Saving...
              </span>
            )}
            {syncStatus === 'saved' && (
              <span className="font-label-caps text-[10px] text-primary bg-primary/5 px-2.5 py-0.5 rounded-md border border-primary/25 select-none flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <Cloud className="size-3" />
                Saved to cloud
              </span>
            )}
            {syncStatus === 'offline_saved' && (
              <span className="font-label-caps text-[10px] text-amber-600 bg-amber-500/5 px-2.5 py-0.5 rounded-md border border-amber-500/20 select-none flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <WifiOff className="size-3" />
                Saved locally
              </span>
            )}
            {syncStatus === 'error' && (
              <span className="font-label-caps text-[10px] text-error bg-error/5 px-2.5 py-0.5 rounded-md border border-error/20 select-none flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <AlertTriangle className="size-3" />
                Save failed
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePublish}
            disabled={publishing}
            id="write-publish-btn"
            className="bg-primary text-on-primary font-label-caps text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full hover:opacity-90 active:scale-95 disabled:opacity-60 flex items-center gap-2 shadow-xs transition-all duration-200 cursor-pointer"
          >
            {publishing && <Loader2 className="animate-spin size-3.5" />}
            Publish
          </button>

          {/* More Actions Dropdown Menu */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              id="write-more-menu-btn"
              className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center border border-outline-variant/30"
              title="More Actions"
            >
              <MoreHorizontal className="size-4" />
            </button>

            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-11 w-48 bg-surface border border-outline-variant/40 rounded-xl shadow-md py-2 z-50 overflow-hidden"
                >
                  <Link
                    href="/feed"
                    onClick={() => setShowMoreMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer"
                  >
                    <Home className="size-4 text-secondary" />
                    Feed Home
                  </Link>

                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      handleSaveDraft();
                    }}
                    disabled={syncStatus === 'saving' || publishing}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer w-full text-left disabled:opacity-60 focus:outline-none"
                  >
                    {syncStatus === 'saving' ? (
                      <Loader2 className="animate-spin size-4 text-secondary" />
                    ) : showManualSavedTick ? (
                      <CheckCircle2 className="size-4 text-primary" />
                    ) : (
                      <Save className="size-4 text-secondary" />
                    )}
                    <span>
                      {syncStatus === 'saving'
                        ? 'Saving...'
                        : showManualSavedTick
                          ? 'Saved!'
                          : 'Save Draft'}
                    </span>
                  </button>

                  {postId && (
                    <div className="border-t border-outline-variant/20 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          setShowDeleteModal(true);
                        }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-error hover:bg-error-container/10 hover:text-error transition-colors cursor-pointer w-full text-left focus:outline-none"
                      >
                        <Trash2 className="size-4 text-error" />
                        <span>Delete Post</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user && <ProfileDropdown />}
        </div>
      </header>

      {/* ── Main Canvas ── */}
      <main className="flex-1 max-w-[720px] w-full mx-auto px-6 py-12 flex flex-col relative z-10">

        {/* Errors notifications */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container border border-error/15 rounded-xl flex items-start gap-3">
            <AlertTriangle className="size-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{errors.submit}</p>
          </div>
        )}

        {/* Title Input Block */}
        <div className="mb-6">
          <input
            ref={titleInputRef}
            type="text"
            id="input-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent font-headline-lg text-4xl md:text-5xl font-black text-on-surface placeholder:text-outline-variant/40 outline-none border-none leading-tight py-2 font-display-xl tracking-tight"
          />
          {slug && (
            <p className="font-code-sm text-xs text-on-surface-variant/70 mt-1.5 flex items-center gap-1.5 font-mono select-none">
              <LinkIcon className="size-3.5 text-secondary" />
              writen.com/blog/<span className="text-primary font-semibold">{slug}</span>
            </p>
          )}
          {errors.title && <p className="text-error text-xs font-semibold mt-1">{errors.title}</p>}
        </div>

        {/* ── Active Blocks List (Dynamic Card Components) ── */}
        <div className="space-y-6">
          <AnimatePresence>
            {activeBlocks.map((block) => {
              let blockIcon = <FileText className="size-4 text-secondary" />;
              let blockLabel = 'Block';
              let blockContent = null;

              if (block === 'category') {
                blockIcon = <FolderOpen className="size-4 text-primary" />;
                blockLabel = 'Category Picker';
                blockContent = (
                  <div className="space-y-2">
                    <Select value={category} onValueChange={(v) => { setCategory(v ?? ''); if (errors.category) setErrors(prev => ({ ...prev, category: '' })); }}>
                      <SelectTrigger id="input-category" className="bg-surface-container-lowest border-outline-variant/40 font-body-md focus:border-primary focus:ring-1 focus:ring-primary h-11 rounded-lg">
                        <SelectValue placeholder="Choose a technical category for this post" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-error text-xs font-medium mt-1">{errors.category}</p>}
                  </div>
                );
              } else if (block === 'coverImage') {
                blockIcon = <ImageIcon className="size-4 text-primary" />;
                blockLabel = 'Featured Cover Image';
                blockContent = (
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        id="input-coverImage"
                        value={coverImage}
                        onChange={(e) => { setCoverImage(e.target.value); if (errors.coverImage) setErrors(prev => ({ ...prev, coverImage: '' })); }}
                        placeholder="Paste a direct image URL (e.g. from Unsplash)..."
                        className="bg-surface-container-lowest border-outline-variant/40 font-body-md pr-10 h-11 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                      <ImageIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant size-4.5" />
                    </div>
                    {errors.coverImage && <p className="text-error text-xs font-medium">{errors.coverImage}</p>}

                    {/* Live aspect ratio preview */}
                    <div className="aspect-video rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container flex items-center justify-center relative group">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt="Cover preview"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="p-4 text-on-surface-variant/40 flex flex-col items-center gap-1.5 select-none">
                          <ImagePlus className="size-8 text-outline-variant/60" />
                          <span className="text-[11px] font-semibold uppercase tracking-wider">Live cover preview container</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              } else if (block === 'excerpt') {
                blockIcon = <FileText className="size-4 text-primary" />;
                blockLabel = 'Excerpt / Summary';
                blockContent = (
                  <div className="space-y-2">
                    <Textarea
                      id="input-excerpt"
                      value={excerpt}
                      onChange={(e) => { setExcerpt(e.target.value); if (errors.excerpt) setErrors(prev => ({ ...prev, excerpt: '' })); }}
                      placeholder="Provide a concise summary description that will populate the post's SEO meta tags..."
                      className="bg-surface-container-lowest border-outline-variant/40 font-body-md resize-none rounded-lg focus:border-primary focus:ring-1 focus:ring-primary p-3"
                      rows={3}
                      maxLength={300}
                    />
                    <div className="flex justify-between items-center text-xs text-on-surface-variant/80 font-body-md mt-1 select-none">
                      {errors.excerpt ? (
                        <p className="text-error font-medium">{errors.excerpt}</p>
                      ) : (
                        <span className="invisible" />
                      )}
                      <span className={excerpt.length >= 285 ? 'text-error font-bold font-mono' : 'font-mono font-medium'}>{excerpt.length}/300</span>
                    </div>
                  </div>
                );
              } else if (block === 'keywords') {
                blockIcon = <Tag className="size-4 text-primary" />;
                blockLabel = 'SEO Keywords';
                blockContent = (
                  <div className="space-y-2">
                    <Input
                      id="input-keywords"
                      value={keywords}
                      onChange={(e) => { setKeywords(e.target.value); if (errors.keywords) setErrors(prev => ({ ...prev, keywords: '' })); }}
                      placeholder="Enter comma-separated SEO keyword tags (e.g. react, design-systems, nextjs)..."
                      className="bg-surface-container-lowest border-outline-variant/40 font-body-md h-11 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    {errors.keywords && <p className="text-error text-xs font-medium">{errors.keywords}</p>}

                    {keywordChips.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {keywordChips.map((chip, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 bg-primary/5 text-primary text-[10px] rounded-full font-label-caps border border-primary/10 flex items-center gap-0.5 font-bold uppercase tracking-wider select-none"
                          >
                            <span className="text-[9px] text-primary/70 mr-0.5">#</span>
                            {chip}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else if (block === 'content') {
                blockIcon = <Edit3 className="size-4 text-primary" />;
                blockLabel = 'Rich Text Workspace';
                blockContent = (
                  <div className="space-y-2">
                    {errors.content && <p className="text-error text-xs font-medium mt-1">{errors.content}</p>}
                    <div className="min-h-[40vh]">
                      <RichEditor content={content} onChange={setContent} />
                    </div>
                  </div>
                );
              }

              return (
                <motion.div
                  key={block}
                  id={`block-card-${block}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  className="relative group/block border border-outline-variant/25 hover:border-outline-variant/50 rounded-xl p-5 transition-all duration-300 bg-surface-container-low/40 hover:bg-surface-container-low shadow-xs"
                >
                  {/* Block Header Toolbar */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-outline-variant/15 opacity-70 group-hover/block:opacity-100 transition-opacity select-none">
                    <span className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5 font-bold">
                      {blockIcon}
                      {blockLabel}
                    </span>
                    <button
                      onClick={() => deleteBlock(block)}
                      className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant hover:text-error transition-all opacity-0 group-hover/block:opacity-100 active:scale-90 cursor-pointer flex items-center justify-center"
                      title={`Delete ${blockLabel} block`}
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  {/* Block Content */}
                  {blockContent}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── Block Addition Insert Bar ── */}
        <div className="flex items-center gap-4 relative py-8 -ml-[4px] z-30 select-none">
          <button
            onClick={() => setShowToolbar(!showToolbar)}
            id="write-add-block-btn"
            title={showToolbar ? "Close options" : "Add block"}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 shadow-xs active:scale-95 shrink-0 z-10 cursor-pointer ${showToolbar
                ? 'rotate-45 bg-primary border-primary text-on-primary'
                : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
              }`}
          >
            <Plus className="size-5" />
          </button>

          <div
            className={`flex items-center gap-2.5 transition-all duration-300 origin-left ${showToolbar ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-4 scale-95 pointer-events-none'
              }`}
          >
            {insertOptions.map((opt) => {
              const isActive = activeBlocks.includes(opt.type);

              return (
                <div key={opt.type} className="relative group">
                  <button
                    onClick={() => handleBlockAction(opt.type)}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-xs active:scale-90 cursor-pointer ${isActive
                        ? 'border-primary/45 bg-primary/5 text-primary'
                        : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:text-primary hover:border-primary/50 hover:bg-primary/5'
                      }`}
                  >
                    {opt.icon}
                  </button>

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all pointer-events-none z-50">
                    <div className="bg-inverse-surface text-inverse-on-surface font-label-caps text-[9px] font-bold tracking-wider px-2.5 py-1 rounded shadow-md whitespace-nowrap uppercase">
                      {opt.label} {isActive ? '(Added)' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Mandatory Block Validation Summary ── */}
        {Object.keys(errors).some(k => k.startsWith('block_')) && (
          <div className="my-4 p-4 bg-error-container text-on-error-container border border-error/15 rounded-xl space-y-2">
            <p className="text-xs uppercase font-label-caps tracking-widest font-bold flex items-center gap-1.5">
              <AlertTriangle className="size-4" />
              Missing Mandatory Elements
            </p>
            <ul className="text-xs space-y-1 pl-4 list-disc font-body-md">
              {Object.keys(errors).map((k) => {
                if (k.startsWith('block_')) {
                  return <li key={k} className="font-semibold">{errors[k]}</li>;
                }
                return null;
              })}
            </ul>
          </div>
        )}

      </main>

      {/* ─── FULL SCREEN PREVIEW OVERLAY ─── */}
      <AnimatePresence>
        {showPreview && createdPost && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-0 z-[100] bg-surface overflow-y-auto flex flex-col"
          >
            {/* Preview Navigation Header */}
            <header className="sticky top-0 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-6 py-4 flex justify-between items-center z-10 w-full shadow-xs">
              <div className="flex items-center gap-2 text-on-surface select-none">
                <Eye className="size-4.5 text-primary" />
                <span className="font-label-caps text-xs uppercase tracking-wider font-bold">Story Reader Preview</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="font-label-caps text-xs text-on-surface-variant hover:text-on-surface px-4 py-2.5 rounded-full border border-outline-variant/30 hover:bg-surface-container-low transition-all font-semibold cursor-pointer"
                >
                  Go Back & Edit
                </button>
                <button
                  onClick={() => router.push('/feed')}
                  className="bg-primary text-on-primary font-label-caps text-xs px-6 py-2.5 rounded-full hover:opacity-90 transition-all active:scale-95 shadow-sm font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  Finish & Exit
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </header>

            {/* Reader View Content Wrapper */}
            <article className="max-w-[720px] w-full mx-auto px-6 py-12 flex flex-col">
              {category && (
                <div className="mb-4">
                  <span className="px-3.5 py-1 bg-surface-container border border-outline-variant/30 text-on-surface text-[10px] rounded-full font-bold uppercase tracking-widest font-label-caps select-none">
                    {category}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="font-display-xl text-4xl md:text-5xl font-black text-on-surface leading-tight mb-6 tracking-tight">
                {title}
              </h1>

              {/* Author details block */}
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-outline-variant/30">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant/30 select-none font-bold">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-label-caps text-on-surface text-sm">{user?.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="font-body-md text-sm font-bold text-on-surface">{user?.name || 'Anonymous Author'}</p>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium mt-0.5 select-none">
                    <span className="flex items-center gap-1"><Clock className="size-3" /> {readingTime} min read</span>
                    <span>·</span>
                    <span>Published Today</span>
                  </div>
                </div>
              </div>

              {/* Excerpt panel */}
              {excerpt && (
                <div className="mb-8 p-5 bg-surface-container-low border-l-4 border-primary rounded-r-xl italic font-serif text-on-surface-variant text-base leading-relaxed">
                  "{excerpt}"
                </div>
              )}

              {/* Featured Cover Image */}
              {coverImage && (
                <div className="mb-10 aspect-video rounded-xl overflow-hidden border border-outline-variant/35 shadow-sm bg-surface-container-low">
                  <img
                    src={coverImage}
                    alt="Article Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* TipTap Rich HTML Content */}
              <div
                className="tiptap font-serif leading-relaxed text-on-surface text-lg md:text-xl space-y-6 prose prose-zinc max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              {/* Keywords chips list */}
              {keywordChips.length > 0 && (
                <div className="mt-12 pt-6 border-t border-outline-variant/30 flex flex-wrap gap-2 select-none">
                  {keywordChips.map((chip, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-surface-container-low text-on-surface-variant text-xs rounded-full font-label-caps border border-outline-variant/20 flex items-center gap-0.5 font-bold uppercase tracking-wider"
                    >
                      <span className="text-[10px] text-on-surface-variant/70">#</span>
                      {chip}
                    </span>
                  ))}
                </div>
              )}

            </article>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-container-low border border-outline-variant/40 max-w-sm w-full rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 space-y-4 text-left">

                {/* Warning Title */}
                <div className="flex items-center gap-3 text-error">
                  <div className="p-2.5 bg-error/5 border border-error/15 rounded-xl">
                    <AlertTriangle className="size-5" />
                  </div>
                  <h3 className="font-headline-lg text-base font-bold text-on-surface">Delete Post</h3>
                </div>

                {/* Warning Details */}
                <div className="space-y-2">
                  <p className="font-body-md text-[13.5px] text-on-surface leading-normal">
                    Are you sure you want to permanently delete this post?
                  </p>
                  <p className="font-body-md text-xs text-on-surface-variant leading-relaxed font-light">
                    This action is permanent and cannot be undone. All database records and statistics associated with this post will be erased.
                  </p>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleting}
                    className="font-label-caps text-xs text-on-surface-variant hover:text-on-surface px-4 py-2.5 rounded-full border border-outline-variant/30 hover:bg-surface-container-high/40 transition-all font-semibold cursor-pointer disabled:opacity-50 outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeletePost}
                    disabled={deleting}
                    className="bg-error text-on-error font-label-caps text-xs px-5 py-2.5 rounded-full hover:opacity-95 transition-all active:scale-95 shadow-sm font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 outline-none"
                  >
                    {deleting && <Loader2 className="animate-spin size-3.5" />}
                    Delete Post
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
