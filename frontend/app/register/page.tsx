'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  User,
  Key,
  AlertTriangle,
  Loader2,
  Lock,
  ArrowRight,
  ShieldCheck,
  EyeOff,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SocialLoginSection } from '@/components/auth/SocialLoginSection';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const BACKEND = 'http://localhost:5001';

// ─── OTP Input ─────────────────────────────────────────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, ' ').split('').slice(0, 6);

  const handleChange = (i: number, char: string) => {
    const digit = char.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = digit === ' ' ? '' : digit;
    onChange(next.join('').replace(/ /g, ''));
    if (digit && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center select-none">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d === ' ' ? '' : d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-11 h-14 text-center font-mono text-xl font-bold bg-surface-container-lowest/50 border border-white/10 rounded-lg text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all caret-primary"
        />
      ))}
    </div>
  );
}


// ─── Page ──────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const { user, loading, setTokenFromOAuth } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [pendingEmail, setPendingEmail] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/feed');
  }, [user, loading, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleInitRegister = async (e: FormEvent) => {
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
      setPendingEmail(email);
      setResendCooldown(60);
      setStep('otp');
    } catch {
      setErrors(['Network error. Please try again.']);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setErrors(['Please enter all 6 digits.']);
      return;
    }
    setErrors([]);
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/auth/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: pendingEmail, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors([data.message]);
        setOtp('');
        return;
      }
      await setTokenFromOAuth(data.accessToken);
      router.push('/feed');
    } catch {
      setErrors(['Network error. Please try again.']);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setErrors([]);
    try {
      const res = await fetch(`${API}/auth/register/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors([data.message]);
        return;
      }
      setOtp('');
      setResendCooldown(60);
    } catch {
      setErrors(['Could not resend code. Please try again.']);
    }
  };

  if (loading) return null;

  return (
    <AuthLayout
      title="Sign Up"
      description="Create a DevLog account to read, draft, and publish technical publications."
      brandTagline="Architect Registration"
    >
      <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.div
                key="register-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header */}
                <header className="mb-6 text-center md:text-left">
                  <h1 className="font-headline-md text-2xl font-bold text-on-surface mb-1.5">
                    Join the Conversation
                  </h1>
                  <p className="font-body-md text-sm text-on-surface-variant">
                    Create an account to read, draft, and publish your insights.
                  </p>
                </header>

                <SocialLoginSection backendUrl={BACKEND} />

                {/* Email/Password Form */}
                <form onSubmit={handleInitRegister} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] text-on-surface-variant block uppercase tracking-widest" htmlFor="username">
                      FULL NAME
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant size-[18px] pointer-events-none" />
                      <input
                        id="username"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jon Snow"
                        className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest/50 border border-white/10 rounded-lg font-body-md text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] text-on-surface-variant block uppercase tracking-widest" htmlFor="email">
                      EMAIL ADDRESS
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant size-[18px] pointer-events-none" />
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jon@devlog.com"
                        className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest/50 border border-white/10 rounded-lg font-body-md text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] text-on-surface-variant block uppercase tracking-widest" htmlFor="password">
                      PASSWORD
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant size-[18px] pointer-events-none" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-11 py-3 bg-surface-container-lowest/50 border border-white/10 rounded-lg font-body-md text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                      </button>
                    </div>
                  </div>

                  {/* Errors */}
                  {errors.length > 0 && (
                    <div className="bg-error-container/30 text-on-error-container px-4 py-3 rounded-lg text-xs font-semibold border border-error/20 space-y-1.5 flex flex-col items-start">
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
                    className="w-full mt-2 py-4 px-6 bg-primary text-on-primary font-headline-md text-base font-bold rounded-lg shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <><Loader2 className="animate-spin size-4" /> Processing...</>
                    ) : (
                      <>Create Account <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </form>

                {/* Sign In link */}
                <footer className="mt-6 text-center">
                  <p className="font-body-md text-sm text-on-surface-variant">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary font-semibold hover:underline decoration-primary/30 underline-offset-4 transition-all">
                      Sign In
                    </Link>
                  </p>
                </footer>
              </motion.div>
            ) : (
              <motion.div
                key="register-otp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <header className="mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary mb-4 animate-bounce">
                    <Mail className="size-5" />
                  </div>
                  <h1 className="font-headline-md text-2xl font-bold text-on-surface mb-1.5">Check your email</h1>
                  <p className="font-body-md text-sm text-on-surface-variant mb-3">
                    We sent a 6-digit verification code to:
                  </p>
                  <div className="text-xs bg-surface-container px-3.5 py-1.5 rounded-full inline-block text-on-surface-variant font-bold border border-white/10">
                    <span className="text-on-surface font-semibold">{pendingEmail}</span>
                  </div>
                </header>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-on-surface-variant block text-center uppercase tracking-widest">Enter 6-Digit Code</label>
                    <OtpInput value={otp} onChange={setOtp} />
                  </div>

                  {errors.length > 0 && (
                    <div className="bg-error-container/30 text-on-error-container px-4 py-3 rounded-lg text-xs font-semibold border border-error/20 text-center flex items-center justify-center gap-1.5">
                      <AlertTriangle className="size-4 shrink-0" />
                      <span>{errors[0]}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || otp.length < 6}
                    className="w-full py-4 px-6 bg-primary text-on-primary font-headline-md text-base font-bold rounded-lg shadow-lg shadow-primary/10 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? <><Loader2 className="animate-spin size-4" /> Verifying...</> : 'Verify & Complete'}
                  </button>
                </form>

                <div className="mt-8 text-center flex flex-col gap-3 pt-6 border-t border-white/10">
                  <p className="font-body-md text-xs text-on-surface-variant font-medium">
                    Didn't receive the email?{' '}
                    {resendCooldown > 0 ? (
                      <span className="font-bold">Resend in {resendCooldown}s</span>
                    ) : (
                      <button
                        onClick={handleResend}
                        className="text-primary font-bold hover:underline bg-transparent border-0 cursor-pointer outline-none"
                      >
                        Resend code
                      </button>
                    )}
                  </p>
                  <button
                    onClick={() => { setStep('form'); setOtp(''); setErrors([]); }}
                    className="font-mono text-[10px] text-on-surface-variant/80 hover:text-on-surface transition-colors cursor-pointer outline-none uppercase tracking-widest"
                  >
                    ← Change email address
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
    </AuthLayout>
  );
}
