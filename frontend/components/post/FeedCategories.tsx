'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FeedCategoriesProps {
  categories: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function FeedCategories({
  categories,
  activeTab,
  onTabChange,
}: FeedCategoriesProps) {
  const allTabs = ['For you', 'Following', ...categories];
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/feed?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/feed`);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Full Width Search Bar */}
      <form onSubmit={handleSearch} className="relative flex items-center w-full h-12 shadow-sm group">
        <Search className="absolute left-4 size-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors pointer-events-none z-10" strokeWidth={2.5} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles, topics, or authors..."
          className="w-full h-full bg-[#f8f9fa] border-2 border-transparent text-[15px] rounded-full pl-12 pr-12 focus:border-primary/20 focus:bg-white focus:shadow-sm outline-none transition-all text-on-surface placeholder:text-on-surface-variant/50 font-medium"
        />
        {searchQuery && (
          <button 
            type="button"
            onClick={() => {
              setSearchQuery('');
              router.push('/feed');
            }}
            className="absolute right-3 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-700 cursor-pointer transition-colors z-10"
          >
            <X className="size-4" strokeWidth={2.5} />
          </button>
        )}
      </form>

      {/* Category Tabs - Pill Shaped */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 w-full px-1">
        {allTabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              id={`feed-tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
              className={`relative whitespace-nowrap font-body-md text-sm px-5 py-2 rounded-full transition-all duration-300 cursor-pointer select-none border outline-none font-semibold shadow-sm active:scale-95 ${
                isActive
                  ? 'bg-primary text-white border-primary shadow-primary/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}
