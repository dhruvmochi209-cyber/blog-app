import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
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
  );
}
