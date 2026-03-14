import Link from 'next/link';
import AnalyticsEvents from '../components/AnalyticsEvents';

import { Metadata } from 'next';
import { SITE_CONFIG, BASE_URL } from '../lib/constants';

export const metadata: Metadata = {
  title: "BIO_DATA",
  description: "Electrical Engineering student passionate about the semiconductor industry. Exploring chips, circuits, and random tech experiments.",
  openGraph: {
    title: "BIO_DATA // KARIM",
    description: "Electrical Engineering student passionate about the semiconductor industry.",
    url: `${BASE_URL}/about`,
    siteName: SITE_CONFIG.title,
    images: [
      {
        url: '/A-logo-w-bg.png',
        width: 4096,
        height: 4096,
        alt: 'Karim Alkam - Bio',
      },
    ],
    type: 'profile',
  },
  twitter: {
    card: 'summary_large_image',
    title: "BIO_DATA // KARIM",
    description: "Electrical Engineering student passionate about the semiconductor industry.",
    images: ['/A-logo-w-bg.png'],
    creator: SITE_CONFIG.twitterHandle,
  },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <AnalyticsEvents eventName="about_view" />

      {/* Header Section */}
      <section className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyber-gray z-0 transform -translate-y-1/2"></div>
        <div className="relative z-10 inline-block bg-cyber-black px-8">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 text-cyber-white glitch" data-text="KARIM ALKAM">
            KARIM ALKAM
          </h1>
          <p className="text-xl text-cyber-neon-cyan font-mono tracking-widest uppercase">
            {'// ELECTRICAL ENGINEERING STUDENT // SEMICONDUCTOR ENTHUSIAST'}
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
              I&apos;m an Electrical Engineering student with a deep fascination for the semiconductor industry. 
              From the physics of transistors to the complexity of modern VLSI design, I love exploring how we 
              push the boundaries of silicon.
            </p>
            <p className="text-gray-300 leading-relaxed text-lg">
              This blog is mostly just for fun—a digital corner where I dump random things I find interesting, 
              from technical deep-dives to whatever experiments I&apos;m currently messing with.
            </p>
          </section>

          <section className="cyber-card p-8 border-l-4 border-l-cyber-neon-pink">
            <h2 className="text-3xl font-display font-bold text-cyber-white mb-6 flex items-center">
              <span className="text-cyber-neon-pink mr-3">&gt;</span> INTERESTS
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-cyber-white font-bold mb-2 uppercase tracking-wide border-b border-cyber-gray pb-1">Technical Focus</h3>
                <ul className="space-y-2 mt-2 font-mono text-sm text-gray-400">
                  <li className="flex items-center"><span className="w-2 h-2 bg-cyber-neon-cyan mr-2"></span>Semiconductor Fabrication</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-cyber-neon-cyan mr-2"></span>Digital IC Design</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-cyber-neon-cyan mr-2"></span>Computer Architecture</li>
                </ul>
              </div>
              <div>
                <h3 className="text-cyber-white font-bold mb-2 uppercase tracking-wide border-b border-cyber-gray pb-1">Randomness</h3>
                <ul className="space-y-2 mt-2 font-mono text-sm text-gray-400">
                  <li className="flex items-center"><span className="w-2 h-2 bg-cyber-neon-pink mr-2"></span>Obscure Tech Trivia</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-cyber-neon-pink mr-2"></span>Experimental Hacks</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-cyber-neon-pink mr-2"></span>Digital Gardening</li>
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
                href="https://www.linkedin.com/in/karimalkam/"
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
            <h3 className="text-xl font-display font-bold text-cyber-white mb-4">SYSTEM_SPECS</h3>
            <div className="space-y-4 text-sm font-mono">
              <div>
                <span className="block text-gray-500 mb-1">HARDWARE</span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-cyber-black border border-cyber-gray text-cyber-neon-yellow">VLSI</span>
                  <span className="px-2 py-1 bg-cyber-black border border-cyber-gray text-cyber-neon-yellow">FPGA</span>
                  <span className="px-2 py-1 bg-cyber-black border border-cyber-gray text-cyber-neon-yellow">ASIC</span>
                </div>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">SOFTWARE</span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-cyber-black border border-cyber-gray text-cyber-neon-cyan">Verilog</span>
                  <span className="px-2 py-1 bg-cyber-black border border-cyber-gray text-cyber-neon-cyan">Python</span>
                  <span className="px-2 py-1 bg-cyber-black border border-cyber-gray text-cyber-neon-cyan">Linux</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
