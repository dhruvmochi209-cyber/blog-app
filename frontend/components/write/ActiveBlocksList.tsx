import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen,
  Image as ImageIcon,
  ImagePlus,
  FileText,
  Tag,
  Edit3,
  X,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagInput } from '@/components/editor/TagInput';
import dynamic from 'next/dynamic';

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
  'JavaScript',
  'TypeScript',
  'Python',
  'Rust',
  'Go',
  'Java',
  'C++',
  'React',
  'Next.js',
  'Vue',
  'Angular',
  'Node.js',
  'System Design',
  'DevOps',
  'Cloud & AWS',
  'Docker & Kubernetes',
  'Databases',
  'PostgreSQL',
  'MongoDB',
  'Security',
  'Algorithms & DSA',
  'AI & Machine Learning',
  'Data Science',
  'Web3 & Crypto',
  'Mobile Development',
  'Engineering',
  'Design',
  'Product',
  'Career & Growth',
  'Startups',
  'Open Source',
  'Culture',
  'Other',
];

export function ActiveBlocksList({
  activeBlocks,
  deleteBlock,
  category,
  setCategory,
  coverImage,
  setCoverImage,
  excerpt,
  setExcerpt,
  keywords,
  setKeywords,
  content,
  setContent,
  errors,
  setErrors,
}: any) {
  return (
    <AnimatePresence>
      {activeBlocks.map((block: string) => {
        let blockIcon = <FileText className="size-4 text-secondary" />;
        let blockLabel = 'Block';
        let blockContent = null;

        if (block === 'category') {
          blockIcon = <FolderOpen className="size-4 text-primary" />;
          blockLabel = 'Category Picker';
          blockContent = (
            <div className="space-y-2">
              <Select value={category} onValueChange={(v) => { setCategory(v ?? ''); if (errors.category) setErrors((prev: any) => ({ ...prev, category: '' })); }}>
                <SelectTrigger id="input-category" className="bg-surface-container-lowest border-outline/50 font-body-md focus:border-primary focus:ring-1 focus:ring-primary h-11 rounded-lg">
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
                  onChange={(e) => { setCoverImage(e.target.value); if (errors.coverImage) setErrors((prev: any) => ({ ...prev, coverImage: '' })); }}
                  placeholder="Paste a direct image URL (e.g. from Unsplash)..."
                  className="bg-surface-container-lowest border-outline/50 font-body-md pr-10 h-11 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <ImageIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant size-4.5" />
              </div>
              {errors.coverImage && <p className="text-error text-xs font-medium">{errors.coverImage}</p>}

              {/* Live aspect ratio preview */}
              <div className="aspect-video rounded-xl overflow-hidden border border-outline/40 bg-surface-container flex items-center justify-center relative group">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                    onError={(e) => { 
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5Z29uIHBvaW50cz0iMTMgMiAzIDE0IDkgMTQgOS  MjIgMTkgMTAgMTMgMTAgMTMgMiIvPjwvc3ZnPg=='; // Lightning bolt placeholder for broken image
                      (e.target as HTMLImageElement).className = "w-16 h-16 opacity-30 mx-auto my-auto";
                    }}
                  />
                ) : (
                  <div className="p-4 text-on-surface-variant/70 flex flex-col items-center gap-1.5 select-none">
                    <ImagePlus className="size-8 text-on-surface-variant/50" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Live cover preview container</span>
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
                onChange={(e) => { setExcerpt(e.target.value); if (errors.excerpt) setErrors((prev: any) => ({ ...prev, excerpt: '' })); }}
                placeholder="Provide a concise summary description that will populate the post's SEO meta tags..."
                className="bg-surface-container-lowest border-outline/50 font-body-md resize-none rounded-lg focus:border-primary focus:ring-1 focus:ring-primary p-3"
                rows={3}
                maxLength={300}
              />
              <div className="flex justify-between items-center text-xs text-on-surface-variant/80 font-body-md mt-1 select-none">
                {errors.excerpt ? (
                  <p className="text-error font-medium">{errors.excerpt}</p>
                ) : (
                  <span className="invisible" />
                )}
                <span className={excerpt?.length >= 285 ? 'text-error font-bold font-mono' : 'font-mono font-medium'}>{excerpt?.length || 0}/300</span>
              </div>
            </div>
          );
        } else if (block === 'keywords') {
          blockIcon = <Tag className="size-4 text-primary" />;
          blockLabel = 'SEO Keywords';
          blockContent = (
            <TagInput
              keywords={keywords}
              setKeywords={setKeywords}
              error={errors.keywords}
              clearError={() => setErrors((prev: any) => ({ ...prev, keywords: '' }))}
            />
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
            className="relative group/block rounded-2xl p-6 transition-all duration-300 bg-surface-container-lowest shadow-sm border border-outline-variant/40 hover:border-primary/40 hover:shadow-[0_8px_30px_-4px_rgba(79,70,229,0.15)]"
          >
            {/* Block Header Toolbar */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-outline-variant/20 opacity-80 group-hover/block:opacity-100 transition-opacity select-none">
              <span className="font-label-caps text-[11px] uppercase tracking-[0.2em] text-primary flex items-center gap-2 font-black">
                {blockIcon}
                {blockLabel}
              </span>
              <button
                onClick={() => deleteBlock(block)}
                className="p-1.5 hover:bg-error/10 rounded-full text-on-surface-variant hover:text-error transition-all opacity-0 group-hover/block:opacity-100 active:scale-90 cursor-pointer flex items-center justify-center"
                title={`Delete ${blockLabel} block`}
              >
                <X className="size-[18px]" />
              </button>
            </div>

            {/* Block Content */}
            {blockContent}
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}
