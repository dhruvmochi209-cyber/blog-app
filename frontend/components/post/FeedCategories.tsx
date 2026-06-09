'use client';

interface FeedCategoriesProps {
  categories: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  sortBy: 'latest' | 'views';
  onSortChange: (sort: 'latest' | 'views') => void;
}

export function FeedCategories({
  categories,
  activeTab,
  onTabChange,
  sortBy,
  onSortChange
}: FeedCategoriesProps) {
  const allTabs = ['For you', 'Following', ...categories];

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-6 overflow-x-auto no-scrollbar pb-1">
        {allTabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              id={`feed-tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
              className={`relative whitespace-nowrap font-body-md text-sm pb-1 transition-all duration-200 cursor-pointer select-none bg-transparent border-0 outline-none ${
                isActive
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Sort Selector */}
      <div className="shrink-0 select-none ml-4">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as 'latest' | 'views')}
          className="bg-surface-container border border-white/10 text-xs font-mono uppercase tracking-wider text-on-surface-variant hover:text-on-surface rounded-lg px-3 py-1.5 focus:border-primary focus:outline-none transition-all cursor-pointer"
        >
          <option value="latest">Latest</option>
          <option value="views">Most Viewed</option>
        </select>
      </div>
    </div>
  );
}
