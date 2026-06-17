import Link from 'next/link';
import { motion } from 'framer-motion';
import { Edit3, Compass, Activity, Zap } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative w-full flex flex-col justify-center items-center text-center px-4 sm:px-6 flex-1">
      <div className="max-w-[1000px] mx-auto px-6 flex flex-col items-center text-center">

        {/* Centered Hero Text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-8 flex flex-col items-center"
        >
          <span className="inline-flex items-center gap-2 font-label-caps text-sm text-indigo-600 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full tracking-[0.2em] uppercase font-bold backdrop-blur-md">
            <Zap className="size-4 text-indigo-500" /> The Next-Gen Dev Platform
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] font-black text-gray-900 leading-[1.1] tracking-tight ">
            Share your engineering <br className="hidden md:block" />
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-[#4338ca] italic text-5xl sm:text-6xl md:text-7xl mt-2">journey to CodeNexus</div>
          </h1>
          <p className="font-body-lg text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed">
            CodeNexus is a modern blog application for software engineers, designers, and tech enthusiasts to publish articles, share coding experiences, and document their work.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 pt-4">
            <Link
              href="/register"
              id="landing-startwriting-btn"
              className="inline-flex items-center gap-2 bg-[#4f46e5] text-white font-label-caps text-xs font-bold uppercase tracking-wider px-8 py-4 rounded-full hover:bg-black active:scale-95 transition-all duration-300 shadow-sm"
            >
              <Edit3 className="size-4" />
              Create Post
            </Link>
            <Link
              href="/feed"
              id="landing-explore-btn"
              className="inline-flex items-center gap-2 bg-white text-gray-900 border border-gray-200 font-label-caps text-xs font-bold uppercase tracking-wider px-8 py-4 rounded-full hover:bg-gray-50 active:scale-95 transition-all duration-300 shadow-sm"
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
