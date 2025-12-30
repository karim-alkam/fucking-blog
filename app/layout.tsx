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
  metadataBase: new URL('https://blog.salameh.top'),
  title: {
    default: 'SYSTEM // SALAMEH',
    template: '%s // SALAMEH',
  },
  description: 'A personal engineering blog and digital garden by Abdullah Salameh. Exploring Embedded Systems, IoT, and Full Stack Development.',
  keywords: ['Electrical Engineering', 'Embedded Systems', 'IoT', 'Web Development', 'Next.js', 'Digital Garden', 'Engineering Log'],
  authors: [{ name: 'Abdullah Salameh', url: 'https://github.com/abda-s' }],
  creator: 'Abdullah Salameh',
  publisher: 'Abdullah Salameh',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://blog.salameh.top',
    title: 'SYSTEM // SALAMEH',
    description: 'A personal engineering blog and digital garden by Abdullah Salameh.',
    siteName: 'Abdullah Salameh - Engineering Log',
    images: [
      {
        url: '/A-logo-w-bg.png',
        width: 4096,
        height: 4096,
        alt: 'Abdullah Salameh - Engineering Log',
      },
    ],
  },
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
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
      </body>
    </html>
  );
}