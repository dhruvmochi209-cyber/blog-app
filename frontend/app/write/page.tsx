'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth-context';
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
    <div className="min-h-[40vh] flex items-center justify-center text-on-surface-variant text-sm">
      Loading editor…
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
    
    // 1. Validate Title (mandatory, min 5 chars, max 200 chars in backend)
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title is too short (must be at least 5 characters)';
    } else if (title.trim().length > 200) {
      newErrors.title = 'Title is too long (cannot exceed 200 characters)';
    }

    // 2. Validate block presence
    const required: BlockType[] = ['category', 'coverImage', 'excerpt', 'keywords', 'content'];
    required.forEach(req => {
      if (!activeBlocks.includes(req)) {
        newErrors[`block_${req}`] = `This workspace requires the ${req === 'content' ? 'Rich Content' : req.replace(/([A-Z])/g, ' $1')} block to be added.`;
      }
    });

    // 3. Validate block values (if active)
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

    // Focus first invalid block
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
    if (publishingRef.current) return; // Strict synchronous double-submission guard
    if (!validate()) return;
    publishingRef.current = true;
    setPublishing(true);

    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
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
        setShowPreview(true); // Show Preview Overlay
        
        // Promote Visitor to Creator role inside Auth Context immediately
        if (resData.roleUpgraded) {
          await refreshUser();
        }
      } else {
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
      setErrors({ submit: 'An unexpected connection error occurred. Make sure the backend server is running on port 5001.' });
    } finally {
      publishingRef.current = false;
      setPublishing(false);
    }
  };

  const handleSaveDraft = () => {
    console.log('Saving draft…', { title, activeBlocks, content });
  };

  const insertOptions = [
    { type: 'category' as BlockType, icon: 'category', label: 'Category Picker' },
    { type: 'coverImage' as BlockType, icon: 'image', label: 'Featured Cover' },
    { type: 'excerpt' as BlockType, icon: 'description', label: 'Short Excerpt' },
    { type: 'keywords' as BlockType, icon: 'tag', label: 'SEO Keywords' },
    { type: 'content' as BlockType, icon: 'edit_note', label: 'Rich Editor' },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-md text-on-surface relative pb-32">
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant/20 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/feed" className="font-headline-lg text-xl font-bold text-on-surface tracking-tight hover:opacity-90">
            Writen
          </Link>
          <span className="font-label-caps text-xs text-on-surface-variant px-2.5 py-0.5 bg-surface-container rounded-md border border-outline-variant/10">Draft</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            className="font-label-caps text-xs text-on-surface-variant hover:text-on-surface px-4 py-2 rounded-full border border-outline-variant/30 hover:bg-surface-container-low transition-all"
          >
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="bg-primary text-on-primary font-label-caps text-xs px-5 py-2 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2 shadow-sm font-semibold animate-none"
          >
            {publishing ? (
              <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
            ) : null}
            Publish
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          {user && (
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden border border-outline-variant/30 cursor-pointer">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-label-caps text-on-surface text-xs">{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── Main Canvas ── */}
      <main className="flex-1 max-w-[720px] w-full mx-auto px-6 py-12 flex flex-col relative">
        {/* Connection/Submit Errors */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-error-container/20 border border-error/30 rounded-xl flex items-start gap-3">
            <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">error</span>
            <p className="text-sm text-error font-medium">{errors.submit}</p>
          </div>
        )}

        {/* Title Input Block (Fixed) */}
        <div className="mb-4">
          <input
            ref={titleInputRef}
            type="text"
            id="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent font-headline-lg text-4xl md:text-5xl font-bold text-on-surface placeholder:text-outline-variant/40 outline-none border-none leading-tight py-2 font-display-xl"
          />
          {slug && (
            <p className="font-code-sm text-xs text-on-surface-variant/80 mt-1 flex items-center gap-1.5 font-mono">
              <span className="material-symbols-outlined text-[14px] text-primary">link</span>
              writen.com/blog/<span className="text-primary font-medium">{slug}</span>
            </p>
          )}
          {errors.title && <p className="text-error text-xs font-medium mt-1">{errors.title}</p>}
        </div>

        {/* ── Active Blocks List (Dynamic) ── */}
        <div className="space-y-6">
          {activeBlocks.map((block) => {
            let blockIcon = 'circle';
            let blockLabel = 'Block';
            let blockContent = null;

            if (block === 'category') {
              blockIcon = 'category';
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
              blockIcon = 'image';
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
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">image</span>
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
                      <div className="p-4 text-on-surface-variant/50 flex flex-col items-center gap-1">
                        <span className="material-symbols-outlined text-[30px] text-outline-variant">add_photo_alternate</span>
                        <span className="text-xs">Live aspect-ratio cover preview</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            } else if (block === 'excerpt') {
              blockIcon = 'description';
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
                  <div className="flex justify-between items-center text-xs text-on-surface-variant/80 font-body-md mt-1">
                    {errors.excerpt ? (
                      <p className="text-error font-medium">{errors.excerpt}</p>
                    ) : (
                      <span className="invisible" />
                    )}
                    <span className={excerpt.length >= 285 ? 'text-error font-bold font-mono' : 'font-mono'}>{excerpt.length}/300</span>
                  </div>
                </div>
              );
            } else if (block === 'keywords') {
              blockIcon = 'tag';
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
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {keywordChips.map((chip, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 bg-primary/10 text-primary text-[11px] rounded-full font-label-caps border border-primary/20 flex items-center gap-0.5 font-medium"
                        >
                          <span className="text-[10px] text-primary/70">#</span>
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else if (block === 'content') {
              blockIcon = 'edit_note';
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
              <div 
                key={block}
                id={`block-card-${block}`}
                className="relative group/block border border-outline-variant/15 hover:border-outline-variant/35 rounded-xl p-5 transition-all duration-300 bg-surface-container-lowest/40 hover:bg-surface-container-lowest shadow-sm"
              >
                {/* Block Header Toolbar */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-outline-variant/10 opacity-70 group-hover/block:opacity-100 transition-opacity">
                  <span className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5 font-semibold">
                    <span className="material-symbols-outlined text-[15px] text-primary">{blockIcon}</span>
                    {blockLabel}
                  </span>
                  <button
                    onClick={() => deleteBlock(block)}
                    className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant hover:text-error transition-all opacity-0 group-hover/block:opacity-100 active:scale-90"
                    title={`Delete ${blockLabel} block`}
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
                
                {/* Block Content */}
                {blockContent}
              </div>
            );
          })}
        </div>

        {/* ── Block Addition Insert Bar (Clean Left Gutter Alignment) ── */}
        <div className="flex items-center gap-4 relative py-6 -ml-[44px] md:-ml-[48px] -ml-[8px] z-30">
          <button
            onClick={() => setShowToolbar(!showToolbar)}
            title={showToolbar ? "Close options" : "Add block"}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 shadow-sm active:scale-95 shrink-0 z-10 ${
              showToolbar 
                ? 'rotate-45 bg-surface-container border-outline text-on-surface' 
                : 'bg-surface-container-lowest border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">add</span>
          </button>

          <div
            className={`flex items-center gap-2.5 transition-all duration-300 origin-left ${
              showToolbar ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-4 scale-95 pointer-events-none'
            }`}
          >
            {insertOptions.map((opt) => {
              const isActive = activeBlocks.includes(opt.type);

              return (
                <div key={opt.type} className="relative group">
                  <button
                    onClick={() => handleBlockAction(opt.type)}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-sm active:scale-90 ${
                      isActive 
                        ? 'border-primary/45 bg-primary/5 text-primary' 
                        : 'border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                  </button>
                  
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all pointer-events-none z-50">
                    <div className="bg-inverse-surface text-inverse-on-surface font-label-caps text-[10px] tracking-wider px-2.5 py-1 rounded shadow-md whitespace-nowrap uppercase">
                      {opt.label} {isActive ? '(Added)' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Mandatory Block Validation Summary (Visual Checklist) ── */}
        {Object.keys(errors).some(k => k.startsWith('block_')) && (
          <div className="my-6 p-4 bg-error-container/20 border border-error/20 rounded-xl space-y-2">
            <p className="text-xs uppercase font-label-caps text-error tracking-wider font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              Missing Mandatory Elements
            </p>
            <ul className="text-xs text-on-surface-variant space-y-1 pl-4 list-disc font-body-md">
              {Object.keys(errors).map((k) => {
                if (k.startsWith('block_')) {
                  return <li key={k} className="text-error/90 font-medium">{errors[k]}</li>;
                }
                return null;
              })}
            </ul>
          </div>
        )}

      </main>

      {/* ─── 🚀 FULL SCREEN READER PREVIEW OVERLAY ─── */}
      {showPreview && createdPost && (
        <div className="fixed inset-0 z-[100] bg-surface overflow-y-auto flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Preview Navigation Header */}
          <header className="sticky top-0 bg-surface/90 backdrop-blur-md border-b border-outline-variant/20 px-6 py-4 flex justify-between items-center z-10 w-full">
            <div className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary text-[20px]">visibility</span>
              <span className="font-label-caps text-xs uppercase tracking-wider font-bold">Story Reader Preview</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="font-label-caps text-xs text-on-surface-variant hover:text-on-surface px-4 py-2.5 rounded-full border border-outline-variant/30 hover:bg-surface-container-low transition-all"
              >
                Go Back & Edit
              </button>
              <button
                onClick={() => router.push('/feed')}
                className="bg-primary text-on-primary font-label-caps text-xs px-6 py-2.5 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95 shadow-sm font-semibold flex items-center gap-1.5"
              >
                Finish & Exit
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </header>

          {/* Reader View Content Wrapper */}
          <article className="max-w-[720px] w-full mx-auto px-6 py-12 flex flex-col">
            {/* Category Tag pill */}
            {category && (
              <div className="mb-4">
                <span className="px-3.5 py-1 bg-primary/10 text-primary text-xs font-label-caps border border-primary/20 rounded-full font-semibold">
                  {category}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="font-display-xl text-4xl md:text-5xl font-bold text-on-surface leading-tight mb-6">
              {title}
            </h1>

            {/* Author details block */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-outline-variant/15">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant/30">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-label-caps text-on-surface text-sm">{user?.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <p className="font-body-md text-sm font-bold text-on-surface">{user?.name || 'Anonymous Author'}</p>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-body-md mt-0.5">
                  <span>Published Today</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px]">schedule</span>{readingTime} min read</span>
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
              <div className="mb-10 aspect-video rounded-xl overflow-hidden border border-outline-variant/20 shadow-md">
                <img
                  src={coverImage}
                  alt="Article Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* TipTap Rich HTML Content */}
            <div 
              className="tiptap font-serif leading-relaxed text-on-surface text-lg md:text-xl space-y-6"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Keywords/SEO tag chips list */}
            {keywordChips.length > 0 && (
              <div className="mt-12 pt-6 border-t border-outline-variant/15 flex flex-wrap gap-2">
                {keywordChips.map((chip, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-surface-container-low text-on-surface-variant text-xs rounded-full font-label-caps border border-outline-variant/20 flex items-center gap-0.5 font-medium"
                  >
                    <span className="text-[10px] text-on-surface-variant/70">#</span>
                    {chip}
                  </span>
                ))}
              </div>
            )}

          </article>
        </div>
      )}
    </div>
  );
}
