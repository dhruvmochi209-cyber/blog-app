'use client';

import { ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  brandTagline: string;
}

export function AuthLayout({ children, title, description, brandTagline }: AuthLayoutProps) {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        backgroundColor: '#0c1324',
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(173, 198, 255, 0.1) 0px, transparent 50%),
          radial-gradient(at 50% 50%, rgba(15, 23, 42, 1) 0px, transparent 100%)
        `,
      }}
    >
      <title>{title} // DevLog</title>
      <meta name="description" content={description} />

      {/* Cinematic background — architectural dark building */}
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23071428'/%3E%3Cstop offset='100%25' stop-color='%230c1f3f'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='100%25' height='100%25'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1324] via-[#0c1324]/80 to-transparent" />
      </div>

      {/* Floating particle dots */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              backgroundColor: 'rgba(173, 198, 255, 0.25)',
              left: `${(i * 5.3) % 100}%`,
              top: `${(i * 7.1) % 100}%`,
              filter: 'blur(1px)',
              animation: `float ${(i % 5) + 8}s ease-in-out infinite`,
              animationDelay: `${(i * 0.4) % 4}s`,
            }}
          />
        ))}
      </div>

      {/* Main container */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[480px]"
      >
        {/* Brand header above card */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">terminal</span>
            </div>
            <span className="font-headline-md text-2xl font-bold text-primary tracking-tight">DevLog</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
            <ShieldCheck className="size-3 text-primary" />
            <span className="font-mono text-[10px] text-primary uppercase tracking-widest">{brandTagline}</span>
          </div>
        </div>

        {/* Glass card */}
        <div className="glass-card rounded-xl p-8 relative">
          {children}
        </div>
      </motion.div>
    </main>
  );
}
