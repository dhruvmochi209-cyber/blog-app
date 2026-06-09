import Link from 'next/link';
import { motion } from 'framer-motion';
import { Edit3, Compass, Activity, Zap } from 'lucide-react';

export function HeroSection() {
  return (
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
            DevLog is a collaborative, minimalist publication space for developers, designers, and systems architects to document software quality.
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
              <span>DevLog Journal Platform</span>
              <span>June 2026 Edition</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
