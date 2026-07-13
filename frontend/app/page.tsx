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
    <div className="min-h-screen flex flex-col relative transition-colors duration-300 font-sans">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)' }}
      />
      {/* Dark Gradient Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40 z-0" />

      {/* Hoisted document metadata for SEO */}
      <title>CodeNexus | Join the Conversation</title>
      <meta name="description" content="The leading space for technical narratives. CodeNexus is a collaborative, minimalist publication space for developers, designers, and systems architects to document software quality." />

      {/* Top Navigation Bar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center w-full px-6 transition-all duration-500 ease-in-out border-b border-white/10 ${isScrolled
          ? 'py-3.5 bg-black/40 backdrop-blur-md shadow-sm'
          : 'py-5 bg-transparent'
          }`}
      >
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-serif italic text-3xl font-black text-white tracking-tight hover:text-indigo-300 transition-colors">
              CodeNexus
            </Link>
          </div>
          <div className="flex items-center gap-3">

            <Link href="/login" id="landing-signin-btn" className="hidden sm:block font-body-md text-xs font-bold uppercase tracking-wider text-white hover:text-indigo-300 px-4 py-2 transition-colors duration-300">
              Sign in
            </Link>
            <Link href="/register" id="landing-getstarted-btn" className="bg-white/10 text-white border border-white/20 font-label-caps text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-full hover:bg-white/20 transition-all active:scale-95 duration-300 shadow-sm backdrop-blur-md">
              Get started
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 flex flex-col justify-center pt-16 pb-4">
        <HeroSection />
      </main>

      {/* Minimal Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="w-full py-4 border-t border-white/10 relative z-20 mt-auto"
      >
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col sm:flex-col justify-between items-center gap-2">
          <p className="font-body-md text-sm text-white/50">
            &copy; {new Date().getFullYear()} Created by Dhruv
          </p>
        </div>
      </motion.footer>

    </div>
  );
}
