'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  brandTagline: string;
}

export function AuthLayout({ children, title, description, brandTagline }: AuthLayoutProps) {
  return (
    <main className="min-h-screen w-full flex bg-[#0f172a] text-white">
      <title>{title} // Application</title>
      <meta name="description" content={description} />

      {/* LEFT SIDE: Abstract Artistic Background */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)' }}
        />
        {/* Dark Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

        {/* Branding Content (Glassmorphism Card) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 w-full max-w-xl p-10 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col items-center text-center mx-auto"
        >
          <h1 className="font-serif italic text-6xl md:text-7xl font-black text-white leading-[1.1] mb-6 drop-shadow-md tracking-tight">
            Welcome to CodeNexus
          </h1>
          <p className="font-sans text-base text-indigo-50 leading-relaxed max-w-md mb-10 opacity-90">
            {title === 'Sign In'
              ? "We are so happy to have you here. It's great to see you again."
              : "Enter your personal details and start your journey with us."}
          </p>

          <Link 
            href={title === 'Sign In' ? '/register' : '/login'} 
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md transition-all cursor-pointer font-bold text-white shadow-lg shadow-black/5 hover:scale-105 active:scale-95"
          >
            {title === 'Sign In' ? 'No account yet? Signup' : 'Already have an account? Signin'}
          </Link>
        </motion.div>
      </div>

      {/* RIGHT SIDE: Authentication Form (Minimalist Dark/Light) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative bg-white overflow-y-auto text-gray-900">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[480px] p-8 sm:p-10 border border-gray-200 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white"
        >
          {/* Header/Title */}
          <div className="flex flex-col mb-10 text-left">
            <h1 className="font-display-xl text-4xl font-black tracking-tight text-gray-900 mb-2">
              {title}
            </h1>
            <p className="text-gray-500 font-body-md text-sm">
              {description}
            </p>
          </div>

          {/* Form Content */}
          <div className="w-full">
            {children}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
