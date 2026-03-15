"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from '../types';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navLinks: NavLink[] = [
    { name: 'Home', href: '/' },
    { name: 'Posts', href: '/all-posts' },
    { name: 'Boards', href: '/boards' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-deep-space/70 border-b border-brass/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brass/20 to-transparent opacity-50"></div>

      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="relative group flex items-center gap-3">
            <span className="text-3xl font-serif font-bold tracking-widest text-starlight group-hover:text-brass transition-colors duration-500">
              KARIM
            </span>
            <span className="hidden sm:inline-block w-px h-6 bg-brass/20"></span>
            <span className="hidden sm:inline-block text-sm font-sans tracking-widest font-light text-starlight/50 uppercase">
              Log
            </span>
            <span className="absolute -bottom-1.5 left-0 w-0 h-[1px] bg-brass group-hover:w-full transition-all duration-500"></span>
          </Link>

          {/* Social Icons */}
          <div className="hidden md:flex items-center space-x-2 pl-6 border-l border-brass/10">
            <Link
              href="https://www.linkedin.com/in/karimalkam/"
              target="_blank"
              className="text-brass-dark hover:text-brass transition-colors duration-300"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
            </Link>
          </div>
        </div>

        {/* Desktop Links & Search */}
        <div className="hidden lg:flex items-center gap-10">
          <div className="flex space-x-8">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href) || (link.href === '/all-posts' && pathname.startsWith('/posts'));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative py-1 font-sans uppercase tracking-[0.2em] text-[11px] transition-all duration-300 ${isActive
                    ? 'text-brass font-medium'
                    : 'text-starlight/60 hover:text-brass'
                    }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 w-3/4 -translate-x-1/2 h-px bg-brass shadow-[0_0_8px_rgba(197,168,105,0.6)]"></span>
                  )}
                </Link>
              );
            })}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative group">
            <input
              type="text"
              placeholder="Search Archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-void-black/40 border border-brass/20 rounded-full text-starlight text-sm font-sans px-5 py-2 pr-10 w-48 focus:w-64 transition-all duration-500 focus:outline-none focus:border-brass/60 focus:bg-void-black/80 placeholder-starlight/30 shadow-inner"
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brass-dark group-hover:text-brass transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center lg:hidden gap-6">
          <button onClick={() => setIsMobileSearchOpen(true)} className="text-brass-dark hover:text-brass transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-starlight hover:text-brass transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu (Portal) */}
      <MobileMenuPortal>
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-deep-space/90 backdrop-blur-md z-[90]"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.4, ease: "easeOut" }}
                className="fixed inset-y-0 right-0 w-80 bg-void-black border-l border-brass/20 shadow-2xl z-[100] p-10 flex flex-col"
              >
                <button onClick={() => setIsMenuOpen(false)} className="self-end text-starlight/50 hover:text-brass mb-12 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex flex-col space-y-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-2xl font-serif tracking-widest text-starlight hover:text-brass hover:translate-x-2 transition-all duration-300"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>

                <div className="mt-auto border-t border-brass/10 pt-8">
                  <p className="text-brass-dark font-sans tracking-widest text-xs uppercase mb-6 opacity-80">Network</p>
                  <div className="flex space-x-6">
                    <Link
                      href="https://github.com/karimalkam"
                      target="_blank"
                      className="text-starlight/50 hover:text-brass transition-colors"
                      aria-label="GitHub"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                    </Link>
                    <Link
                      href="https://www.linkedin.com/in/karimalkam/"
                      target="_blank"
                      className="text-starlight/50 hover:text-brass transition-colors"
                      aria-label="LinkedIn"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </MobileMenuPortal>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-void-black/98 backdrop-blur-xl z-[60] p-6 flex flex-col pt-32"
          >
            <button onClick={() => setIsMobileSearchOpen(false)} className="absolute top-8 right-8 text-starlight/50 hover:text-brass transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <form onSubmit={handleSearchSubmit} className="w-full max-w-md mx-auto">
              <input
                autoFocus
                type="text"
                placeholder="Search the archive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b border-brass/40 text-starlight text-2xl font-serif py-4 focus:outline-none focus:border-brass placeholder-starlight/20 shadow-none transition-colors"
              />
              <p className="mt-6 text-brass-dark text-xs uppercase tracking-widest font-sans">Press Enter to Search</p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

import { createPortal } from 'react-dom';

function MobileMenuPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return typeof document !== 'undefined'
    ? createPortal(children, document.body)
    : null;
}