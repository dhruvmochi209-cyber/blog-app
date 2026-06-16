'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  User,
  AlertTriangle,
  Loader2,
  Lock,
  EyeOff,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SocialLoginSection } from '@/components/auth/SocialLoginSection';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://blog-application-fjg9.onrender.com/api';
const BACKEND = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5001';

export default function RegisterPage() {
  const { user, loading, setTokenFromOAuth } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/feed');
  }, [user, loading, router]);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/auth/register/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msgs = data.errors
          ? data.errors.map((err: any) => `${err.field}: ${err.message}`)
          : [data.message];
        setErrors(msgs);
        return;
      }
      
      // Successfully registered directly
      await setTokenFromOAuth(data.accessToken);
      router.push('/feed');
    } catch {
      setErrors(['Network error. Please try again.']);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <AuthLayout
      title="Sign Up"
      description="Create a CodeNexus account to read, draft, and publish technical publications."
      brandTagline="Architect Registration"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key="register-form"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Email/Password Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-gray-500 block uppercase tracking-widest" htmlFor="username">
                FULL NAME
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 size-[18px] pointer-events-none" />
                <input
                  id="username"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jon Snow"
                  className="w-full pl-10 pr-4 py-3 bg-[#f3f4f6] border border-transparent rounded-lg font-body-md text-sm text-gray-900 placeholder:text-gray-500/30 focus:ring-2 focus:ring-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-gray-500 block uppercase tracking-widest" htmlFor="email">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 size-[18px] pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jon@codenexus.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#f3f4f6] border border-transparent rounded-lg font-body-md text-sm text-gray-900 placeholder:text-gray-500/30 focus:ring-2 focus:ring-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-gray-500 block uppercase tracking-widest" htmlFor="password">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 size-[18px] pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-[#f3f4f6] border border-transparent rounded-lg font-body-md text-sm text-gray-900 placeholder:text-gray-500/30 focus:ring-2 focus:ring-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                </button>
              </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-500/20 text-red-700 px-4 py-3 rounded-lg text-xs font-semibold border border-red-500/30 space-y-1.5 flex flex-col items-start">
                {errors.map((e, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <AlertTriangle className="size-3.5 shrink-0" />
                    <span>{e}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-4 px-6 bg-[#4f46e5] text-gray-900 font-headline-md text-base font-bold rounded-lg shadow-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <><Loader2 className="animate-spin size-4" /> Processing...</>
              ) : (
                <>Signup</>
              )}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <SocialLoginSection backendUrl={BACKEND} />
          </div>
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  );
}
