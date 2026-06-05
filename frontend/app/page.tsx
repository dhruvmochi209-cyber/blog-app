'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { Compass, Edit3, Activity, Sun, Moon, ArrowRight, Code2, Cpu, Globe, Zap } from 'lucide-react';

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
      <title>Writen | Join the Conversation</title>
      <meta name="description" content="The leading space for technical narratives. Writen is a collaborative, minimalist publication space for developers, designers, and systems architects to document software quality." />

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
              Writen
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
        <section className="relative overflow-hidden w-full py-16 lg:py-24">
          <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column: Hero Text */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-8"
            >
              <span className="inline-flex items-center gap-2 font-label-caps text-xs text-primary bg-primary/10 px-3.5 py-1.5 rounded-full tracking-wider uppercase font-semibold">
                <Zap className="size-3.5 text-primary" /> Volume 01 // Journal of Craftsmanship
              </span>
              <h1 className="font-display-xl text-5xl md:text-6xl lg:text-7xl font-black text-on-surface leading-[1.05] tracking-tight">
                Where technical <br />
                narratives <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-secondary font-medium">find their form.</span>
              </h1>
              <p className="font-body-lg text-lg md:text-xl text-secondary max-w-xl leading-relaxed">
                Writen is a collaborative, minimalist publication space for developers, designers, and systems architects to document software quality.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link 
                  href="/register" 
                  id="landing-startwriting-btn"
                  className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-caps text-xs font-bold uppercase tracking-wider px-8 py-4 rounded-full hover:opacity-90 active:scale-95 transition-all duration-300 shadow-md shadow-primary/20"
                >
                  <Edit3 className="size-4" />
                  Start writing
                </Link>
                <Link 
                  href="/feed" 
                  id="landing-explore-btn"
                  className="inline-flex items-center gap-2 border border-outline text-on-surface font-label-caps text-xs font-bold uppercase tracking-wider px-8 py-4 rounded-full hover:bg-surface-container-low active:scale-95 transition-all duration-300"
                >
                  <Compass className="size-4" />
                  Explore publications
                </Link>
              </div>
            </motion.div>
 
            {/* Right Column: High-Contrast Table of Contents Index */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
              className="lg:col-span-5 hidden lg:block"
            >
              <div className="bg-surface-container-low/40 border border-outline-variant/60 rounded-xl p-8 editorial-shadow space-y-6 relative overflow-hidden backdrop-blur-sm">
                
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                <div className="flex justify-between items-center border-b border-outline-variant pb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-primary animate-pulse" />
                    <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-on-surface">Index // Table of Contents</span>
                  </div>
                  <span className="font-code-sm text-xs text-on-surface-variant font-mono">p. 01–99</span>
                </div>

                <ul className="space-y-4">
                  {[
                    { num: '01', title: 'React Core Reconciliation', cat: 'React', page: 'p. 12' },
                    { num: '02', title: 'Decoupled Node.js APIs', cat: 'Node.js', page: 'p. 28' },
                    { num: '03', title: 'Type Safety in TypeScript', cat: 'TypeScript', page: 'p. 45' },
                    { num: '04', title: 'Database Index Syncing', cat: 'DevOps', page: 'p. 72' },
                    { num: '05', title: 'Minimalist Editorial UX', cat: 'System Design', page: 'p. 91' },
                  ].map((item, idx) => (
                    <motion.li 
                      key={item.num} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + idx * 0.08, duration: 0.5 }}
                      className="flex items-baseline justify-between group cursor-default p-1.5 rounded-lg hover:bg-surface-container-low/50 transition-colors"
                    >
                      <div className="flex items-baseline gap-3 flex-1 min-w-0 pr-3">
                        <span className="font-code-sm text-xs text-on-surface-variant font-mono select-none">{item.num}</span>
                        <span className="font-headline-md text-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                          {item.title}
                        </span>
                        <div className="flex-1 border-b border-dashed border-outline-variant/50 mx-2 select-none" />
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="px-2 py-0.5 bg-surface-container border border-outline-variant/20 text-on-surface-variant rounded text-[9px] font-label-caps tracking-wider uppercase font-semibold">
                          {item.cat}
                        </span>
                        <span className="font-code-sm text-xs text-on-surface-variant font-mono">{item.page}</span>
                      </div>
                    </motion.li>
                  ))}
                </ul>

                <div className="border-t border-outline-variant/60 pt-4 flex items-center justify-between text-xs text-on-surface-variant font-medium">
                  <span>Writen Journal Platform</span>
                  <span>June 2026 Edition</span>
                </div>
              </div>
            </motion.div>
 
          </div>
        </section>

        {/* Features grid section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-24 relative z-10 border-t border-outline-variant/30 bg-surface-container-low/20"
        >
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <span className="font-label-caps text-xs text-primary font-bold uppercase tracking-widest px-3.5 py-1.5 bg-primary/10 rounded-full">
                Engineered for Developers
              </span>
              <h2 className="font-headline-lg text-3xl md:text-4xl font-black text-on-surface tracking-tight uppercase">
                A platform tailored for technical content
              </h2>
              <p className="font-body-md text-secondary leading-relaxed">
                Publishing software architectural logs should not feel like writing generic blog posts. Writen is built to render high-fidelity engineering code and layouts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Code2 className="size-6 text-primary" />,
                  title: "Premium Rich-Text Workspace",
                  desc: "Draft clean Markdown and complex code blocks inside our customized TipTap workstation with instant local auto-saving."
                },
                {
                  icon: <Cpu className="size-6 text-primary" />,
                  title: "Automatic Outlining & Navigation",
                  desc: "Our interactive Table of Contents automatically parses heading hierarchy, enabling smooth vertical jumps and reading states."
                },
                {
                  icon: <Globe className="size-6 text-primary" />,
                  title: "Dynamic Meta SEO Injection",
                  desc: "Every article is compiled using React Server Components to automatically inject dynamic headers, OpenGraph, and Twitter tags."
                }
              ].map((feat, index) => (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group p-8 rounded-2xl bg-surface border border-outline-variant/40 hover:border-primary/30 transition-all duration-300 editorial-shadow hover:-translate-y-1"
                >
                  <div className="size-12 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feat.icon}
                  </div>
                  <h3 className="font-headline-md text-lg font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">
                    {feat.title}
                  </h3>
                  <p className="font-body-md text-sm text-secondary leading-relaxed font-light">
                    {feat.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Call-to-action Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="py-24 relative z-10 border-t border-outline-variant/30 text-center space-y-8 bg-radial from-primary/5 via-transparent to-transparent"
        >
          <div className="max-w-[720px] mx-auto px-6 space-y-6">
            <h2 className="font-display-xl text-3xl md:text-5xl font-black text-on-surface tracking-tight uppercase leading-none">
              Join the technical frontier
            </h2>
            <p className="font-body-lg text-secondary leading-relaxed max-w-xl mx-auto">
              Start documenting your craftsmanship, share design specs, and engage with the global engineering community.
            </p>
            <div className="pt-4">
              <Link 
                href="/register" 
                className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-caps text-xs font-bold uppercase tracking-wider px-8 py-4 rounded-full hover:opacity-90 active:scale-95 transition-all duration-300 shadow-lg shadow-primary/25"
              >
                <span>Get Started Now</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </motion.section>
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
