'use client';

import Link from 'next/link';

export default function RightSidebar() {
  const topics = ['Engineering', 'Design', 'Product', 'Culture', 'React', 'AI'];
  
  return (
    <aside className="hidden xl:block w-[320px] flex-shrink-0 sticky top-[73px] h-[calc(100vh-73px)] border-l border-outline-variant/30 py-8 px-6 overflow-y-auto">
      
      {/* Staff Picks Section */}
      <div className="mb-10">
        <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 tracking-wider">Staff Picks</h3>
        <div className="space-y-6">
          <div className="group cursor-pointer">
            <div className="flex items-center gap-2 mb-1">
              <img src="https://i.pravatar.cc/150?img=1" className="w-5 h-5 rounded-full" alt="Author" />
              <span className="font-body-md text-xs text-on-surface">Alex River</span>
            </div>
            <h4 className="font-headline-md text-base font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
              The Future of React Server Components in Enterprise
            </h4>
          </div>

          <div className="group cursor-pointer">
            <div className="flex items-center gap-2 mb-1">
              <img src="https://i.pravatar.cc/150?img=2" className="w-5 h-5 rounded-full" alt="Author" />
              <span className="font-body-md text-xs text-on-surface">Sam Smith</span>
            </div>
            <h4 className="font-headline-md text-base font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
              Designing for Accessibility: A Practical Guide
            </h4>
          </div>
        </div>
        <Link href="/explore" className="inline-block mt-4 text-primary text-sm hover:underline">
          See the full list
        </Link>
      </div>

      {/* Recommended Topics Section */}
      <div className="mb-10">
        <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 tracking-wider">Recommended Topics</h3>
        <div className="flex flex-wrap gap-2">
          {topics.map(topic => (
            <span key={topic} className="px-4 py-2 bg-surface-container-low text-on-surface rounded-full text-sm hover:bg-surface-container transition-colors cursor-pointer border border-outline-variant/20">
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Links */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-on-surface-variant pt-6 border-t border-outline-variant/30">
        <Link href="#" className="hover:text-on-surface">Help</Link>
        <Link href="#" className="hover:text-on-surface">Status</Link>
        <Link href="#" className="hover:text-on-surface">About</Link>
        <Link href="#" className="hover:text-on-surface">Careers</Link>
        <Link href="#" className="hover:text-on-surface">Privacy</Link>
        <Link href="#" className="hover:text-on-surface">Terms</Link>
      </div>
    </aside>
  );
}
