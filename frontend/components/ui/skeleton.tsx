import { cn } from "@/lib/utils"

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-outline-variant/20", className)}
      {...props}
    />
  )
}

export function PostCardSkeleton() {
  return (
    <div className="space-y-4 py-6 border-b border-outline-variant/20">
      <div className="flex items-center gap-3">
        <Skeleton className="w-6 h-6 rounded-full bg-outline-variant/30" />
        <Skeleton className="w-24 h-3.5 bg-outline-variant/30" />
        <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/30 animate-pulse" />
        <Skeleton className="w-12 h-3.5 bg-outline-variant/30" />
      </div>
      <div className="flex gap-6">
        <div className="flex-1 space-y-3.5">
          <Skeleton className="h-6 bg-outline-variant/30 w-11/12" />
          <Skeleton className="h-4 bg-outline-variant/20 w-full" />
          <Skeleton className="h-4 bg-outline-variant/20 w-4/5" />
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-6 bg-outline-variant/20 rounded-full" />
              <Skeleton className="w-16 h-3 bg-outline-variant/20" />
            </div>
          </div>
        </div>
        <Skeleton className="w-[140px] h-[93px] hidden sm:block bg-outline-variant/20 rounded-lg shrink-0" />
      </div>
    </div>
  )
}

export function ListingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, idx) => (
        <PostCardSkeleton key={idx} />
      ))}
    </div>
  )
}

export function DetailsPageSkeleton() {
  return (
    <div className="w-full max-w-[720px] space-y-8 py-12">
      {/* Category tag skeleton */}
      <Skeleton className="h-5 w-16 bg-outline-variant/30 rounded-full" />
      
      {/* Title skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-12 bg-outline-variant/30 w-full" />
        <Skeleton className="h-12 bg-outline-variant/30 w-3/4" />
      </div>
      
      {/* Author and metadata line skeleton */}
      <div className="flex items-center justify-between border-y border-outline-variant/30 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full bg-outline-variant/30" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 bg-outline-variant/30" />
            <Skeleton className="h-3 w-36 bg-outline-variant/25" />
          </div>
        </div>
      </div>
      
      {/* Image banner skeleton */}
      <Skeleton className="w-full aspect-[2/1] bg-outline-variant/30 rounded-xl" />
      
      {/* Body content text blocks */}
      <div className="space-y-4 pt-6">
        <Skeleton className="h-4 bg-outline-variant/20 w-full" />
        <Skeleton className="h-4 bg-outline-variant/20 w-full" />
        <Skeleton className="h-4 bg-outline-variant/20 w-11/12" />
        <Skeleton className="h-4 bg-outline-variant/20 w-full" />
        <Skeleton className="h-4 bg-outline-variant/20 w-4/5" />
        
        <div className="h-4" /> {/* spacing */}
        
        <Skeleton className="h-4 bg-outline-variant/20 w-full" />
        <Skeleton className="h-4 bg-outline-variant/20 w-full" />
        <Skeleton className="h-4 bg-outline-variant/20 w-5/6" />
      </div>
    </div>
  )
}

export function GridCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden flex flex-col animate-pulse">
      <div className="h-40 bg-outline-variant/20 w-full" />
      <div className="p-5 flex-1 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-outline-variant/30" />
          <div className="w-20 h-3 bg-outline-variant/20 rounded" />
        </div>
        <div className="space-y-2">
          <div className="w-11/12 h-5 bg-outline-variant/30 rounded" />
          <div className="w-4/5 h-5 bg-outline-variant/30 rounded" />
        </div>
        <div className="w-full h-3 bg-outline-variant/20 rounded" />
        <div className="w-2/3 h-3 bg-outline-variant/20 rounded" />
      </div>
    </div>
  );
}

export function GridListingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <GridCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function PostsTableSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="w-full flex flex-col gap-3 mt-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-5 animate-pulse flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-3 w-full sm:w-2/3">
            <Skeleton className="h-5 w-3/4 bg-outline-variant/30 rounded" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-16 bg-outline-variant/20 rounded-full" />
              <Skeleton className="h-4 w-24 bg-outline-variant/20 rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
             <Skeleton className="h-8 w-20 bg-outline-variant/30 rounded-xl" />
             <Skeleton className="h-8 w-8 bg-outline-variant/30 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-2xl flex flex-col justify-between shadow-sm animate-pulse h-32">
            <div className="flex items-center justify-between mb-4">
               <Skeleton className="h-3 w-20 bg-outline-variant/30 rounded" />
               <Skeleton className="h-8 w-8 bg-outline-variant/30 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-16 bg-outline-variant/30 rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-4 mt-8">
        <Skeleton className="h-8 w-40 bg-outline-variant/30 rounded" />
        <PostsTableSkeleton count={4} />
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="flex-1 max-w-[1100px] w-full min-h-[calc(100vh-61px)] flex flex-col">
      <div className="relative pt-32 pb-12 px-6 sm:px-12 flex flex-col items-center text-center animate-pulse">
        <div className="absolute top-0 left-0 right-0 h-48 bg-outline-variant/10 rounded-b-[3rem]" />
        <Skeleton className="relative z-10 w-32 h-32 rounded-full bg-outline-variant/30 border-4 border-surface shadow-xl mb-6" />
        <Skeleton className="h-8 w-64 bg-outline-variant/30 rounded-lg mb-3" />
        <Skeleton className="h-4 w-48 bg-outline-variant/20 rounded mb-6" />
        <Skeleton className="h-10 w-32 bg-outline-variant/30 rounded-full" />
      </div>
      
      <div className="space-y-6 px-6 sm:px-12 mt-4">
        <Skeleton className="h-6 w-40 bg-outline-variant/30 rounded" />
        <GridListingSkeleton count={3} />
      </div>
    </div>
  );
}

