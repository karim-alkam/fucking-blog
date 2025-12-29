"use client"

import { motion } from 'framer-motion';

interface HeroProps {
  tags: string[];
}

export default function Hero({ tags }: HeroProps) {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      {/* Neon Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyber-neon-purple/20 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyber-neon-cyan/20 rounded-full blur-[128px] pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto text-center px-4">

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6 relative inline-block"
        >
          <span className="absolute -inset-1 bg-gradient-to-r from-cyber-neon-yellow via-cyber-neon-pink to-cyber-neon-cyan opacity-75 blur lg:opacity-100 transition duration-1000 group-hover:opacity-100"></span>
          <div className="relative bg-cyber-black border border-cyber-gray px-6 py-2">
            <span className="text-cyber-neon-yellow font-mono text-sm tracking-[0.3em] uppercase">System Online</span>
          </div>
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-display font-bold mb-8 leading-none tracking-tighter text-white uppercase glitch relative" data-text="WELCOME TO THE GRID">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-neon-yellow to-cyber-neon-cyan">My Blog</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed font-sans">
          Exploring the digital frontier. Sharing code, cyber-thoughts, and experiments from the edge.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {tags.map((tag, i) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="px-4 py-1.5 text-sm font-mono border border-cyber-gray text-cyber-neon-cyan hover:bg-cyber-neon-cyan/10 hover:border-cyber-neon-cyan hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer backdrop-blur-sm"
            >
              #{tag}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Decorative Bottom Line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-neon-pink to-transparent opacity-70"></div>
    </section>
  );
}