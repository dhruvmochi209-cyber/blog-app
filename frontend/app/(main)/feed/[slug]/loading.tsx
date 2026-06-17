import TopNavBar from '@/components/layout/TopNavBar';
import SideNavBar from '@/components/layout/SideNavBar';
import { DetailsPageSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-foreground flex flex-col relative font-body-md transition-colors duration-300">
      <TopNavBar />
      <div className="flex-1 flex w-full pt-16">
        <SideNavBar />
        <div className="flex-1 flex justify-center px-4 py-8 md:px-8">
          <main className="flex-1 max-w-[1100px] w-full min-h-[calc(100vh-61px)] flex flex-col pt-12 items-center">
            <DetailsPageSkeleton />
          </main>
        </div>
      </div>
    </div>
  );
}
