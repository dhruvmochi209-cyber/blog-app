'use client';

import { Suspense } from 'react';
import OAuthCallbackInner from './callback-inner';

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Completing sign-in…</p>
        </div>
      }
    >
      <OAuthCallbackInner />
    </Suspense>
  );
}
