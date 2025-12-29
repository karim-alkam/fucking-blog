import Link from 'next/link';

export const metadata = {
  title: "BIO_DATA",
  description: "Learn more about me and my blog",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">

      {/* Header Section */}
      <section className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyber-gray z-0 transform -translate-y-1/2"></div>
        <div className="relative z-10 inline-block bg-cyber-black px-8">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 text-cyber-white glitch" data-text="ABDULLAH SALAMEH">
            ABDULLAH SALAMEH
          </h1>
          <p className="text-xl text-cyber-neon-cyan font-mono tracking-widest uppercase">
            {'// ELECTRICAL ENGINEERING STUDENT // FULL STACK DEV'}
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">

        {/* Profile / Bio - Spans 8 cols */}
        <div className="md:col-span-8 space-y-8">
          <section className="cyber-card p-8 border-l-4 border-l-cyber-neon-yellow">
            <h2 className="text-3xl font-display font-bold text-cyber-white mb-6 flex items-center">
              <span className="text-cyber-neon-yellow mr-3">&gt;</span> BIO_DATA
            </h2>
            <p className="text-gray-300 leading-relaxed text-lg mb-4">
              I&apos;m an Electrical Engineering student with a deep passion for embedded systems and control engineering.
              My journey combines the theoretical foundations of electrical engineering with practical applications
              in software development and IoT.
            </p>
            <p className="text-gray-300 leading-relaxed text-lg">
              I specialize in creating smart, efficient solutions that bridge the
              gap between hardware and software, from embedded systems to full-stack applications.
            </p>
          </section>

          <section className="cyber-card p-8 border-l-4 border-l-cyber-neon-pink">
            <h2 className="text-3xl font-display font-bold text-cyber-white mb-6 flex items-center">
              <span className="text-cyber-neon-pink mr-3">&gt;</span> OBJECTIVES
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-cyber-white font-bold mb-2 uppercase tracking-wide border-b border-cyber-gray pb-1">Focus Areas</h3>
                <ul className="space-y-2 mt-2 font-mono text-sm text-gray-400">
                  <li className="flex items-center"><span className="w-2 h-2 bg-cyber-neon-cyan mr-2"></span>Real-time embedded systems</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-cyber-neon-cyan mr-2"></span>IoT & smart devices</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-cyber-neon-cyan mr-2"></span>Full-stack architectures</li>
                </ul>
              </div>
              <div>
                <h3 className="text-cyber-white font-bold mb-2 uppercase tracking-wide border-b border-cyber-gray pb-1">Mission</h3>
                <ul className="space-y-2 mt-2 font-mono text-sm text-gray-400">
                  <li className="flex items-center"><span className="w-2 h-2 bg-cyber-neon-pink mr-2"></span>Develop innovative IoT solutions</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-cyber-neon-pink mr-2"></span>Contribute to open-source</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-cyber-neon-pink mr-2"></span>Master advanced controls</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar / Stats - Spans 4 cols */}
        <div className="md:col-span-4 space-y-6">
          {/* Socials Card */}
          <div className="cyber-card p-6 bg-cyber-dark-gray/50">
            <h3 className="text-xl font-display font-bold text-cyber-white mb-4">CONNECT_UPLINK</h3>
            <div className="flex flex-col space-y-3">
              <Link
                href="https://github.com/abda-s"
                target="_blank"
                className="flex items-center justify-between px-4 py-2 bg-cyber-black border border-cyber-gray hover:border-cyber-neon-cyan hover:text-cyber-neon-cyan transition-all group"
              >
                <span className="font-mono text-sm">GITHUB</span>
                <svg className="w-4 h-4 text-gray-500 group-hover:text-cyber-neon-cyan" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </Link>
              <Link
                href="https://www.linkedin.com/in/abdullah-salameh/"
                target="_blank"
                className="flex items-center justify-between px-4 py-2 bg-cyber-black border border-cyber-gray hover:border-cyber-neon-cyan hover:text-cyber-neon-cyan transition-all group"
              >
                <span className="font-mono text-sm">LINKEDIN</span>
                <svg className="w-4 h-4 text-gray-500 group-hover:text-cyber-neon-cyan" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
              </Link>
            </div>
          </div>

          {/* Tech Stack Card */}
          <div className="cyber-card p-6 bg-cyber-dark-gray/50">
            <h3 className="text-xl font-display font-bold text-cyber-white mb-4">TECH_STACK</h3>
            <div className="space-y-4 text-sm font-mono">
              <div>
                <span className="block text-gray-500 mb-1">HARDWARE</span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-cyber-black border border-cyber-gray text-cyber-neon-yellow">IoT</span>
                  <span className="px-2 py-1 bg-cyber-black border border-cyber-gray text-cyber-neon-yellow">C++</span>
                  <span className="px-2 py-1 bg-cyber-black border border-cyber-gray text-cyber-neon-yellow">Circuits</span>
                </div>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">SOFTWARE</span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-cyber-black border border-cyber-gray text-cyber-neon-cyan">Python</span>
                  <span className="px-2 py-1 bg-cyber-black border border-cyber-gray text-cyber-neon-cyan">TS</span>
                  <span className="px-2 py-1 bg-cyber-black border border-cyber-gray text-cyber-neon-cyan">Next.js</span>
                </div>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">TOOLS</span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-cyber-black border border-cyber-gray text-cyber-white">Docker</span>
                  <span className="px-2 py-1 bg-cyber-black border border-cyber-gray text-cyber-white">Linux</span>
                  <span className="px-2 py-1 bg-cyber-black border border-cyber-gray text-cyber-white">Git</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
