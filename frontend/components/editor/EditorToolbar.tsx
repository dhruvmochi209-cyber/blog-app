'use client';

import {
  FolderOpen,
  Image as ImageIcon,
  FileText,
  Tag,
  Edit3,
  Plus
} from 'lucide-react';

export type BlockType = 'category' | 'coverImage' | 'excerpt' | 'keywords' | 'content';

interface EditorToolbarProps {
  showToolbar: boolean;
  setShowToolbar: (val: boolean) => void;
  activeBlocks: BlockType[];
  handleBlockAction: (type: BlockType) => void;
}

export function EditorToolbar({
  showToolbar,
  setShowToolbar,
  activeBlocks,
  handleBlockAction
}: EditorToolbarProps) {
  const insertOptions = [
    { type: 'category' as BlockType, icon: <FolderOpen className="size-4.5" />, label: 'Category' },
    { type: 'coverImage' as BlockType, icon: <ImageIcon className="size-4.5" />, label: 'Featured Cover' },
    { type: 'excerpt' as BlockType, icon: <FileText className="size-4.5" />, label: 'Short Excerpt' },
    { type: 'keywords' as BlockType, icon: <Tag className="size-4.5" />, label: 'SEO Keywords' },
    { type: 'content' as BlockType, icon: <Edit3 className="size-4.5" />, label: 'Rich Content' },
  ];

  return (
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
                <div className="bg-inverse-surface text-inverse-on-surface font-label-caps text-sm font-bold tracking-wider px-2.5 py-1 rounded shadow-md whitespace-nowrap uppercase">
                  {opt.label} {isActive ? '(Added)' : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
