'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { CTASection } from '@/components/landing/CTASection';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Original login redirect check:
    if (!loading && user) {
      router.push('/feed');
    }
  }, [router, user, loading]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setTheme('dark');
    }
  };

  if (loading) return null; // Avoid flashing content before redirect

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container relative transition-colors duration-300">
      {/* Hoisted document metadata for SEO */}
      <title>DevLog | Join the Conversation</title>
      <meta name="description" content="The leading space for technical narratives. DevLog is a collaborative, minimalist publication space for developers, designers, and systems architects to document software quality." />

      {/* Decorative Grid Mesh & Orb Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(at 0% 0%, rgba(24, 24, 27, 0.015) 0, transparent 50%), 
              radial-gradient(at 50% 0%, rgba(39, 39, 42, 0.025) 0, transparent 50%), 
              radial-gradient(at 100% 0%, rgba(24, 24, 27, 0.015) 0, transparent 50%)
            `
          }}
        />
        {/* Animated Radial Orbs for Premium Aesthetics */}
        <div className="absolute -top-[40%] -left-[20%] w-[80%] aspect-square rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px] pointer-events-none animate-[pulse_12s_infinite]" />
        <div className="absolute top-[20%] -right-[30%] w-[70%] aspect-square rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[150px] pointer-events-none animate-[pulse_15s_infinite]" />
      </div>

      {/* Top Navigation Bar */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center w-full px-6 transition-all duration-500 ease-in-out border-b ${
          isScrolled 
            ? 'py-3.5 glassmorphism shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-outline-variant/30' 
            : 'py-5 bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-[1280px] w-full mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-headline-md text-2xl font-black text-on-surface tracking-tight uppercase hover:text-primary transition-colors">
              DevLog
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-secondary hover:text-on-surface hover:bg-surface-container-low/40 rounded-full transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <Moon className="size-[18px]" />
              ) : (
                <Sun className="size-[18px]" />
              )}
            </button>
            <Link href="/login" id="landing-signin-btn" className="hidden sm:block font-body-md text-xs font-bold uppercase tracking-wider text-secondary hover:text-on-surface px-4 py-2 transition-colors duration-300">
              Sign in
            </Link>
            <Link href="/register" id="landing-getstarted-btn" className="bg-primary text-on-primary font-label-caps text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-full hover:opacity-90 transition-all active:scale-95 duration-300 shadow-sm shadow-primary/10">
              Get started
            </Link>
          </div>
        </div>
      </motion.header>
 
      {/* Hero Section */}
      <main className="flex-1 relative z-10 flex flex-col pt-28">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>

      {/* Minimal Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="w-full py-8 border-t border-outline-variant/30 bg-surface-container-lowest/10 relative z-20 mt-auto"
      >
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-body-md text-sm text-secondary">
            &copy; {new Date().getFullYear()} Created by Spydyy
          </p>
          <div className="flex items-center gap-6">
            <a href="https://github.com/aamir2003-star" target="_blank" rel="noopener noreferrer" className="font-body-md text-sm text-secondary hover:text-on-surface transition-colors">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/vanzara-shubham/" target="_blank" rel="noopener noreferrer" className="font-body-md text-sm text-secondary hover:text-on-surface transition-colors">
              LinkedIn
            </a>
            <a href="https://www.instagram.com/vanzara_shubham/" target="_blank" rel="noopener noreferrer" className="font-body-md text-sm text-secondary hover:text-on-surface transition-colors">
              Instagram
            </a>
          </div>
        </div>
      </motion.footer>

    </div>
  );
}
