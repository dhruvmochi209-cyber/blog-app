'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPage({ params }: EditPageProps) {
  const router = useRouter();
  const { id } = use(params);

  useEffect(() => {
    if (id) {
      router.replace(`/write?id=${id}`);
    }
  }, [id, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center font-label-caps text-xs text-on-surface-variant font-semibold uppercase tracking-wider animate-pulse select-none">
        Redirecting to editor workspace...
      </div>
    </div>
  );
}
