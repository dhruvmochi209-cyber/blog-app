import TopNavBar from '@/components/layout/TopNavBar';
import SideNavBar from '@/components/layout/SideNavBar';
import { ProfilePageSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative font-body-md transition-colors duration-300">
      <TopNavBar />
      <div className="flex-1 flex w-full pt-16">
        <SideNavBar />
        <div className="flex-1 flex justify-center px-4 py-8 md:px-8">
          <ProfilePageSkeleton />
        </div>
      </div>
    </div>
  );
}
