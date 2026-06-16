'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  loading?: boolean;
  icon: LucideIcon;
  colorClass: string;
  iconColorClass: string;
}

export function StatCard({
  title,
  value,
  loading = false,
  icon: Icon,
  colorClass,
  iconColorClass
}: StatCardProps) {
  return (
    <div className="bg-surface-container-low border border-outline-variant/25 p-6 rounded-2xl flex items-center justify-between shadow-xs hover:border-outline transition-all duration-300 relative group overflow-hidden">
      <div className={`absolute right-0 top-0 w-24 h-24 rounded-full translate-x-8 -translate-y-8 blur-xl group-hover:scale-110 transition-transform select-none pointer-events-none ${colorClass}`} />
      <div className="space-y-1 z-10">
        <span className="font-label-caps text-xs tracking-widest text-on-surface-variant font-bold uppercase block">
          {title}
        </span>
        <p className="text-3xl font-bold text-on-surface leading-none tracking-tight">
          {loading ? '—' : value.toLocaleString()}
        </p>
      </div>
      <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 z-10 border ${iconColorClass}`}>
        <Icon className="size-5" />
      </div>
    </div>
  );
}
