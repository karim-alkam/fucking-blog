import './globals.css';
import Navbar from './components/Navbar';
import NextTopLoader from 'nextjs-toploader';
import { Outfit, Rajdhani } from 'next/font/google';
import ChunkErrorListener from './components/ChunkErrorListener';
import { GoogleAnalytics } from '@next/third-parties/google';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const rajdhani = Rajdhani({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-rajdhani',
});

export const metadata = {
  title: {
    default: 'SYSTEM // SALAMEH',
    template: '%s // SALAMEH',
  },
  description: 'A personal blog built with love by Abdullah Salameh',
  icons: {
    icon: [
      { url: '/A-logo-small.png', type: 'image/png' },
    ],
    shortcut: '/A-logo-small.png',
    apple: '/A-logo-small.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} ${rajdhani.variable} bg-cyber-black text-cyber-white min-h-screen flex flex-col font-sans selection:bg-cyber-neon-pink selection:text-white`}>
        <NextTopLoader color="#FCEE0A" height={3} showSpinner={false} shadow="0 0 10px #FCEE0A,0 0 5px #FCEE0A" />
        <ChunkErrorListener />
        <Navbar />
        <main className="flex-1 relative z-10">
          {children}
        </main>
        <footer className="bg-cyber-dark-gray border-t border-cyber-gray py-8 mt-auto relative z-10">
          <div className="container mx-auto px-4 text-center">
            <p className="font-mono text-cyber-gray-light">
              <span className="text-cyber-neon-cyan">©</span> {new Date().getFullYear()} Salameh&apos;s Blog. All rights reserved.
            </p>
          </div>
        </footer>
        {/* Global heavy grain or grid effect could go here */}
        <GoogleAnalytics gaId="G-TSYTD07K3H" />
      </body>
    </html>
  );
}