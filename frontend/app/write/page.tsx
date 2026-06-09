'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { AlertTriangle, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useFormCacheStore } from '@/lib/form-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { EditorToolbar, BlockType } from '@/components/editor/EditorToolbar';

import { WriteTopBar } from '@/components/write/WriteTopBar';
import { DeleteDraftModal } from '@/components/write/DeleteDraftModal';
import { WritePreviewOverlay } from '@/components/write/WritePreviewOverlay';
import { ActiveBlocksList } from '@/components/write/ActiveBlocksList';

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
  const [activeBlocks, setActiveBlocks] = useState<BlockType[]>([
    'category', 'coverImage', 'excerpt', 'keywords', 'content'
  ]);
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

        // Always show all required blocks when editing
        setActiveBlocks([
          'category', 'coverImage', 'excerpt', 'keywords', 'content'
        ]);

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
          localStorage.removeItem('devlog_offline_draft');
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
      localStorage.setItem('devlog_offline_draft', JSON.stringify({
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
          localStorage.setItem('devlog_offline_draft', JSON.stringify({
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
      localStorage.setItem('devlog_offline_draft', JSON.stringify({
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
        localStorage.removeItem('devlog_offline_draft');
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-body-md relative pb-32 transition-colors duration-300">
        {/* hoisted document metadata for SEO */}
        <title>Write Story // DevLog</title>
        <meta name="description" content="Draft and format technical narratives. Focus on clean layouts, structured code blocks, and markdown alignments." />

        <WriteTopBar
          syncStatus={syncStatus}
          publishing={publishing}
          showManualSavedTick={showManualSavedTick}
          postId={postId}
          handlePublish={handlePublish}
          handleSaveDraft={handleSaveDraft}
          setShowDeleteModal={setShowDeleteModal}
        />

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
                devlog.com/blog/<span className="text-primary font-semibold">{slug}</span>
              </p>
            )}
            {errors.title && <p className="text-error text-xs font-semibold mt-1">{errors.title}</p>}
          </div>

          <div className="space-y-6">
            <ActiveBlocksList
              activeBlocks={activeBlocks}
              deleteBlock={deleteBlock}
              category={category}
              setCategory={setCategory}
              coverImage={coverImage}
              setCoverImage={setCoverImage}
              excerpt={excerpt}
              setExcerpt={setExcerpt}
              keywords={keywords}
              setKeywords={setKeywords}
              content={content}
              setContent={setContent}
              errors={errors}
              setErrors={setErrors}
            />
          </div>

          {/* ── Block Addition Insert Bar ── */}
          <EditorToolbar
            showToolbar={showToolbar}
            setShowToolbar={setShowToolbar}
            activeBlocks={activeBlocks}
            handleBlockAction={handleBlockAction}
          />

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
        <WritePreviewOverlay
          showPreview={showPreview}
          setShowPreview={setShowPreview}
          createdPost={createdPost}
          router={router}
          category={category}
          title={title}
          user={user}
          readingTime={readingTime}
          excerpt={excerpt}
          coverImage={coverImage}
          content={content}
          keywordChips={keywordChips}
        />

        {/* Delete Confirmation Modal */}
        <DeleteDraftModal
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          deleting={deleting}
          handleDeletePost={handleDeletePost}
        />
      </div>
    </ProtectedRoute>
  );
}
