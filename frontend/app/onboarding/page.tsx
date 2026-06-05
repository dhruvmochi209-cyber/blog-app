'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Palette, Rocket, Cpu, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const categories = [
    {
      name: "Engineering",
      icon: <Code2 className="size-5.5 text-primary" />,
      tags: ["React", "Node.js", "System Design", "DevOps", "Python", "GraphQL", "WebAssembly", "Rust", "TypeScript", "Docker"]
    },
    {
      name: "Design",
      icon: <Palette className="size-5.5 text-primary" />,
      tags: ["UX", "UI", "Typography", "Figma", "Design Systems", "Accessibility", "Motion Design", "Branding"]
    },
    {
      name: "Product",
      icon: <Rocket className="size-5.5 text-primary" />,
      tags: ["Strategy", "Management", "Agile", "User Research", "Metrics", "Growth", "Analytics"]
    },
    {
      name: "AI & Machine Learning",
      icon: <Cpu className="size-5.5 text-primary" />,
      tags: ["LLMs", "Computer Vision", "NLP", "MLOps", "Deep Learning", "Generative AI"]
    }
  ];

  const allTags = categories.flatMap(c => c.tags);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const selectAll = () => setSelectedTags(allTags);
  const clearAll = () => setSelectedTags([]);

  const handleComplete = () => {
    // TODO: send selected tags to backend
    router.push('/feed');
  };

  // Calculate selection progress percent (up to 3 tags = 100%)
  const progressPercent = Math.min(100, (selectedTags.length / 3) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary-container selection:text-on-primary-container transition-colors duration-300">
      {/* hoisted document metadata for SEO */}
      <title>Welcome // Onboarding Writen</title>
      <meta name="description" content="Personalize your Writen feed. Select your fields of interest from engineering, design, systems architecture, products, and AI." />

      {/* Glassmorphic Header */}
      <header className="border-b border-outline-variant/30 py-4.5 px-6 flex justify-between items-center bg-background/85 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <Link href="/feed" className="font-headline-md text-xl font-bold text-on-surface tracking-tight hover:opacity-85 transition-opacity">
          Writen
        </Link>
        <span className="font-label-caps text-xs text-on-surface-variant font-bold uppercase tracking-wider select-none">
          Personalize your feed
        </span>
      </header>

      {/* Main Form Area */}
      <main className="flex-1 max-w-[800px] w-full mx-auto px-6 py-12 md:py-16 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 select-none"
        >
          <h1 className="font-display-xl text-3xl md:text-4xl font-black text-on-surface tracking-tight mb-3">
            What are your interests?
          </h1>
          <p className="font-body-md text-base text-on-surface-variant font-light">
            Choose at least <strong className="font-semibold text-primary">3 topics</strong> to align your narrative index feed.
          </p>
          <div className="flex gap-4 mt-5">
            <button 
              onClick={selectAll} 
              className="font-label-caps text-xs font-bold uppercase tracking-wider text-primary hover:underline transition-colors focus:outline-none"
            >
              Select all
            </button>
            {selectedTags.length > 0 && (
              <button 
                onClick={clearAll} 
                className="font-label-caps text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
              >
                Clear all
              </button>
            )}
          </div>
        </motion.div>

        {/* Categories grid */}
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="space-y-12"
        >
          {categories.map((category, catIdx) => (
            <motion.div
              key={category.name}
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } }
              }}
              className="border-b border-outline-variant/15 last:border-b-0 pb-8 last:pb-0"
            >
              <div className="flex items-center gap-3 mb-6 pb-2 select-none">
                <div className="p-2 bg-primary/5 rounded-xl border border-primary/10">
                  {category.icon}
                </div>
                <h2 className="font-headline-md text-xl font-bold text-on-surface tracking-tight">
                  {category.name}
                </h2>
              </div>
              
              <div className="flex flex-wrap gap-2.5">
                {category.tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  
                  return (
                    <motion.button 
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      id={`onboarding-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`
                        px-4.5 py-2.5 rounded-full font-body-md text-sm transition-all flex items-center gap-1.5 border select-none cursor-pointer font-medium
                        ${isSelected 
                          ? 'bg-primary text-on-primary border-primary shadow-xs' 
                          : 'bg-surface border-outline-variant/40 text-on-surface-variant hover:border-primary/50 hover:text-on-surface hover:bg-surface-container-low/40'
                        }
                      `}
                    >
                      {tag}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="inline-flex items-center justify-center"
                          >
                            <Check className="size-3.5" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 glassmorphism py-4.5 px-6 z-40">
        {/* Dynamic selection progress bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-outline-variant/20">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="max-w-[800px] w-full mx-auto flex items-center justify-between select-none">
          <div>
            <p className="font-label-caps text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              Selected:{' '}
              <span className={`font-black ${selectedTags.length >= 3 ? 'text-primary' : 'text-on-surface'}`}>
                {selectedTags.length}
              </span>{' '}
              / {allTags.length} {selectedTags.length < 3 && <span className="text-[10px] text-secondary font-medium tracking-normal normal-case">(select 3 min)</span>}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/feed')}
              id="onboarding-skip-btn"
              className="px-5 py-2.5 rounded-full font-label-caps text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer outline-none"
            >
              Skip
            </button>
            
            <button 
              onClick={handleComplete}
              disabled={selectedTags.length < 3}
              id="onboarding-continue-btn"
              className={`px-6 py-2.5 rounded-full font-label-caps text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer outline-none ${
                selectedTags.length >= 3
                  ? 'bg-primary text-on-primary hover:opacity-90 active:scale-95 shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed border border-outline-variant/20'
              }`}
            >
              Continue to Feed
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
