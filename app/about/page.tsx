import Link from 'next/link';
import AnalyticsEvents from '../components/AnalyticsEvents';

import { Metadata } from 'next';
import { SITE_CONFIG, BASE_URL } from '../lib/constants';

export const metadata: Metadata = {
  title: "Biography",
  description: "Electrical Engineering student passionate about the semiconductor industry. Exploring chips, circuits, and technical writing.",
  openGraph: {
    title: "Biography // KARIM",
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
    title: "Biography // KARIM",
    description: "Electrical Engineering student passionate about the semiconductor industry.",
    images: ['/A-logo-w-bg.png'],
    creator: SITE_CONFIG.twitterHandle,
  },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <AnalyticsEvents eventName="about_view" />

      {/* Header Section */}
      <section className="text-center mb-24 relative">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brass/20 to-transparent z-0 transform -translate-y-1/2"></div>
        <div className="relative z-10 inline-block bg-deep-space px-12">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-starlight tracking-wide">
            Karim Alkam
          </h1>
          <p className="text-lg text-brass font-sans tracking-[0.3em] font-light uppercase">
            Electrical Engineering &middot; Semiconductors
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">

        {/* Profile / Bio - Spans 8 cols */}
        <div className="md:col-span-8 space-y-10">
          <section className="glass-panel p-10 border-t border-t-brass/40">
            <h2 className="text-4xl font-serif font-bold text-starlight mb-8 flex items-center italic">
              Biography
            </h2>
            <p className="text-aged-parchment leading-loose text-lg mb-6 font-light">
              I am an Electrical Engineering student with a deep fascination for the semiconductor industry. 
              From the physics of transistors to the complexity of modern VLSI design, I am passionate about exploring how we 
              push the boundaries of silicon to power the future.
            </p>
            <p className="text-aged-parchment leading-loose text-lg font-light">
              This digital archive serves as a repository for my notes, findings, and technical explorations. 
              It is a space where I document interesting phenomena, layout system architectures, and maintain an ongoing 
              log of my professional and personal projects.
            </p>
          </section>

          <section className="glass-panel p-10 border-t border-t-celestial-blue/40">
            <h2 className="text-4xl font-serif font-bold text-starlight mb-8 flex items-center italic">
              Fields of Interest
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-brass font-sans text-sm uppercase tracking-widest mb-4 pb-2 border-b border-brass/20">Domains</h3>
                <ul className="space-y-3 mt-4 font-sans text-[15px] font-light text-starlight/80">
                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-celestial-blue mr-3 opacity-70"></span>Semiconductor Fabrication</li>
                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-celestial-blue mr-3 opacity-70"></span>Digital IC Design</li>
                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-celestial-blue mr-3 opacity-70"></span>Computer Architecture</li>
                </ul>
              </div>
              <div>
                <h3 className="text-brass font-sans text-sm uppercase tracking-widest mb-4 pb-2 border-b border-brass/20">Miscellanea</h3>
                <ul className="space-y-3 mt-4 font-sans text-[15px] font-light text-starlight/80">
                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-brass-dark mr-3 opacity-70"></span>Technical Writing</li>
                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-brass-dark mr-3 opacity-70"></span>Systems Engineering</li>
                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-brass-dark mr-3 opacity-70"></span>Digital Archives</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar / Stats - Spans 4 cols */}
        <div className="md:col-span-4 space-y-8">
          {/* Socials Card */}
          <div className="glass-panel p-8 bg-void-black/40">
            <h3 className="text-2xl font-serif italic text-starlight mb-6">Network Connect</h3>
            <div className="flex flex-col space-y-4">
              <Link
                href="https://www.linkedin.com/in/karimalkam/"
                target="_blank"
                className="flex items-center justify-between px-5 py-3 bg-void-black border border-brass/20 hover:border-brass/60 text-starlight/70 hover:text-brass transition-all duration-300 group rounded-sm"
              >
                <span className="font-sans font-light tracking-widest uppercase text-xs">LinkedIn</span>
                <svg className="w-4 h-4 text-brass-dark group-hover:text-brass transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
              </Link>
            </div>
          </div>

          {/* Tech Stack Card */}
          <div className="glass-panel p-8 bg-void-black/40">
            <h3 className="text-2xl font-serif italic text-starlight mb-6">Capabilities</h3>
            <div className="space-y-6 text-sm font-sans">
              <div>
                <span className="block text-brass-dark uppercase tracking-widest text-[10px] mb-3 border-b border-brass/10 pb-1">Hardware</span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-void-black border border-brass/20 text-starlight/80 rounded-sm font-light">VLSI</span>
                  <span className="px-3 py-1 bg-void-black border border-brass/20 text-starlight/80 rounded-sm font-light">FPGA</span>
                  <span className="px-3 py-1 bg-void-black border border-brass/20 text-starlight/80 rounded-sm font-light">ASIC</span>
                </div>
              </div>
              <div>
                <span className="block text-brass-dark uppercase tracking-widest text-[10px] mb-3 border-b border-brass/10 pb-1">Software</span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-void-black border border-celestial-blue/30 text-starlight/80 rounded-sm font-light">Verilog</span>
                  <span className="px-3 py-1 bg-void-black border border-celestial-blue/30 text-starlight/80 rounded-sm font-light">Python</span>
                  <span className="px-3 py-1 bg-void-black border border-celestial-blue/30 text-starlight/80 rounded-sm font-light">Linux</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
