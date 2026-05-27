'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const BACKEND = 'http://localhost:5001';

// ─── Icons ─────────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ5L6Ha4PAKSJji5U_8Zt2BsvYl0FY1uG3nfQ_0nP140mRWZ_9bjpY-t7cIhkIzUDG8LHyuvRhPyqsqYnQmhgbKoO1HdDE-wvQuzM8PCpXIDfXXeLlXxdOItm3w2xetV0_xTfDXhyAzL4QvXVCQXmm4da-X8TIRChzBTGEjlyZ2t-g-FtlSsRrX1871oIMTQoPnHSwx9iBz9Ab3BHG61C7h6wFmRshNB-wzgJDrPenzR9XG8eJWGRPeu3FzbWyREmI5zFw6_oYZ1c" />
  );
}

function GitHubIcon() {
  return (
    <svg className="w-5 h-5 fill-on-surface" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/onboarding');
  }, [user, loading, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      router.push('/onboarding');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <main className="min-h-screen flex items-center justify-center pt-24 pb-12 px-margin-mobile md:px-margin-desktop relative">
      <Link href="/" className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-2 font-label-caps text-sm text-secondary hover:text-on-surface transition-colors">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Go back to Home
      </Link>
      <div className="w-full max-w-[480px] space-y-unit * 6">
        
        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-8 md:p-12 editorial-shadow relative z-10">
          
          <div className="text-center mb-10">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Welcome back</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Sign in to your Writen account.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <a href={`${BACKEND}/api/auth/google`} className="flex items-center justify-center gap-2 border border-outline-variant/50 py-3 rounded-lg hover:bg-surface-container transition-all cursor-pointer">
              <GoogleIcon />
              <span className="font-label-caps text-label-caps uppercase text-on-surface">Google</span>
            </a>
            <a href={`${BACKEND}/api/auth/github`} className="flex items-center justify-center gap-2 border border-outline-variant/50 py-3 rounded-lg hover:bg-surface-container transition-all cursor-pointer">
              <GitHubIcon />
              <span className="font-label-caps text-label-caps uppercase text-on-surface">GitHub</span>
            </a>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface-container-lowest px-4 text-on-surface-variant font-label-caps">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ada@writen.engineering"
                className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-lg font-body-md text-body-md input-focus-ring transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="password">Password</label>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-lg font-body-md text-body-md input-focus-ring transition-all"
              />
            </div>

            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm border border-error/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary-container text-on-primary-container font-label-caps text-label-caps uppercase py-4 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary font-semibold hover:underline transition-all">Create one</Link>
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}
