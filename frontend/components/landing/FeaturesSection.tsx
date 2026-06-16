import { motion } from 'framer-motion';
import { Code2, Cpu, Globe } from 'lucide-react';

export function FeaturesSection() {
  return (
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
            Publishing software architectural logs should not feel like writing generic blog posts. CodeNexus is built to render high-fidelity engineering code and layouts.
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
  );
}
