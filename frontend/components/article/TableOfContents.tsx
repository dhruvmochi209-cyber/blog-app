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
    <aside className="w-full lg:w-[240px] xl:w-[280px] shrink-0 mt-8 lg:mt-0">
      <div className="lg:sticky lg:top-24 space-y-6 bg-white border border-slate-200/60 rounded-[2rem] lg:rounded-3xl p-6 shadow-sm">
        <h4 className="font-label-caps text-[11px] text-slate-800 font-bold uppercase tracking-widest pb-3 border-b border-slate-100">
          Table of Contents
        </h4>
        <ul className="space-y-3.5 text-[13px] max-h-[calc(100vh-280px)] overflow-y-auto no-scrollbar scroll-smooth pr-1">
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
                  className={`group flex items-start gap-2 py-1 leading-normal transition-all duration-200 hover:text-primary ${
                    isActive 
                      ? 'text-primary font-bold' 
                      : 'text-slate-500 font-medium'
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
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider font-mono select-none">
          <span className="flex items-center gap-1.5"><Clock className="size-3.5 opacity-70" /> {readingTime} min read</span>
          <span>{headings.length} sections</span>
        </div>
      </div>
    </aside>
  );
}
