import React from 'react';


export default function HeroBoards() {
  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden mb-12 bg-void-black">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      {/* Neon Glows */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-celestial-blue/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-brass-dark/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-4 text-center mt-12 md:mt-20">
        <div className="mb-6 inline-block">
          <span className="px-3 py-1 border border-celestial-blue text-celestial-blue font-mono text-xs tracking-widest uppercase bg-celestial-blue/5">
            Secure_Archive_V.1.0
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight text-white uppercase italic" data-text="VISUAL DATABANKS">
          VISUAL DATABANKS
        </h1>

        <p className="text-xl text-starlight mb-8 leading-relaxed font-light max-w-2xl mx-auto">
          <span className="text-celestial-blue">&gt;</span> Accessing Excalidraw sketches and schematics.
          <br className="hidden md:block" />
          Visualizing technical concepts from the neural link.
        </p>

        <div className="glass-panel p-6 bg-deep-space/50 border-l-4 border-l-celestial-blue max-w-2xl mx-auto text-left">
          <ul className="space-y-3 font-mono text-sm text-gray-400">
            <li className="flex items-start">
              <span className="text-celestial-blue mr-2">[INFO]</span>
              <span>Each board represents a unique project cluster.</span>
            </li>
            <li className="flex items-start">
              <span className="text-brass-dark mr-2">[HINT]</span>
              <span>Interact with drawings to expand details.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Decorative Bottom Line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-celestial-blue to-transparent opacity-70"></div>
    </section>
  );
} 