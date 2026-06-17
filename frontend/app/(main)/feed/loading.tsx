import TopNavBar from '@/components/layout/TopNavBar';
import SideNavBar from '@/components/layout/SideNavBar';
import { ListingSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative font-body-md transition-colors duration-300">
      <TopNavBar />
      <div className="flex-1 flex w-full pt-16">
        <SideNavBar />
        <div className="flex-1 max-w-[1200px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          <div className="lg:col-span-8 space-y-6 pt-12">
            <ListingSkeleton count={4} />
          </div>
          <div className="hidden lg:block lg:col-span-4 pl-6 relative">
             <div className="w-full h-96 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
