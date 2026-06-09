'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  creatorOnly?: boolean;
}

export default function ProtectedRoute({ children, creatorOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (creatorOnly && user.role !== 'CREATOR') {
        router.replace('/feed');
      }
    }
  }, [user, loading, router, creatorOnly]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-primary/5 blur-3xl select-none pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] rounded-full bg-primary/5 blur-3xl select-none pointer-events-none" />
        <div className="flex flex-col items-center gap-4 z-10 animate-pulse">
          <Loader2 className="animate-spin text-primary size-10" />
          <p className="font-label-caps text-xs text-on-surface-variant font-semibold uppercase tracking-wider select-none">
            Verifying credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!user || (creatorOnly && user.role !== 'CREATOR')) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
