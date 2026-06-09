'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Key,
  AlertTriangle,
  Loader2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SocialLoginSection } from '@/components/auth/SocialLoginSection';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const BACKEND = 'http://localhost:5001';

// ─── OTP Segmented Input Component ───────────────────────────────────────────
interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
}

function OtpInput({ value, onChange }: OtpInputProps) {
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
export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  // Sign In States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Forgot Password Steps: 'email' | 'otp' | 'success'
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'success'>('email');
  const [forgotEmail, setForgotEmail] = useState('');

  // Forgot Password Validation & Input States
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Real-time password verification rules
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmNewPassword;
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && passwordsMatch;

  const isResetSubmitEnabled = isPasswordValid && forgotOtp.length === 6;

  useEffect(() => {
    if (!loading && user) router.replace('/feed');
  }, [user, loading, router]);

  // Timed redirect back to login state upon success
  useEffect(() => {
    if (forgotStep !== 'success') return;
    if (countdown <= 0) {
      setIsForgotPasswordView(false);
      setForgotStep('email');
      setForgotEmail('');
      setForgotOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
      setForgotSuccess('');
      setForgotError('');
      setCountdown(3);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [forgotStep, countdown]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      router.push('/feed');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotSubmitting(true);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to dispatch verification code');
      setForgotStep('otp');
      setForgotSuccess(data.message || 'We sent a 6-digit verification code to your email.');
    } catch (err: unknown) {
      setForgotError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!isResetSubmitEnabled) return;
    setForgotError('');
    setForgotSuccess('');
    setForgotSubmitting(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: forgotOtp, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to configure new password');
      setForgotStep('success');
      setForgotSuccess(data.message || 'Password successfully reset!');
    } catch (err: unknown) {
      setForgotError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setForgotSubmitting(false);
    }
  };

  const resetRecoveryWizard = () => {
    setIsForgotPasswordView(false);
    setForgotStep('email');
    setForgotEmail('');
    setForgotOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotSuccess('');
    setForgotError('');
  };

  if (loading) return null;

  return (
    <AuthLayout
      title="Sign In"
      description="Sign in to your DevLog account to read and publish technical narratives."
      brandTagline="Secure Authentication"
    >
      <AnimatePresence mode="wait">

            {/* 1. CORE SIGN IN VIEW */}
            {!isForgotPasswordView && (
              <motion.div
                key="signin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header */}
                <header className="mb-6">
                  <h1 className="font-headline-md text-2xl font-bold text-on-surface mb-1.5">
                    Welcome Back, Architect.
                  </h1>
                  <p className="font-body-md text-sm text-on-surface-variant">
                    Log in to manage your stories and track your precision flow.
                  </p>
                </header>

                <SocialLoginSection backendUrl={BACKEND} />

                {/* Email/Password Form */}
                <form onSubmit={handleLogin} className="space-y-4">
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
                        placeholder="architect@devlog.io"
                        className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest/50 border border-white/10 rounded-lg font-body-md text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="font-mono text-[10px] text-on-surface-variant block uppercase tracking-widest" htmlFor="password">
                        PASSWORD
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPasswordView(true);
                          setForgotError('');
                          setForgotSuccess('');
                        }}
                        className="font-mono text-[10px] text-primary hover:underline uppercase tracking-widest cursor-pointer bg-transparent border-0 outline-none"
                      >
                        FORGOT PASSWORD?
                      </button>
                    </div>
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

                  {/* Error */}
                  {error && (
                    <div className="bg-error-container/30 text-on-error-container px-4 py-3 rounded-lg text-xs font-semibold border border-error/20 flex items-start gap-2">
                      <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    id="login-submit-btn"
                    disabled={submitting}
                    className="w-full mt-2 py-4 px-6 bg-primary text-on-primary font-headline-md text-base font-bold rounded-lg shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <><Loader2 className="animate-spin size-4" /> Authenticating...</>
                    ) : (
                      <>Sign In <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </form>

                {/* Sign Up link */}
                <footer className="mt-6 text-center">
                  <p className="font-body-md text-sm text-on-surface-variant">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary font-semibold hover:underline decoration-primary/30 underline-offset-4 transition-all">
                      Sign Up
                    </Link>
                  </p>
                </footer>
              </motion.div>
            )}

            {/* 2. FORGOT PASSWORD: REQUEST EMAIL STEP */}
            {isForgotPasswordView && forgotStep === 'email' && (
              <motion.div
                key="forgot-email"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <header className="mb-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary mb-4">
                    <Key className="size-5" />
                  </div>
                  <h1 className="font-headline-md text-2xl font-bold text-on-surface mb-1.5">Reset Password</h1>
                  <p className="font-body-md text-sm text-on-surface-variant">Enter your email to request a secure 6-digit recovery code.</p>
                </header>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] text-on-surface-variant block uppercase tracking-widest" htmlFor="forgot-email">EMAIL ADDRESS</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant size-[18px] pointer-events-none" />
                      <input
                        id="forgot-email"
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="architect@devlog.io"
                        className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest/50 border border-white/10 rounded-lg font-body-md text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {forgotError && (
                    <div className="bg-error-container/30 text-on-error-container px-4 py-3 rounded-lg text-xs font-semibold border border-error/20 flex items-start gap-2">
                      <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="w-full py-4 px-6 bg-primary text-on-primary font-headline-md text-base font-bold rounded-lg shadow-lg shadow-primary/10 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {forgotSubmitting && <Loader2 className="animate-spin size-4" />}
                    Send Verification Code
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={resetRecoveryWizard}
                    className="font-mono text-[10px] text-primary hover:underline uppercase tracking-widest cursor-pointer bg-transparent border-0 outline-none"
                  >
                    Back to Sign In
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3. FORGOT PASSWORD: ENTER OTP & NEW PASSWORD STEP */}
            {isForgotPasswordView && forgotStep === 'otp' && (
              <motion.div
                key="forgot-otp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <header className="mb-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary mb-4 animate-bounce">
                    <Mail className="size-5" />
                  </div>
                  <h1 className="font-headline-md text-2xl font-bold text-on-surface mb-1.5">Check Your Email</h1>
                  <p className="font-body-md text-sm text-on-surface-variant mb-3">We sent a 6-digit recovery code to:</p>
                  <div className="text-xs bg-surface-container px-3.5 py-1.5 rounded-full inline-block text-on-surface-variant font-bold border border-white/10">
                    <span className="text-on-surface font-semibold">{forgotEmail}</span>{' '}
                    <button
                      type="button"
                      onClick={() => { setForgotStep('email'); setForgotOtp(''); setForgotSuccess(''); setForgotError(''); }}
                      className="text-primary hover:underline ml-1 cursor-pointer bg-transparent border-0 outline-none font-black"
                    >
                      (Change)
                    </button>
                  </div>
                </header>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-on-surface-variant block text-center uppercase tracking-widest">Enter 6-Digit Code</label>
                    <OtpInput value={forgotOtp} onChange={setForgotOtp} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] text-on-surface-variant block uppercase tracking-widest" htmlFor="new-password">New Password</label>
                    <input
                      id="new-password"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-surface-container-lowest/50 border border-white/10 rounded-lg font-body-md text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] text-on-surface-variant block uppercase tracking-widest" htmlFor="confirm-new-password">Confirm New Password</label>
                    <input
                      id="confirm-new-password"
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-surface-container-lowest/50 border border-white/10 rounded-lg font-body-md text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Security checklist */}
                  <div className="bg-surface-container/60 border border-white/5 rounded-lg p-4 space-y-2">
                    <p className="font-mono text-[9px] font-bold text-on-surface-variant/80 tracking-widest uppercase mb-1">Security Checklist</p>
                    {[
                      { pass: hasMinLength, label: 'At least 8 characters' },
                      { pass: hasUppercase, label: 'One uppercase letter' },
                      { pass: hasLowercase, label: 'One lowercase letter' },
                      { pass: hasNumber, label: 'One digit / number' },
                      { pass: passwordsMatch, label: 'Passwords match', divider: true },
                    ].map(({ pass, label, divider }) => (
                      <div key={label} className={`flex items-center gap-2 text-xs font-semibold ${divider ? 'border-t border-white/5 pt-2 mt-2' : ''}`}>
                        <span className={`size-4 rounded-full flex items-center justify-center ${pass ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                          {pass ? <Check className="size-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                        </span>
                        <span className={pass ? 'text-on-surface' : 'text-on-surface-variant/70 font-light'}>{label}</span>
                      </div>
                    ))}
                  </div>

                  {forgotSuccess && (
                    <div className="bg-primary/10 text-primary px-4 py-3 rounded-lg text-xs font-semibold border border-primary/20 text-center">
                      {forgotSuccess}
                    </div>
                  )}
                  {forgotError && (
                    <div className="bg-error-container/30 text-on-error-container px-4 py-3 rounded-lg text-xs font-semibold border border-error/20 text-center">
                      {forgotError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={forgotSubmitting || !isResetSubmitEnabled}
                    className="w-full py-4 px-6 bg-primary text-on-primary font-headline-md text-base font-bold rounded-lg shadow-lg shadow-primary/10 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {forgotSubmitting && <Loader2 className="animate-spin size-4" />}
                    Reset Password
                  </button>
                </form>

                <div className="mt-6 text-center flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleSendOtp as any}
                    disabled={forgotSubmitting}
                    className="font-mono text-[10px] text-primary hover:underline uppercase tracking-widest cursor-pointer bg-transparent border-0 outline-none disabled:opacity-50"
                  >
                    Resend Verification Code
                  </button>
                  <button
                    type="button"
                    onClick={resetRecoveryWizard}
                    className="text-on-surface-variant hover:text-on-surface text-xs cursor-pointer bg-transparent border-0 outline-none"
                  >
                    Back to Sign In
                  </button>
                </div>
              </motion.div>
            )}

            {/* 4. FORGOT PASSWORD: RESET SUCCESS SCREEN */}
            {isForgotPasswordView && forgotStep === 'success' && (
              <motion.div
                key="forgot-success"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="text-center space-y-5 py-6 select-none"
              >
                <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto text-primary animate-bounce">
                  <CheckCircle2 className="size-7" />
                </div>
                <div className="space-y-2">
                  <h1 className="font-headline-md text-2xl font-bold text-on-surface">Password Updated</h1>
                  <p className="font-body-md text-sm text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                    Your new password has been successfully configured.
                  </p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-3 rounded-full text-xs font-bold uppercase tracking-wider border border-primary/20 max-w-xs mx-auto font-mono">
                  Returning to Sign In in {countdown}s...
                </div>
                <button
                  type="button"
                  onClick={resetRecoveryWizard}
                  className="font-mono text-[10px] uppercase tracking-widest text-primary hover:underline font-bold block mx-auto cursor-pointer bg-transparent border-0 mt-4 outline-none"
                >
                  Sign In Immediately
                </button>
              </motion.div>
            )}

          </AnimatePresence>
    </AuthLayout>
  );
}
