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
