import TopNavBar from '@/components/layout/TopNavBar';
import SideNavBar from '@/components/layout/SideNavBar';
import { DashboardSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative font-body-md transition-colors duration-300">
      <TopNavBar />
      <div className="flex-1 flex w-full pt-16">
        <SideNavBar />
        <div className="flex-1 flex justify-center px-4 py-8 md:px-8">
          <main className="flex-1 max-w-[1000px] w-full flex flex-col gap-8 min-h-[calc(100vh-61px)] pt-12">
            <DashboardSkeleton />
          </main>
        </div>
      </div>
    </div>
  );
}
