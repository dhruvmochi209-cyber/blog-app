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
    <div className="flex flex-col gap-5 w-full">
      {/* Full Width Search Bar */}
      <form onSubmit={handleSearch} className="relative flex items-center w-full h-11 shadow-sm group">
        <Search className="absolute left-4 size-4 text-on-surface-variant/60 group-focus-within:text-primary transition-colors pointer-events-none z-10" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles, topics, or authors..."
          className="w-full h-full bg-surface-container-low border border-outline-variant/40 text-sm rounded-2xl pl-11 pr-10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-on-surface placeholder:text-on-surface-variant/50"
        />
        {searchQuery && (
          <button 
            type="button"
            onClick={() => {
              setSearchQuery('');
              router.push('/feed');
            }}
            className="absolute right-3 p-1.5 hover:bg-surface-variant rounded-full text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors z-10"
          >
            <X className="size-4" />
          </button>
        )}
      </form>

      {/* Category Tabs */}
      <div className="flex gap-6 overflow-x-auto no-scrollbar pb-1 w-full border-b border-outline-variant/20">
        {allTabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              id={`feed-tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
              className={`relative whitespace-nowrap font-body-md text-sm pb-2 transition-all duration-200 cursor-pointer select-none bg-transparent border-0 outline-none ${
                isActive
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
