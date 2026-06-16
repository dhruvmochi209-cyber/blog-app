'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, FileQuestion, Terminal } from 'lucide-react';

export default function NotFound() {
  const [path, setPath] = useState('');
  const [userAgent, setUserAgent] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPath(window.location.pathname);
      setUserAgent(window.navigator.userAgent.split(' ')[0] || 'BrowserAgent');

      const updateTime = () => {
        const now = new Date();
        setTime(now.toISOString().split('T')[1].slice(0, 8));
      };
      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container relative transition-colors duration-300">
      {/* hoisted document metadata */}
      <title>404: Page Unresolved // CodeNexus</title>
      <meta name="description" content="The requested path is not registered in our index. It may have been edited, archived, or is yet to be drafted." />

      {/* Decorative Grid Mesh Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: `
            radial-gradient(at 0% 0%, rgba(24, 24, 27, 0.015) 0, transparent 50%), 
            radial-gradient(at 50% 0%, rgba(39, 39, 42, 0.025) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(24, 24, 27, 0.015) 0, transparent 50%)
          `
        }}
      />

      {/* Simplified Editorial Header */}
      <header className="relative z-10 flex justify-between items-center w-full px-6 py-6 max-w-[1280px] mx-auto border-b border-outline-variant/30">
        <div className="flex items-center gap-8">
          <Link href="/" id="notfound-header-logo" className="font-headline-md text-2xl font-bold text-on-surface hover:opacity-85 transition-opacity">
            CodeNexus
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
          <span className="font-code-sm text-xs text-on-surface-variant font-mono uppercase tracking-widest">
            Index Error // 404
          </span>
        </div>
      </header>

      {/* Main 404 Area */}
      <main className="flex-1 relative z-10 flex items-center py-12 md:py-24">
        <div className="max-w-[1280px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Headline and Message */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error-container text-on-error-container border border-error/10">
              <FileQuestion className="size-4 text-error" />
              <span className="font-code-sm text-xs font-mono font-medium">ERR_PATH_UNRESOLVED</span>
            </div>

            <h1 className="font-display-xl text-5xl md:text-6xl font-bold text-on-surface leading-[1.1] tracking-tight">
              404 // Narrative <br />
              <span className="text-secondary font-medium">Out of Bounds.</span>
            </h1>

            <p className="font-body-lg text-lg md:text-xl text-secondary max-w-xl leading-relaxed">
              The editorial path you requested does not exist in our index. It may have been archived, relocated, or is yet to be drafted.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/feed"
                id="notfound-explore-feed"
                className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-caps text-xs px-8 py-3.5 rounded-full hover:opacity-90 transition-all active:scale-95 duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.05)] font-semibold"
              >
                <Compass className="size-4" />
                Explore Feed
              </Link>
              <Link
                href="/"
                id="notfound-return-home"
                className="inline-flex items-center gap-2 border border-outline text-on-surface font-label-caps text-xs px-8 py-3.5 rounded-full hover:bg-surface-container-low transition-all active:scale-95 duration-300 font-semibold"
              >
                <ArrowLeft className="size-4" />
                Return Home
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Interactive Diagnostic Report */}


        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full py-8 border-t border-outline-variant/30 relative z-20 mt-auto bg-surface-container-lowest/10">
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
            <a href="https://www.instagram.com/_vanzara_shubham/" target="_blank" rel="noopener noreferrer" className="font-body-md text-sm text-secondary hover:text-on-surface transition-colors">
              Instagram
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
