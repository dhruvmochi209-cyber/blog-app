'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Mail, 
  Key, 
  AlertTriangle, 
  Loader2, 
  ChevronLeft, 
  Check,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

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
          className="
            w-11 h-14 text-center font-code-sm text-xl font-bold
            bg-surface border border-outline-variant/40 rounded-lg text-on-surface
            focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none
            transition-all caret-primary
          "
        />
      ))}
    </div>
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <img alt="Google" className="w-4.5 h-4.5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ5L6Ha4PAKSJji5U_8Zt2BsvYl0FY1uG3nfQ_0nP140mRWZ_9bjpY-t7cIhkIzUDG8LHyuvRhPyqsqYnQmhgbKoO1HdDE-wvQuzM8PCpXIDfXXeLlXxdOItm3w2xetV0_xTfDXhyAzL4QvXVCQXmm4da-X8TIRChzBTGEjlyZ2t-g-FtlSsRrX1871oIMTQoPnHSwx9iBz9Ab3BHG61C7h6wFmRshNB-wzgJDrPenzR9XG8eJWGRPeu3FzbWyREmI5zFw6_oYZ1c" />
  );
}

function GitHubIcon() {
  return (
    <svg className="w-4.5 h-4.5 fill-on-surface" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  // Sign In States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (!loading && user) router.replace('/onboarding');
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
      router.push('/onboarding');
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to dispatch verification code');
      }
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotEmail,
          otp: forgotOtp,
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to configure new password');
      }

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
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center pt-24 pb-12 px-margin-mobile md:px-margin-desktop relative select-none selection:bg-primary-container selection:text-on-primary-container transition-colors duration-300">
      {/* hoisted document metadata for SEO */}
      <title>Sign In // Writen</title>
      <meta name="description" content="Sign in to your Writen account to read and publish technical narratives." />

      {/* Back Button */}
      <Link 
        href="/" 
        id="login-back-btn"
        className="absolute top-8 left-6 md:top-12 md:left-12 inline-flex items-center gap-2 font-label-caps text-xs font-bold uppercase tracking-wider text-secondary hover:text-on-surface transition-all duration-200 cursor-pointer group"
      >
        <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
        Go back to Home
      </Link>
      
      <div className="w-full max-w-[480px]">
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 md:p-12 shadow-md relative z-10">
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
                <div className="text-center mb-10 select-none">
                  <h1 className="font-display-xl text-3xl font-black text-on-surface tracking-tight mb-2">Welcome back</h1>
                  <p className="font-body-md text-sm text-on-surface-variant font-light">Sign in to your Writen account.</p>
                </div>

                {/* Third-Party Integrations */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <a href={`${BACKEND}/api/auth/google`} className="flex items-center justify-center gap-2.5 border border-outline-variant/30 py-3 rounded-full hover:bg-surface-container hover:border-outline transition-all cursor-pointer shadow-xs active:scale-[0.98] duration-200">
                    <GoogleIcon />
                    <span className="font-label-caps text-[10px] font-bold uppercase tracking-widest text-on-surface">Google</span>
                  </a>
                  <a href={`${BACKEND}/api/auth/github`} className="flex items-center justify-center gap-2.5 border border-outline-variant/30 py-3 rounded-full hover:bg-surface-container hover:border-outline transition-all cursor-pointer shadow-xs active:scale-[0.98] duration-200">
                    <GitHubIcon />
                    <span className="font-label-caps text-[10px] font-bold uppercase tracking-widest text-on-surface">GitHub</span>
                  </a>
                </div>

                {/* Divider Line */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/30"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold text-on-surface-variant/80">
                    <span className="bg-surface-container-low px-4 font-label-caps">or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-label-caps text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block" htmlFor="email">Email address</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ada@writen.engineering"
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl font-body-md text-sm input-focus-ring focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-on-surface outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="font-label-caps text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block" htmlFor="password">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPasswordView(true);
                          setForgotError('');
                          setForgotSuccess('');
                        }}
                        className="font-label-caps text-[10px] font-bold uppercase tracking-wider text-primary hover:underline transition-all cursor-pointer bg-transparent border-0 outline-none"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl font-body-md text-sm input-focus-ring focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-on-surface outline-none"
                    />
                  </div>

                  {error && (
                    <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-xs font-semibold border border-error/15 flex items-start gap-2 animate-pulse">
                      <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary text-on-primary font-label-caps text-xs font-bold uppercase tracking-wider py-4 rounded-full hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="animate-spin size-4" />}
                    Sign In
                  </button>
                </form>

                <div className="mt-8 text-center border-t border-outline-variant/20 pt-6">
                  <p className="font-body-md text-sm text-on-surface-variant font-light">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary font-bold hover:underline transition-all">Create one</Link>
                  </p>
                </div>
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
                <div className="text-center mb-10 select-none">
                  <div className="w-12 h-12 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto text-primary mb-4">
                    <Key className="size-5" />
                  </div>
                  <h1 className="font-display-xl text-3xl font-black text-on-surface tracking-tight mb-2">Reset Password</h1>
                  <p className="font-body-md text-sm text-on-surface-variant font-light">Enter your email to request a secure 6-digit recovery code.</p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-label-caps text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block" htmlFor="forgot-email">Email address</label>
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="ada@writen.engineering"
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl font-body-md text-sm input-focus-ring focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-on-surface outline-none"
                    />
                  </div>

                  {forgotError && (
                    <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-xs font-semibold border border-error/15 flex items-start gap-2">
                      <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="w-full bg-primary text-on-primary font-label-caps text-xs font-bold uppercase tracking-wider py-4 rounded-full hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {forgotSubmitting && <Loader2 className="animate-spin size-4" />}
                    Send Verification Code
                  </button>
                </form>

                <div className="mt-8 text-center border-t border-outline-variant/20 pt-6">
                  <button
                    type="button"
                    onClick={resetRecoveryWizard}
                    className="text-primary font-bold hover:underline transition-all cursor-pointer bg-transparent border-0 font-label-caps text-xs uppercase tracking-wider outline-none"
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
                <div className="text-center mb-8 select-none">
                  <div className="w-12 h-12 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto text-primary mb-4 animate-bounce">
                    <Mail className="size-5" />
                  </div>
                  <h1 className="font-display-xl text-2xl font-black text-on-surface tracking-tight mb-2">Check Your Email</h1>
                  <p className="font-body-md text-sm text-on-surface-variant font-light">We sent a 6-digit recovery code to:</p>
                  <div className="font-body-sm text-xs bg-surface-container px-3.5 py-1.5 rounded-full inline-block mt-3.5 text-on-surface-variant font-bold border border-outline-variant/25">
                    <span className="text-on-surface font-semibold">{forgotEmail}</span>{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep('email');
                        setForgotOtp('');
                        setForgotSuccess('');
                        setForgotError('');
                      }}
                      className="text-primary hover:underline ml-1 cursor-pointer bg-transparent border-0 outline-none font-black"
                    >
                      (Change)
                    </button>
                  </div>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-3">
                    <label className="font-label-caps text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block text-center">Enter 6-Digit Code</label>
                    <OtpInput value={forgotOtp} onChange={setForgotOtp} />
                  </div>

                  <div className="space-y-2">
                    <label className="font-label-caps text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block" htmlFor="new-password">New Password</label>
                    <input
                      id="new-password"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl font-body-md text-sm input-focus-ring focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-on-surface outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-label-caps text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block" htmlFor="confirm-new-password">Confirm New Password</label>
                    <input
                      id="confirm-new-password"
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl font-body-md text-sm input-focus-ring focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-on-surface outline-none"
                    />
                  </div>

                  {/* Real-time Requirements checklist grid */}
                  <div className="bg-surface-container border border-outline-variant/20 rounded-xl p-4.5 space-y-2.5">
                    <p className="font-label-caps text-[9px] font-bold text-on-surface-variant/80 tracking-widest block uppercase mb-1">Security Checklist</p>
                    
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className={`size-4 rounded-full flex items-center justify-center ${hasMinLength ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                        {hasMinLength ? <Check className="size-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                      </span>
                      <span className={hasMinLength ? 'text-on-surface' : 'text-on-surface-variant/70 font-light'}>At least 8 characters</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className={`size-4 rounded-full flex items-center justify-center ${hasUppercase ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                        {hasUppercase ? <Check className="size-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                      </span>
                      <span className={hasUppercase ? 'text-on-surface' : 'text-on-surface-variant/70 font-light'}>At least one uppercase letter</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className={`size-4 rounded-full flex items-center justify-center ${hasLowercase ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                        {hasLowercase ? <Check className="size-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                      </span>
                      <span className={hasLowercase ? 'text-on-surface' : 'text-on-surface-variant/70 font-light'}>At least one lowercase letter</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className={`size-4 rounded-full flex items-center justify-center ${hasNumber ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                        {hasNumber ? <Check className="size-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                      </span>
                      <span className={hasNumber ? 'text-on-surface' : 'text-on-surface-variant/70 font-light'}>At least one digit/number</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold border-t border-outline-variant/20 pt-2.5 mt-2">
                      <span className={`size-4 rounded-full flex items-center justify-center ${passwordsMatch ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                        {passwordsMatch ? <Check className="size-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                      </span>
                      <span className={passwordsMatch ? 'text-on-surface' : 'text-on-surface-variant/70 font-light'}>Passwords match</span>
                    </div>
                  </div>

                  {forgotSuccess && (
                    <div className="bg-primary/5 text-primary px-4 py-3 rounded-xl text-xs font-semibold border border-primary/25 text-center">
                      {forgotSuccess}
                    </div>
                  )}

                  {forgotError && (
                    <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-xs font-semibold border border-error/15 text-center">
                      {forgotError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={forgotSubmitting || !isResetSubmitEnabled}
                    className="w-full bg-primary text-on-primary font-label-caps text-xs font-bold uppercase tracking-wider py-4 rounded-full hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {forgotSubmitting && <Loader2 className="animate-spin size-4" />}
                    Reset Password
                  </button>
                </form>

                <div className="mt-8 text-center flex flex-col gap-2 border-t border-outline-variant/20 pt-6 select-none">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={forgotSubmitting}
                    className="text-primary font-bold hover:underline text-[10px] uppercase tracking-wider bg-transparent border-0 cursor-pointer disabled:opacity-50 outline-none"
                  >
                    Resend Verification Code
                  </button>
                  <button
                    type="button"
                    onClick={resetRecoveryWizard}
                    className="text-on-surface-variant hover:text-on-surface font-semibold hover:underline text-xs bg-transparent border-0 cursor-pointer outline-none"
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
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="text-center space-y-6 py-6 select-none"
              >
                <div className="w-16 h-16 bg-primary/5 border border-primary/10 rounded-full flex items-center justify-center mx-auto text-primary animate-bounce">
                  <CheckCircle2 className="size-7" />
                </div>
                <div className="space-y-2">
                  <h1 className="font-display-xl text-2xl font-black text-on-surface tracking-tight">Password Updated</h1>
                  <p className="font-body-md text-sm text-on-surface-variant font-light max-w-xs mx-auto leading-relaxed">
                    Your new password has been successfully configured.
                  </p>
                </div>
                <div className="bg-primary/5 text-primary px-4 py-3 rounded-full text-xs font-bold uppercase tracking-wider border border-primary/20 max-w-xs mx-auto">
                  Returning to Sign In in {countdown}s...
                </div>
                <button
                  type="button"
                  onClick={resetRecoveryWizard}
                  className="font-label-caps text-xs uppercase tracking-wider text-primary hover:underline font-bold block mx-auto cursor-pointer bg-transparent border-0 mt-4 outline-none"
                >
                  Sign In Immediately
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
