import { ChevronRight, Clock } from 'lucide-react';

interface HeadingItem {
  id: string;
  text: string;
  level: string;
}

interface TableOfContentsProps {
  headings: HeadingItem[];
  activeHeadingId: string;
  readingTime: number;
}

export function TableOfContents({ headings, activeHeadingId, readingTime }: TableOfContentsProps) {
  if (headings.length === 0) return null;

  return (
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
        <div className="border-t border-outline-variant/30 pt-4 flex items-center justify-between text-xs text-on-surface-variant font-medium select-none">
          <span className="flex items-center gap-1"><Clock className="size-3" /> {readingTime} min read</span>
          <span>{headings.length} sections</span>
        </div>
      </div>
    </aside>
  );
}
