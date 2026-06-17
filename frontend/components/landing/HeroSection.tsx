import Link from 'next/link';
import { motion } from 'framer-motion';
import { Edit3, Compass, Activity, Zap } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative w-full flex flex-col justify-center items-center text-center px-4 sm:px-6 flex-1 overflow-hidden py-24">
      {/* Background Image matching AuthLayout */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)' }}
      />
      {/* Dark Gradient Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-[#0f172a]/50" />

      <div className="relative z-10 max-w-[1000px] mx-auto flex flex-col items-center text-center">

        {/* Centered Hero Text inside Glassmorphism Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full p-10 md:p-16 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col items-center"
        >
          <span className="inline-flex items-center gap-2 font-label-caps text-sm text-indigo-300 bg-indigo-500/10 border border-indigo-400/20 px-4 py-2 rounded-full tracking-[0.2em] uppercase font-bold backdrop-blur-md mb-8">
            <Zap className="size-4 text-indigo-400" /> The Next-Gen Dev Platform
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-[5rem] font-black text-white leading-[1.05] tracking-tight mb-6">
            Share your engineering <br className="hidden md:block" />
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-100 italic text-7xl mt-2">journey to CodeNexus</div>
          </h1>
          <p className="font-body-lg text-base md:text-lg text-indigo-50 max-w-2xl leading-relaxed opacity-90 mb-10">
            CodeNexus is a modern blog application for software engineers, designers, and tech enthusiasts to publish articles, share coding experiences, and document their work.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link
              href="/register"
              id="landing-startwriting-btn"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white font-label-caps text-xs font-bold uppercase tracking-wider px-8 py-4 rounded-full hover:bg-indigo-500 active:scale-95 transition-all duration-300 shadow-lg shadow-indigo-600/20"
            >
              <Edit3 className="size-4" />
              Create Post
            </Link>
            <Link
              href="/feed"
              id="landing-explore-btn"
              className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 backdrop-blur-md font-label-caps text-xs font-bold uppercase tracking-wider px-8 py-4 rounded-full hover:bg-white/20 active:scale-95 transition-all duration-300 shadow-sm"
            >
              <Compass className="size-4" />
              Browse Articles
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
