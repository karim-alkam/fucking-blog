"use client"

import { motion } from 'framer-motion';
import HomeGraph from './HomeGraph';

interface HeroProps {
  tags: string[];
}

export default function Hero({ tags }: HeroProps) {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-10">
      {/* Soft Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-celestial-blue/10 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brass/10 rounded-full blur-[128px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* LEFT COLUMN: GRAPH */}
          <div className="w-full h-auto lg:h-[600px] order-2 relative">
            <HomeGraph />
          </div>

          {/* RIGHT COLUMN: CONTENT */}
          <div className="text-center lg:text-left order-1 flex flex-col items-center lg:items-start glass-panel p-8 md:p-12 lg:bg-transparent lg:border-none lg:shadow-none lg:backdrop-blur-none bg-void-black/40">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-6 relative inline-block mx-auto lg:mx-0"
            >
              <div className="relative border-b border-brass/50 pb-2">
                <span className="text-brass font-serif italic text-lg tracking-widest text-shadow-sm">Chronicles of a Digital Mind</span>
              </div>
            </motion.div>

            <div className="relative mb-6">
              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight tracking-wide text-starlight relative z-10 drop-shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              >
                Welcome to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-brass via-brass-dark to-brass inline-block mt-2">The Archive</span>
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.8 }}
              className="text-xl text-aged-parchment/80 mb-10 max-w-lg font-light leading-relaxed font-sans"
            >
              Exploring the intricate machinery of the modern world. Sharing observations, code, and systems architecture from the quiet void.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4"
            >
              {tags.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="px-4 py-1.5 text-sm font-sans tracking-wide border border-brass/30 text-brass hover:bg-brass/10 hover:border-brass/70 transition-all cursor-pointer rounded-sm backdrop-blur-sm"
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brass/30 to-transparent"></div>
    </section>
  );
}