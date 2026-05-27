'use client';

import TopNavBar from '@/components/layout/TopNavBar';
import SideNavBar from '@/components/layout/SideNavBar';
import RightSidebar from '@/components/layout/RightSidebar';

export default function FeedPage() {
  const tabs = ['For you', 'Following', 'Engineering', 'Design', 'Product'];
  const activeTab = 'For you';

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <TopNavBar />
      
      <div className="flex-1 flex w-full">
        {/* Sidebar sits at the absolute left edge */}
        <SideNavBar />
        
        {/* Content area takes remaining space */}
        <div className="flex-1 flex justify-center">
          <main className="flex-1 max-w-[720px] w-full border-r border-outline-variant/30 min-h-[calc(100vh-57px)]">
            {/* Tabs */}
            <div className="sticky top-[57px] bg-surface/95 backdrop-blur z-40 border-b border-outline-variant/30 px-6 pt-6">
              <div className="flex gap-6 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    className={`pb-4 whitespace-nowrap text-sm font-label-caps transition-colors relative ${
                      activeTab === tab 
                        ? 'text-on-surface font-bold' 
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Feed Content */}
            <div className="p-6 space-y-12">
              
              {/* Post Card 1 */}
              <article className="group cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <img src="https://i.pravatar.cc/150?img=3" className="w-6 h-6 rounded-full" alt="Author" />
                  <span className="font-body-md text-sm text-on-surface font-medium">Sarah Chen</span>
                  <span className="text-on-surface-variant text-sm">·</span>
                  <span className="font-body-md text-sm text-on-surface-variant">Oct 24</span>
                </div>
                
                <div className="flex gap-6">
                  <div className="flex-1">
                    <h2 className="font-headline-lg text-2xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      Why We Migrated from React to Vanilla JS (And Then Back Again)
                    </h2>
                    <p className="font-body-md text-on-surface-variant text-base line-clamp-3 mb-4 leading-relaxed">
                      A deep dive into the engineering decisions, the unexpected performance bottlenecks, and the ultimate realization that frameworks exist for a reason...
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-surface-container-low text-on-surface rounded-full text-xs font-label-caps border border-outline-variant/20">Engineering</span>
                        <span className="font-body-md text-sm text-on-surface-variant">8 min read</span>
                      </div>
                      <div className="flex items-center gap-3 text-on-surface-variant">
                        <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">bookmark_add</span></button>
                        <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">more_horiz</span></button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-[160px] h-[107px] hidden sm:block overflow-hidden rounded-lg border border-outline-variant/30 shrink-0">
                    <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400&h=300" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Article Cover" />
                  </div>
                </div>
              </article>

              <div className="w-full h-px bg-outline-variant/20"></div>

              {/* Post Card 2 */}
              <article className="group cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <img src="https://i.pravatar.cc/150?img=4" className="w-6 h-6 rounded-full" alt="Author" />
                  <span className="font-body-md text-sm text-on-surface font-medium">David Park</span>
                  <span className="text-on-surface-variant text-sm">·</span>
                  <span className="font-body-md text-sm text-on-surface-variant">Oct 22</span>
                </div>
                
                <div className="flex gap-6">
                  <div className="flex-1">
                    <h2 className="font-headline-lg text-2xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      The Psychology of Colors in UX Design
                    </h2>
                    <p className="font-body-md text-on-surface-variant text-base line-clamp-3 mb-4 leading-relaxed">
                      How choosing the right palette can increase conversion rates by up to 30%, backed by recent studies from top design agencies...
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-surface-container-low text-on-surface rounded-full text-xs font-label-caps border border-outline-variant/20">Design</span>
                        <span className="font-body-md text-sm text-on-surface-variant">5 min read</span>
                      </div>
                      <div className="flex items-center gap-3 text-on-surface-variant">
                        <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">bookmark_add</span></button>
                        <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">more_horiz</span></button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Load More Button */}
              <div className="pt-8 pb-12 flex justify-center">
                <button className="px-6 py-3 border border-outline-variant rounded-full font-label-caps text-on-surface hover:bg-surface-container-low hover:border-outline transition-all flex items-center gap-2">
                  Load more articles
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </button>
              </div>

            </div>
          </main>
          
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
